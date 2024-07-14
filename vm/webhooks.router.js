import { Router } from "express";
import { getApplications } from "./core/core.js";
import proxy from "express-http-proxy";

export const webhooksRouter = Router();
for (const application of getApplications()) {
  webhooksRouter.use(
    `/${application.id}/:path`,
    proxy(application.url, {
      proxyReqPathResolver: (req) => {
        return `/hooks/${req.params.path}`;
      },
    })
  );
}
