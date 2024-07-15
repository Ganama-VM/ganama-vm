export const identityMiddleware = (req, res, next) => {
  res.locals.identity = {
    team: req.get("X-Team"),
    agent: req.get("X-Agent"),
    layerNumber: parseInt(req.get("X-LayerNumber")),
    serviceUniqueId: req.get("X-ServiceUniqueId"),
  };

  res.locals.topic = req.get("X-Topic");

  next();
};
