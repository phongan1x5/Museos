import mongoose from "mongoose";
import User from "./user.js";

const BanSchema = new mongoose.Schema(
    {
        users: [{ type: User.schema, default: [] }],
    },
    { timestamps: true }
);

const banModel = mongoose.model("Ban", BanSchema);

export default banModel;
