import { Router, type IRouter } from "express";
import healthRouter from "./health";
import alumniRouter from "./alumni";
import schedulerRouter from "./scheduler";

const router: IRouter = Router();

router.use(healthRouter);
router.use(alumniRouter);
router.use(schedulerRouter);

export default router;
