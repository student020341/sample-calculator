import express from "express";

import sampleRouter from "./samples.js";
import reportRouter from "./reports.js";
import templateRouter from "./templates.js";
import calcRouter from "./calculations.js";

const router = express.Router();

router.use("/samples", sampleRouter);
router.use("/reports", reportRouter);
router.use("/templates", templateRouter);
router.use("/calculations", calcRouter);

export default router;
