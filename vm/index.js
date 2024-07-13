import {
  getServices,
  getSettingsForService,
  loadServices,
  messageLayer,
  setSettingForService,
} from "./core/core.js";
import express, { Router } from "express";

const PORT = process.env.PORT || 3002;

const app = express();

const apiRouter = Router();

apiRouter.get("/services", (_, res) => {
  res.status(200).json(getServices());
});

apiRouter.get("/settings/:serviceUniqueId", (req, res) => {
  res.status(200).json(getSettingsForService(req.params.serviceUniqueId));
});

apiRouter.post("/settings/:serviceUniqueId/:key", (req, res) => {
  res
    .status(200)
    .json(
      setSettingForService(
        req.params.serviceUniqueId,
        req.params.key,
        req.body.value
      )
    );
});

apiRouter.post("/messages/:teamId/:agent/:layerNr", async (req, res) => {
  try {
    const response = await messageLayer(
      req.params.teamId,
      req.params.agent,
      req.params.layerNr,
      req.body.message
    );
    res.status(200).json(response);
  } catch (error) {
    res
      .status(500)
      .json({ message: error?.message ?? "An unknown error occurred" });
  }
});

app.use(express.json());
app.use("/api", apiRouter);
app.use("/", express.static("./public"));

(async () => {
  await loadServices();
  app.listen(PORT, () => {
    console.log(`Ganama cream ready. App listening on ${PORT}.`);
  });
})();
