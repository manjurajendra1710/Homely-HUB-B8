import express from "express";

import { planTrip } from "../controllers/tripController.js";

const tripRouter = express.Router();

tripRouter.post("/trip-plan", planTrip);

export { tripRouter };
