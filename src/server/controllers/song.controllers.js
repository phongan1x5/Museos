import * as dotenv from "dotenv";
import Song from "../mongodb/models/song.js";
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

export { createSong, updateSong };
