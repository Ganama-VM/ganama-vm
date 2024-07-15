import fs from "fs";
import { join } from "path";
import ymlFrontMatter from "yaml-front-matter";
const { loadFront } = ymlFrontMatter;

let applications;
let settings;

const services = [];

const SETTINGS_FILE = join("ganama", ".ganama", "settings.json");

function getSettings() {
  if (settings) {
    return settings;
  } else {
    try {
      settings = JSON.parse(fs.readFileSync(SETTINGS_FILE).toString());
      return settings;
    } catch (error) {
      return {};
    }
  }
}

function notifyServiceSettingsChanged(serviceUniqueId, newSettings) {
  const service = services.find(
    (service) => service.uniqueId === serviceUniqueId
  );
  return fetch(`${service.appUrl}/services/${service.id}/settings`, {
    method: "POST",
    body: JSON.stringify(newSettings),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function getServiceDefaultSettings(service) {
  const response = await fetch(
    `${service.appUrl}/services/${service.id}/default-settings`
  );
  if (response.ok) {
    return response.json();
  } else {
    return {};
  }
}

function setSettingsForService(serviceUniqueId, serviceSettings) {
  settings[serviceUniqueId] = serviceSettings;
  const settingsJson = JSON.stringify(settings);
  fs.writeFileSync(SETTINGS_FILE, settingsJson, { flag: "w" });
}

export function setSettingForService(serviceUniqueId, key, value) {
  const currentServiceSettings = getSettingsForService(serviceUniqueId);
  currentServiceSettings[key] = value;

  setSettingsForService(serviceUniqueId, currentServiceSettings);
  return notifyServiceSettingsChanged(serviceUniqueId, currentServiceSettings);
}

export function getSettingsForService(serviceUniqueId) {
  return getSettings()[serviceUniqueId] ?? {};
}

export function getApplications() {
  if (applications) {
    return applications;
  } else {
    const path = join(process.cwd(), "ganama", ".ganama", "config.json");
    applications = JSON.parse(fs.readFileSync(path).toString()).applications;
    return applications;
  }
}

async function loadServicesForApp(application) {
  const response = await fetch(`${application.url}/services`);
  const servicesForApp = await response.json();
  services.push(
    ...servicesForApp.map((service) => {
      const serviceUniqueId = `${application.id}.${service.id}`;
      return {
        ...service,
        applicationId: application.id,
        appUrl: application.url,
        uniqueId: serviceUniqueId,
        functions: service.functions.map((func) => {
          return {
            ...func,
            serviceUniqueId,
            url: `${application.url}/services/${service.id}/api/${func.path}`,
          };
        }),
      };
    })
  );
}

export async function loadServices() {
  const promises = getApplications().map(loadServicesForApp);
  await Promise.all(promises);

  const settings = getSettings();
  for (const service of services) {
    const defaultSettings = await getServiceDefaultSettings(service);
    settings[service.uniqueId] = {
      ...defaultSettings,
      ...(settings[service.uniqueId] ?? {}),
    };
  }
}

function getLlmServiceWithId(uniqueId) {
  for (const service of services) {
    if (service.type === "llm" && service.uniqueId === uniqueId) {
      return service;
    }
  }

  throw new Error("Could not find llm service with given id.");
}

function getAgentLayer(team, agent, layerNr) {
  const folderPath = join("ganama", team, agent);
  const filesInDir = fs.readdirSync(folderPath);
  const layerFilename = filesInDir.sort()[layerNr];
  if (layerFilename) {
    const layer = fs.readFileSync(join(folderPath, layerFilename));
    return loadFront(layer);
  } else {
    throw new Error("Could not find target layer");
  }
}

function getLayerFunctions(serviceUniqueIds) {
  const out = [];
  const layerServices = serviceUniqueIds.map((serviceUniqueId) =>
    services.find((service) => service.uniqueId === serviceUniqueId)
  );
  for (const layerService of layerServices) {
    out.push(...layerService.functions);
  }

  return out;
}

async function infer(
  topic,
  layerContent,
  messages,
  layerFunctions,
  llmService,
  identity
) {
  const response = await fetch(`${llmService.appUrl}/llms/${llmService.id}`, {
    body: JSON.stringify({
      settings: getSettingsForService(llmService.uniqueId),
      context: layerContent,
      messages,
      functions: layerFunctions.map((func) => {
        return {
          ...func,
          appUrl: llmService.appUrl,
        };
      }),
    }),
    method: "POST",
    headers: {
      "X-ServiceUniqueId": llmService.uniqueId,
      "X-Team": identity.team,
      "X-Agent": identity.agent,
      "X-LayerNumber": identity.layerNumber,
      "X-Topic": topic,
      "Content-Type": "application/json",
    },
  });

  return response.text();
}

export async function messageLayer(topic, team, agent, layerNumber, messages) {
  const layer = getAgentLayer(team, agent, layerNumber);
  if (!layer.llm) {
    throw new Error("Given layer does not specify an LLM to infer with.");
  } else {
    const llmService = getLlmServiceWithId(layer.llm);

    const layerFunctions = getLayerFunctions([
      ...(layer.services ?? []),
      "ganama-services.messaging",
    ]);

    return infer(topic, layer.__content, messages, layerFunctions, llmService, {
      team,
      agent,
      layerNumber,
    });
  }
}

export function getServices() {
  return services;
}
