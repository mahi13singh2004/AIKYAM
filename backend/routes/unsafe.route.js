import express from "express";
import { getUnsafeAreas, markUnsafe } from "../controllers/unsafe.controller.js";

const router = express.Router();

router.get("/", getUnsafeAreas);
router.post("/", markUnsafe);

export default router;