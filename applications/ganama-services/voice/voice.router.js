import { Router } from "express";
import { speakToUser } from "./voice.service.js";

export const voiceRouter = Router();

voiceRouter.get("/default-settings", (_req, res) => {
  res.status(200).json({
    TEAM: "",
    AGENT: "",
  });
});

voiceRouter.post("/api/speak_to_user", (req, res) => {
  const identity = res.locals.identity;
  try {
    speakToUser(req.body.message, identity);
    res.status(200).send('MESSAGE_RECEIVED');
  } catch (e) {
    res.status(500).send(`${e}`);
  }
});

export const voiceServiceFunctions = [
  {
    path: "speak_to_user",
    method: "POST",
    description:
      "Part of Ganama Voice Service. Speaks out the given message to the user.",
    parameters: {
      type: "object",
      properties: {
        message: {
          type: "string",
          description: "The message to speak out to the user.",
        },
      },
      required: ["message"],
    },
  },
]
