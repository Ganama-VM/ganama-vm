import { loadServices } from "./core/core.js";
import express from "express";
import { webhooksRouter } from "./webhooks.router.js";
import { apiRouter } from "./api.router.js";

const main = async () => {
  const PORT = process.env.PORT || 3002;
  await loadServices();

  const app = express();

  app.use("/webhooks", webhooksRouter);

  app.use(express.json());
  app.use("/api", apiRouter);
  app.use("/", express.static("./public"));

  app.listen(PORT, () => {
    console.log(`Ganama cream ready. App listening on ${PORT}.`);
  });
};

main();
