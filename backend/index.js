import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/connectDB.js";
import authRoutes from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import counselorRoute from "./routes/counsellor.route.js";
import unsafeRoute from "./routes/unsafe.route.js";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use("/api/auth", authRoutes);
app.use("/api/counselor", counselorRoute);
app.use("/api/unsafe", unsafeRoute);

const PORT = process.env.PORT || 5000;

app.listen(5000,()=>{
  connectDB()
  console.log(`Server is running on port ${PORT}`)
})