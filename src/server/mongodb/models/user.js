import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        userEmail: { type: String, required: true },
        userPassword: { type: String, required: true },
        userName: { type: String, required: true },
        userDOB: { type: Date, required: true },
        balance: { type: Number, required: true, default: 0 },
        followerCnt: { type: Number, required: true, default: 0 },
        allSongs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
    },
    { timestamps: true }
);

const userModel = mongoose.model("User", UserSchema);

export default userModel;
