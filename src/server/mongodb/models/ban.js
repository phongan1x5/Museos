import mongoose from "mongoose";

const BanSchema = new mongoose.Schema(
  {
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const banModel = mongoose.model("Ban", BanSchema);

export default banModel;
