import { GoogleGenerativeAI } from "@google/generative-ai";

const ganamaVmHost = `${process.env.VM_HOST ?? "ganama-vm"}:${
  process.env.VM_PORT ?? "3002"
}`;

let genAI;
let models = new Map();

export async function getGenAI(serviceUniqueId) {
  if (genAI) {
    return genAI;
  } else {
    const settingsEndpoint = `http://${ganamaVmHost}/api/settings/${serviceUniqueId}`;
    const response = await fetch(settingsEndpoint);
    const settings = await response.json();
    onSettingsChanged(settings);

    return genAI;
  }
}

export function onSettingsChanged(newSettings) {
  models = new Map();
  genAI = new GoogleGenerativeAI(newSettings.GOOGLE_API_KEY);
}

export async function infer(modelId, identity, messages, functions) {
  const nextMessages = [...messages];

  const model = await getModel(modelId, identity.serviceUniqueId);
  const result = await model.generateContent({
    contents: nextMessages,
    tools: {
      functionDeclarations: functions.map((func) => {
        return {
          description: func.description,
          parameters: func.parameters,
          name: func.path,
        };
      }),
    },
  });

  if (result.response.functionCalls()) {
    for (const functionCall of result.response.functionCalls()) {
      nextMessages.push({
        role: "model",
        parts: [
          {
            functionCall,
          },
        ],
      });

      try {
        const functionCallResult = await callFunction(
          identity.topic,
          functionCall.name,
          functions,
          functionCall.args,
          identity,
        );

        if(functionCallResult === 'MESSAGE_RECEIVED') {
          return functionCallResult;
        } else {
          nextMessages.push({
            role: "function",
            parts: [
              {
                functionResponse: {
                  name: functionCall.name,
                  response: {
                    response: functionCallResult,
                  },
                },
              },
            ],
          });
        }
      } catch (e) {
        nextMessages.push({
          role: "function",
          parts: [
            {
              functionResponse: {
                name: functionCall.name,
                response: {
                  error: `${e}`,
                },
              },
            },
          ],
        });
      }

      return infer(modelId, identity, nextMessages, functions);
    }
  } else {
    return result.response.text();
  }
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

async function callFunction(topic, functionName, functions, body, identity) {
  const functionToCall = functions.find((func) => func.path === functionName);
  console.log(functionToCall);

  let queryParams = "";
  if (functionToCall.method === "GET" && functionToCall.parameters) {
    queryParams = Object.keys(body)
      .map((key) => `${key}=${body[key]}`)
      .join("&");
  }

  const response = await fetch(`${functionToCall.url}?${queryParams}`, {
    method: functionToCall.method,
    body: functionToCall.method === "GET" ? undefined : JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      "X-ServiceUniqueId": functionToCall.serviceUniqueId,
      "X-Team": identity.team,
      "X-Agent": identity.agent,
      "X-LayerNumber": identity.layerNumber,      
      "X-Topic": topic,      
      Host: new URL(functionToCall.url).hostname,
    },
  });

  return response.text();
}
