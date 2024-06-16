import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI;
let models = new Map();

export async function getGenAI(serviceUniqueId) {
  const settingsEndpoint = `http://localhost:${process.env.VM_PORT}/settings/${serviceUniqueId}`;
  const response = await fetch(settingsEndpoint);
  const settings = response.json();

  genAI = new GoogleGenerativeAI(settings.GOOGLE_API_KEY);
  return genAI;
}

export async function infer(
  modelId,
  serviceUniqueId,
  context,
  message,
  functions
) {
  const model = await getModel(modelId, serviceUniqueId);
  const result = await model.generateContent([context, message]);

  return result.response.text();
}

async function getModel(modelId, serviceUniqueId) {
  if (models.get(modelId)) {
    return models.get(modelId);
  } else {
    const genAI = await getGenAI(serviceUniqueId);
    const model = genAI.getGenerativeModel({
      model: modelId,
    });
    models.set(modelId, model);
    return model;
  }
}
