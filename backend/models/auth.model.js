import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    ipfsHash: { type: String, required: true },
    emailHash: { type: String, required: true, unique: true }, // SHA-256 hash of email for lookup
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;