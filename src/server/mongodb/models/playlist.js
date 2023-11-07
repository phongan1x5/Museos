import mongoose from "mongoose";

const PlaylistSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        coverPath: { type: String, required: true },
        isBanned: { type: Boolean, required: true, default: false },
        songs: [
            { type: mongoose.Schema.Types.ObjectId, ref: "Song", default: [] },
        ],
        allowedUsers: [
            { type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] },
        ],
        // listenCnt: { type: Number, required: true, default: 0 },
        // heartCnt: { type: Number, required: true, default: 0 },
    },
    { timestamps: true }
);

const playlistModel = mongoose.model("Song", PlaylistSchema);

export default playlistModel;
