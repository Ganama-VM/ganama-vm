import { db, config as dbConfig, resetConnection } from "./db.js";

const ganamaVmHost = `${process.env.VM_HOST ?? "ganama-vm"}:${
  process.env.VM_PORT ?? "3002"
}`;

let settings;

export async function onSettingsChanged(newSettings) {
  await resetConnection();

  dbConfig["user"] = newSettings.USER;
  dbConfig["password"] = newSettings.PASSWORD;
  dbConfig["server"] = newSettings.SERVER;
  dbConfig["database"] = newSettings.DATABASE;

  settings = newSettings;
}

export async function ensureSettingsFetched(serviceUniqueId) {
  console.log(serviceUniqueId);
  if (settings) {
    return settings;
  } else {
    const settingsEndpoint = `http://${ganamaVmHost}/api/settings/${serviceUniqueId}`;
    const response = await fetch(settingsEndpoint);
    const settings = await response.json();
    console.log(settings);
    onSettingsChanged(settings);
  }
}

export async function runQuery(tx, query) {
  const request = await tx.timed_request();
  const response = await request.query(query);
  return response.recordset;
}
