import { Router, type IRouter } from "express";
import healthRouter from "./health";
import countriesRouter from "./countries";
import challanRouter from "./challan";
import emergencyRouter from "./emergency";
import statsRouter from "./stats";
import lawsRouter from "./laws";
import geminiRouter from "./gemini/index";

const router: IRouter = Router();

router.use(healthRouter);
router.use(geminiRouter);
router.use(countriesRouter);
router.use(challanRouter);
router.use(emergencyRouter);
router.use(statsRouter);
router.use(lawsRouter);

export default router;
