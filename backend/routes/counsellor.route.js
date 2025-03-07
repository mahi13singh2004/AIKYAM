import express from "express"
import verifyToken from "../middleware/verifyToken.js"
import { chat } from "../controllers/counsellor.controller.js"
const router=express.Router()

router.post('/',chat)

export default router
