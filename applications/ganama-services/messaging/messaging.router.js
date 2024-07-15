import { Router } from "express";
import {
  messageLayerAbove,
  messageLayerBelow,
  messageOtherAgent,
} from "./messaging.service.js";

export const messagingRouter = Router();

messagingRouter.get("/default-settings", (_req, res) => {
  res.status(200).json({});
});

messagingRouter.post("/api/message_other_agent", async (req, res) => {
  const identity = res.locals.identity;
  try {
    const response = await messageOtherAgent(
      res.locals.topic,
      req.body.message,
      req.body.team,
      req.body.agent,
      identity
    );
    res.status(200).send(response);
  } catch (e) {
    res.status(500).send(`${e}`);
  }
});

messagingRouter.post("/api/message_layer_below", async (req, res) => {
  const identity = res.locals.identity;
  try {
    const response = await messageLayerBelow(
      res.locals.topic,
      req.body.message,
      identity
    );
    res.status(200).send(response);
  } catch (e) {
    res.status(500).send(`${e}`);
  }
});

messagingRouter.post("/api/message_layer_above", async (req, res) => {
  const identity = res.locals.identity;
  try {
    const response = await messageLayerAbove(
      res.locals.topic,
      req.body.message,
      identity
    );
    res.status(200).send(response);
  } catch (e) {
    res.status(500).send(`${e}`);
  }
});

export const messagingServiceFunctions = [
  {
    path: "message_other_agent",
    method: "POST",
    description:
      "Part of Ganama Messaging Service. Sends a message to another agent.",
    parameters: {
      type: "object",
      properties: {
        team: {
          type: "string",
          description: "The team the agent to message is in.",
        },
        agent: {
          type: "string",
          description: "The name of the agent to message.",
        },
        message: {
          type: "string",
          description: "The message to send.",
        },
      },
      required: ["team", "agent", "message"],
    },
  },

  {
    path: "message_layer_below",
    method: "POST",
    description:
      "Part of Ganama Messaging Service. Sends a message to the layer immediately below this layer.",
    parameters: {
      type: "object",
      properties: {
        message: {
          type: "string",
          description: "The message to send.",
        },
      },
      required: ["message"],
    },
  },

  {
    path: "message_layer_above",
    method: "POST",
    description:
      "Part of Ganama Messaging Service. Sends a message to the layer immediately above this layer.",
    parameters: {
      type: "object",
      properties: {
        message: {
          type: "string",
          description: "The message to send.",
        },
      },
      required: ["message"],
    },
  },
];
