import express from "express";
import { infer, onSettingsChanged } from "./core/core.js";
import pThrottle from "p-throttle";

const modelIds = ["gemini-1.5-flash", "gemini-1.0-pro", "gemini-1.5-pro"];

const services = modelIds.map((modelId) => {
  return {
    type: "llm",
    id: modelId,
    functions: [],
  };
});

process.env.VM_PORT = 3002;
const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.json());

app.get("/services", (_req, res) => {
  res.status(200).json(services);
});

app.get("/services/:serviceId/default-settings", async (_req, res) => {
  res.status(200).json({
    GOOGLE_API_KEY: "",
  });
});

app.post("/services/:serviceId/settings", (req, res) => {
  onSettingsChanged(req.body);
  res.status(200).send();
});

const throttledInfer = pThrottle({
  limit: 360,
  interval: 60_000,
})(infer);

app.post("/llms/:modelId", async (req, res) => {
  const identity = {
    topic: req.get("X-Topic"),
    team: req.get("X-Team"),
    agent: req.get("X-Agent"),
    layerNumber: parseInt(req.get("X-LayerNumber")),
    serviceUniqueId: req.get("X-ServiceUniqueId"),
  };

  const response = await throttledInfer(
    req.params.modelId,
    identity,
    [
      {
        role: "user",
        parts: [
          {
            text: req.body.context,
          },
        ],
      },
      ...req.body.messages.map((message) => {
        return {
          role: "user",
          parts: [
            {
              text: message,
            },
          ],
        };
      }),
    ],
    req.body.functions
  );
  res.status(200).send(response);
});

app.listen(PORT, () => {
  console.log(`Ganama Gemini App listening on port ${PORT}.`);
});
