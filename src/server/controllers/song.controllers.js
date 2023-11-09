import Song from "../mongodb/models/song.js";
import User from "../mongodb/models/user.js";
import Playlist from "../mongodb/models/playlist.js";
import Trend from "../mongodb/models/trend.js";
import { baseDownURL, getSignedURL } from "../utils/aws.util.js";

const createSong = async (req, res) => {
    try {
        const { title, artist, length } = req.body;
        let newSong = await Song.create({ title, artist, length });
        const lyricsUpLink = await getSignedURL(`${newSong._id}_lyrics`);
        const fileUpLink = await getSignedURL(`${newSong._id}_file`);
        const coverUpLink = await getSignedURL(`${newSong._id}_cover`);

        newSong = await Song.findByIdAndUpdate(
            newSong._id,
            {
                lyricsPath: `${baseDownURL}/${newSong._id}_lyrics.txt`,
                fileLink: `${baseDownURL}/${newSong._id}_file.mp3`,
                coverPath: `${baseDownURL}/${newSong._id}_cover.png`,
            },
            { new: true }
        );

        await User.findByIdAndUpdate(artist, {
            $push: { uploadedSongs: newSong._id },
        });

        await Trend.updateOne(
            {},
            {
                $push: { songs: { song: newSong._id, listenCnt: 0 } },
            }
        );

        res.status(200).json({
            newSong,
            lyricsUpLink,
            fileUpLink,
            coverUpLink,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateSong = async (req, res) => {};

const listenSong = async (req, res) => {
    try {
        const { song } = req.query;
        if (!song) throw Error("Invalid song!");

        const updatedSong = await Song.findByIdAndUpdate(
            song,
            { $inc: { listenCnt: 1 } },
            { new: true }
        );

        await Trend.bulkWrite([
            {
                updateOne: {
                    filter: { "songs.song": song },
                    update: { $inc: { "songs.$.listenCnt": 1 } },
                },
            },
            {
                updateOne: {
                    filter: { "artists.artist": updatedSong.artist },
                    update: { $inc: { "artists.$.listenCnt": 1 } },
                },
            },
        ]);

        res.status(200).json(updatedSong);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const likeSong = async (req, res) => {
    try {
        const { user, song } = req.query;
        if (!user || !song) throw Error("Invalid user or song!");

        await Song.findByIdAndUpdate(song, { $inc: { heartCnt: 1 } });

        const updatedPlaylist = await Playlist.findOneAndUpdate(
            {
                title: "Liked Songs",
                creator: user,
            },
            { $push: { songs: song } },
            { new: true }
        );

        res.status(200).json(updatedPlaylist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const unlikeSong = async (req, res) => {
    try {
        const { user, song } = req.query;
        if (!user || !song) throw Error("Invalid user or song!");

        await Song.findByIdAndUpdate(song, { $inc: { heartCnt: -1 } });

        const updatedPlaylist = await Playlist.findOneAndUpdate(
            {
                title: "Liked Songs",
                creator: user,
            },
            { $pull: { songs: song } },
            { new: true }
        );

        res.status(200).json(updatedPlaylist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { createSong, updateSong, listenSong, likeSong, unlikeSong };
