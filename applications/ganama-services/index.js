import express from "express";
import { identityMiddleware } from "./identity.middleware.js";
import {
  messagingRouter,
  messagingServiceFunctions,
} from "./messaging/messaging.router.js";

const app = express();

app.use(express.json());

app.use(identityMiddleware);
app.get("/services", (_req, res) => {
  res.status(200).json([
    {
      type: "application-service",
      id: "messaging",
      functions: messagingServiceFunctions,
    },
  ]);
});

app.use("/services/messaging", messagingRouter);

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Ganama services running on port ${PORT}`);
});
