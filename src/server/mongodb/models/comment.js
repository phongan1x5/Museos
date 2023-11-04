import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    song: { type: mongoose.Schema.Types.ObjectId, ref: "Song" },
    content: { type: String, required: true },
    isBanned: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

const commentModel = mongoose.model("Comment", CommentSchema);

export default commentModel;
