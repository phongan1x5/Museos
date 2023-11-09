import express from "express";

import {
    createSong,
    updateSong,
    listenSong,
    likeSong,
    unlikeSong,
} from "../controllers/song.controllers.js";

const router = express.Router();

router.route("/").post(createSong);
router.route("/:id").patch(updateSong);
router.route("/listen").post(listenSong);
router.route("/like").post(likeSong);
router.route("/unlike").post(unlikeSong);

export default router;
