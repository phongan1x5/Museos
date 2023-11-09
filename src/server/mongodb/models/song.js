import mongoose from "mongoose";
import Ban from "./ban.js";
import User from "./user.js";
import Trend from "./trend.js";
import Playlist from "./playlist.js";
import Comment from "./comment.js";

const SongSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    artist: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    length: { type: Number, required: true, default: 0 },
    lyricsPath: { type: String, required: true, default: " " },
    listenCnt: { type: Number, required: true, default: 0 },
    heartCnt: { type: Number, required: true, default: 0 },
    coverPath: {
      type: String,
      required: true,
      default:
        "https://museos-seslay.s3.ap-southeast-1.amazonaws.com/default_songCover.png",
    },
    filePath: { type: String, required: true, default: " " },
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

SongSchema.pre(["findOneAndDelete"], async (next) => {
  try {
    if (this.isBanned) {
      console.log("hello");
    } else
      await User.findByIdAndUpdate(this.artist, {
        $pull: { uploadedSongs: this._id },
      });

    await Trend.updateOne({}, { $pull: { songs: { song: this._id } } });
    await Playlist.updateMany(
      {},
      { $pull: { songs: this._id } },
      { multi: true }
    );
    await Comment.deleteMany({ _id: { $in: this.commentSect } });
    next();
  } catch (error) {
    next(error);
  }
});

const songModel = mongoose.model("Song", SongSchema);

export default songModel;
