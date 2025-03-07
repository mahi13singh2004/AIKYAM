import mongoose from "mongoose";

const LocationSchema = new mongoose.Schema({
  lat: {
    type: Number,
    required: true,
  },
  lng: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["safe", "unsafe"],
    default: "unsafe",
  },
}, { timestamps: true });

const Location = mongoose.model("Location", LocationSchema);
export default Location;