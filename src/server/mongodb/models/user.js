import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        email: { type: String, required: true },
        password: { type: String, required: true },
        name: { type: String, required: true },
        DOB: { type: Date, required: true },
        avatarPath: { type: String, required: true, default: " " },
        balance: { type: Number, required: true, default: 0 },
        followerCnt: { type: Number, required: true, default: 0 },
        uploadedSongs: [
            { type: mongoose.Schema.Types.ObjectId, ref: "Song", default: [] },
        ],
        postedComments: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Comment",
                default: [],
            },
        ],
        playlists: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Playlist",
                default: [],
            },
        ],
    },
    { timestamps: true }
);

const userModel = mongoose.model("User", UserSchema);

export default userModel;
