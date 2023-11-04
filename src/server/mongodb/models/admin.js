import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    isAdmin: { type: Boolean, required: true, default: true },
    avatarPath: { type: String, required: true },
  },
  { timestamps: true }
);

const adminModel = mongoose.model("User", AdminSchema);

export default adminModel;
