import { Router } from "express";
import {
  getServices,
  getSettingsForService,
  messageLayer,
  setSettingForService,
} from "./core/core.js";

export const apiRouter = Router();

apiRouter.get("/services", (_, res) => {
  res.status(200).json(getServices());
});

apiRouter.get("/settings/:serviceUniqueId", (req, res) => {
  res.status(200).json(getSettingsForService(req.params.serviceUniqueId));
});

apiRouter.post("/settings/:serviceUniqueId/:key", async (req, res) => {
  setSettingForService(
    req.params.serviceUniqueId,
    req.params.key,
    req.body.value
  );

  res.status(200).send();
});

apiRouter.post("/messages/:teamId/:agent/:layerNr", async (req, res) => {
  try {
    const response = await messageLayer(
      req.get("X-Topic"),
      req.params.teamId,
      req.params.agent,
      parseInt(req.params.layerNr),
      req.body.messages
    );
    res.status(200).send(response);
  } catch (error) {
    res
      .status(500)
      .json({ message: error?.message ?? "An unknown error occurred" });
  }
});
