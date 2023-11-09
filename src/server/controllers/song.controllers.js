import * as dotenv from "dotenv";
import Song from "../mongodb/models/song.js";
import Trend from "../mongodb/models/trend.js";
import getSignedURL from "../utils/aws.util.js";

dotenv.config();
const baseDownURL = `https://${process.env.BUCKET}.s3.${process.env.REGION}.amazonaws.com`;

const createSong = async (req, res) => {
    try {
        const { title, artist, length } = req.body;
        const newSong = await Song.create({ title, artist, length });
        const lyricsUpLink = await getSignedURL(`${newSong._id}_lyrics`);
        const fileUpLink = await getSignedURL(`${newSong._id}_file`);
        const coverUpLink = await getSignedURL(`${newSong._id}_cover`);

        await Song.findByIdAndUpdate(newSong._id, {
            lyricsPath: `${baseDownURL}/${newSong._id}_lyrics.txt`,
            fileLink: `${baseDownURL}/${newSong._id}_file.mp3`,
            coverPath: `${baseDownURL}/${newSong._id}_cover.png`,
        });

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

        res.status(200).json({ updatedSong });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { createSong, updateSong, listenSong };
