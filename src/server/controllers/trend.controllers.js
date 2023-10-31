import Trend from "../mongodb/models/trend.js";

const getAllTrends = async (req, res) => {
    try {
        let { limit } = req.query;
        limit = parseInt(limit, 10);
        if (Number.isNaN(limit)) limit = 10;

        const { month, artists, songs } = await Trend.findOne({}).populate([
            { path: "artists.artist" },
            { path: "songs.song" },
        ]);

        artists.sort((a, b) => {
            if (a.listenCnt === b.listenCnt)
                return a.artist.userName < b.artist.userName ? -1 : 1;
            return b.listenCnt - a.listenCnt;
        });
        songs.sort((a, b) => {
            if (a.listenCnt === b.listenCnt)
                return a.song.songName < b.song.songName ? -1 : 1;
            return b.listenCnt - a.listenCnt;
        });

        res.status(200).json({
            month,
            artists: artists.slice(0, limit),
            songs: songs.slice(0, limit),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTrendArtists = async (req, res) => {
    try {
        let { limit } = req.query;
        limit = parseInt(limit, 10);
        if (Number.isNaN(limit)) limit = 10;

        const { month, artists } = await Trend.findOne(
            {},
            "month artists"
        ).populate([{ path: "artists.artist" }]);

        artists.sort((a, b) => {
            if (a.listenCnt === b.listenCnt)
                return a.artist.userName < b.artist.userName ? -1 : 1;
            return b.listenCnt - a.listenCnt;
        });

        res.status(200).json({
            month,
            artists: artists.slice(0, limit),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTrendSongs = async (req, res) => {
    try {
        let { limit } = req.query;
        limit = parseInt(limit, 10);
        if (Number.isNaN(limit)) limit = 10;

        const { month, songs } = await Trend.findOne(
            {},
            "month songs"
        ).populate([{ path: "songs.song" }]);

        songs.sort((a, b) => {
            if (a.listenCnt === b.listenCnt)
                return a.song.songName < b.song.songName ? -1 : 1;
            return b.listenCnt - a.listenCnt;
        });

        res.status(200).json({
            month,
            songs: songs.slice(0, limit),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { getAllTrends, getTrendArtists, getTrendSongs };
