import Ban from "../mongodb/models/ban.js";
import User from "../mongodb/models/user.js";
import Song from "../mongodb/models/song.js";
import Comment from "../mongodb/models/comment.js";
import Playlist from "../mongodb/models/playlist.js";

const banUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) throw new Error("Invalid user!");

        await Ban.updateOne({}, { $push: { users: user } });
        await Song.updateMany(
            { _id: { $in: user.uploadedSongs } },
            { $set: { isBanned: true } },
            { multi: true }
        );
        await Comment.updateMany(
            { _id: { $in: user.postedComments } },
            { $set: { isBanned: true } },
            { multi: true }
        );
        await Playlist.updateMany(
            { _id: { $in: user.playlists } },
            { $set: { isBanned: true } },
            { multi: true }
        );

        await User.findByIdAndDelete(user._id);
        res.status(200).json({ message: `${user.email} successfully banned!` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const removeSong = async (req, res) => {
    try {
        const { id } = req.params;
        const song = await Song.findById(id);
        if (!song) throw new Error("Invalid song!");

        await Song.findByIdAndDelete(song._id);
        res.status(200).json({
            message: `${song.title} successfully removed!`,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { banUser, removeSong };
