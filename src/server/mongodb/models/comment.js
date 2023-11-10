import mongoose from "mongoose";
import Ban from "./ban.js";
import User from "./user.js";
// Should be a `import Song from "./song.js"` but that would cause
// a dependency cycle

const CommentSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        song: { type: mongoose.Schema.Types.ObjectId, ref: "Song" },
        content: { type: String, required: true },
        isBanned: { type: Boolean, required: true, default: false },
    },
    { timestamps: true }
);

CommentSchema.pre("findOneAndDelete", async (next) => {
    try {
        if (this.isBanned)
            await Ban.updateOne(
                { "users._id": this.user },
                { $pull: { "users.$.postedComments": this._id } }
            );
        else
            await User.findByIdAndUpdate(this.user, {
                $pull: { postedComments: this._id },
            });

        await mongoose.model("Song").findByIdAndUpdate(this.song, {
            $pull: { commentSect: this._id },
        });
        next();
    } catch (error) {
        next(error);
    }
});

CommentSchema.pre("deleteMany", async (next) => {
    try {
        console.log(this);
        console.log(this._conditions);
        next();
    } catch (error) {
        next(error);
    }
});

const commentModel = mongoose.model("Comment", CommentSchema);

export default commentModel;
