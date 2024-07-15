import express from "express";
import { identityMiddleware } from "./identity.middleware.js";
import {
  messagingRouter,
  messagingServiceFunctions,
} from "./messaging/messaging.router.js";
import { Server } from "socket.io";
import { createServer } from "node:http";
import { addSocket } from "./voice/voice.service.js";
import { voiceRouter, voiceServiceFunctions } from "./voice/voice.router.js";

const app = express();
const server = createServer(app);

app.use(express.json());

app.use(identityMiddleware);
app.get("/services", (_req, res) => {
  res.status(200).json([
    {
      type: "application-service",
      id: "messaging",
      functions: messagingServiceFunctions,
    },
    {
      type: "application-service",
      id: "voice",
      functions: voiceServiceFunctions,
    },
  ]);
});

app.use("/services/messaging", messagingRouter);
app.use("/services/voice", voiceRouter);

app.use("/hooks/voice", express.static("./voice/public"));

const voiceIo = new Server(server, {
  path: "/hooks/voice-io",
});
voiceIo.on("connection", addSocket);

const PORT = process.env.PORT || 3003;
server.listen(PORT, () => {
  console.log(`Ganama services running on port ${PORT}`);
});
