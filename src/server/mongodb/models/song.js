import mongoose from "mongoose";

const SongSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    artist: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    length: { type: Number, required: true, default: 0 },
    lyricsPath: { type: String, required: true },
    listenCnt: { type: Number, required: true, default: 0 },
    heartCnt: { type: Number, required: true, default: 0 },
    coverPath: { type: String, required: true },
    filePath: { type: String, required: true },
    isBanned: { type: Boolean, required: true, default: false },
    commentSect: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        default: [],
      },
    ],
  },
  { timestamps: true }
);

const songModel = mongoose.model("Song", SongSchema);

export default songModel;
