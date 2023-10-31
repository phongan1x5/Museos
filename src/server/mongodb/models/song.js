import mongoose from "mongoose";

const SongSchema = new mongoose.Schema(
    {
        songName: { type: String, required: true },
        artist: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        songFile: { type: String, required: true },
    },
    { timestamps: true }
);

const songModel = mongoose.model("Song", SongSchema);

export default songModel;
