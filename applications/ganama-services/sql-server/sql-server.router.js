import { Router } from "express";
import { withTransaction } from "./db.js";
import {
  ensureSettingsFetched,
  onSettingsChanged,
  runQuery,
} from "./sql-server.service.js";

export const sqlServerRouter = Router();

sqlServerRouter.get("/default-settings", (_req, res) => {
  res.status(200).json({
    USER: "",
    PASSWORD: "",
    SERVER: "",
    DATABASE: "",
  });
});

sqlServerRouter.post("/settings", (req, res) => {
  onSettingsChanged(req.body);
  res.status(200).send();
});

sqlServerRouter.post("/api/run_query", async (req, res) => {
  const identity = res.locals.identity;
  await ensureSettingsFetched(identity.serviceUniqueId);

  await withTransaction(async (tx) => {
    try {
      // Gemini SQL hack - need to remove at some point
      const query = req.body.query.replace(/\\'/g, "'")
      console.log(query);
      const results = await runQuery(tx, query);
      res.status(200).json(results);
    } catch (e) {
      console.log(e);
      res.status(500).send(`${e}`);
    }
  });
});

export const sqlServerServiceFunctions = [
  {
    path: "run_query",
    method: "POST",
    description:
      "Part of Ganama Sql Server Service. Runs the given t-sql query on the connected database and returns the result.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The t-sql query to to run.",
        },
      },
      required: ["query"],
    },
  },
];
