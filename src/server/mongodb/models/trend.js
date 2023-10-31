import mongoose from "mongoose";

const artSchema = new mongoose.Schema({
    artist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    listenCnt: {
        type: Number,
        required: true,
        default: 0,
    },
});

const sonSchema = new mongoose.Schema({
    song: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Song",
    },
    listenCnt: {
        type: Number,
        required: true,
        default: 0,
    },
});

const trendSchema = new mongoose.Schema({
    month: { type: Number, required: true },
    artists: [{ type: artSchema }],
    songs: [{ type: sonSchema }],
});

const trendModel = mongoose.model("Trend", trendSchema);

export default trendModel;
