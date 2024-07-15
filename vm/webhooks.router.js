import { Router } from "express";
import { getApplications } from "./core/core.js";
import { createProxyMiddleware } from "http-proxy-middleware";

export const webhooksRouter = Router();
for (const application of getApplications()) {
  webhooksRouter.use(`/${application.id}`, createProxyMiddleware({
    target: `${application.url}/hooks`,
    changeOrigin: true,
  }));
}
