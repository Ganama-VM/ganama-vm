import express from "express";
import { infer } from "./core/core.js";

const modelIds = ["gemini-1.5-flash", "gemini-1.0-pro", "gemini-1.5-pro"];

const services = modelIds.map((modelId) => {
  return {
    type: "llm",
    id: modelId,
    functions: [],
  };
});

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

app.post("/llms/:modelId", async (req, res) => {
  const applicationId = req.headers["X-ApplicationId"];
  const response = await infer(
    req.params.modelId,
    `${applicationId}.${req.params.modelId}`,
    req.body.context,
    req.body.message,
    req.body.functions
  );
  res.status(200).json({ response });
});

app.listen(PORT, () => {
  console.log(`Ganama Gemini App listening on port ${PORT}.`);
});
