import { loadServices, messageLayer } from "./core/core.js";
import express from "express";

const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.json());

app.post("/messages/:teamId/:agent/:layerNr", async (req, res) => {
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
      .json({ message: error?.message ?? "An unknown error occurre.d" });
  }
});

(async () => {
  await loadServices();
  app.listen(PORT, () => {
    console.log(`Ganama cream ready. App listening on ${PORT}.`);
  });
})();
