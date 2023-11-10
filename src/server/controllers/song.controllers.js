import Song from "../mongodb/models/song.js";
import User from "../mongodb/models/user.js";
import Playlist from "../mongodb/models/playlist.js";
import Trend from "../mongodb/models/trend.js";
import { baseDownURL, getSignedURL } from "../utils/aws.util.js";

const createSong = async (req, res) => {
    try {
        const { title, artist, length, upLyrics = "", upCover = "" } = req.body;
        let newSong = await Song.create({ title, artist, length });

        const fileUpLink = await getSignedURL(`${newSong._id}_file`);
        const linkUpdates = {
            fileLink: `${baseDownURL}/${newSong._id}_file.mp3`,
        };

        let lyricsUpLink = "";
        let coverUpLink = "";

        if (upLyrics) {
            linkUpdates.lyricsPath = `${baseDownURL}/${newSong._id}_lyrics.txt`;
            lyricsUpLink = await getSignedURL(`${newSong._id}_lyrics`);
        }

        if (upCover) {
            linkUpdates.coverPath = `${baseDownURL}/${newSong._id}_cover.png`;
            coverUpLink = await getSignedURL(`${newSong._id}_cover`);
        }

        newSong = await Song.findByIdAndUpdate(newSong._id, linkUpdates, {
            new: true,
        });

        await User.findByIdAndUpdate(artist, {
            $push: { uploadedSongs: newSong._id },
        });

        await Trend.updateOne(
            {},
            {
                $push: { songs: { song: newSong._id, listenCnt: 0 } },
            }
        );

        const response = { newSong, fileUpLink };
        if (upLyrics) response.lyricsUpLink = lyricsUpLink;
        if (upCover) response.coverUpLink = coverUpLink;

        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateSong = async (req, res) => {
    try {
        const { id } = req.params;
        const { title = "", newLyrics = "", newCover = "" } = req.body;

        const updates = {};
        if (title) updates.title = title;

        let lyricsUpLink = "";
        let coverUpLink = "";

        if (newLyrics) {
            updates.lyricsPath = `${baseDownURL}/${id}_lyrics.txt`;
            lyricsUpLink = await getSignedURL(`${id}_lyrics`);
        }

        if (newCover) {
            updates.coverPath = `${baseDownURL}/${id}_cover.png`;
            coverUpLink = await getSignedURL(`${id}_cover`);
        }

        const updatedSong = await Song.findByIdAndUpdate(id, updates, {
            new: true,
        });

        const response = newLyrics || newCover ? { updatedSong } : updatedSong;
        if (newLyrics) response.lyricsUpLink = lyricsUpLink;
        if (newCover) response.coverUpLink = coverUpLink;

        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

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
