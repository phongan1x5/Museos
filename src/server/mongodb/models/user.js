import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    followerCnt: { type: Number, required: true, default: 0 },
    upSongs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
});

const userModel = mongoose.model("User", UserSchema);

export default userModel;
