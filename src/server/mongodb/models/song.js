import mongoose from "mongoose";

const SongSchema = new mongoose.Schema({
  name: { type: String, required: true },
  artist: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const songModel = mongoose.model("Song", SongSchema);

export default songModel;
