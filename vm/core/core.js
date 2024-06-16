import fs from "fs";
import ymlFrontMatter from "yaml-front-matter";
const { loadFront } = ymlFrontMatter;

const applications = [];
const services = [];
let settings = {};

const SETTINGS_FILE = "/ganama/settings.json";

export function getSettings() {
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

export function setSettingForService(serviceUniqueId, key, value) {
  const currentServiceSettings = settings[serviceUniqueId] ?? {};
  currentServiceSettings[key] = value;

  settings[serviceUniqueId] = currentServiceSettings;
  const settingsJson = JSON.stringify(settings);
  fs.writeFileSync(SETTINGS_FILE, settingsJson, { flag: "w" });
}

export function getSettingsForService(serviceUniqueId) {
  return settings[serviceUniqueId] ?? {};
}

function getApplications() {
  if (applications) {
    return applications;
  } else {
    applications.push(
      ...JSON.parse(fs.readFileSync("/ganama/config.json").toString())
        .applications
    );
  }
}

async function loadServicesForApp(application) {
  const response = await fetch(`${application.url}/services`);
  const servicesForApp = await response.json();
  services.push(
    ...servicesForApp.map((service) => {
      return {
        ...service,
        applicationId: application.id,
        appUrl: application.url,
        uniqueId: `${application.id}.${service.id}`,
      };
    })
  );
}

export async function loadServices() {
  const promises = getApplications().map(loadServicesForApp);
  return Promise.all(promises);
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
  const layer = fs.readFileSync(
    `/ganama/orchestration/${team}/${agent}/${layerNr}.md`
  );
  return loadFront(layer);
}

function getLayerFunctions(serviceUniqueIds) {
  const out = [];
  const layerServices = serviceUniqueIds.map((serviceUniqueId) =>
    services.find((service) => service.uniqueId === serviceUniqueId)
  );
  for (const layerService of layerServices) {
    out.push(layerService.functions);
  }

  return out;
}

async function infer(layerContent, message, layerFunctions, llmService) {
  const response = await fetch(`${llmService.appUrl}/llms/${llmService.id}`, {
    body: JSON.stringify({
      settings: getSettingsForService(llmService.uniqueId),
      context: layerContent,
      message,
      functions: layerFunctions.map((func) => {
        return {
          ...func,
          appUrl: llmService.appUrl,
        };
      }),
    }),
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response.text();
}

export async function messageLayer(team, agent, layerNr, message) {
  const layer = getAgentLayer(team, agent, layerNr);
  if (!layer.llm) {
    throw new Error("Given layer does not specify an LLM to infer with.");
  } else {
    const llmService = getLlmServiceWithId(layer.llm);
    const layerFunctions = layer.services
      ? getLayerFunctions(layer.services)
      : [];

    return infer(layer.__content, message, layerFunctions, llmService);
  }
}
