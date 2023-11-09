import express from "express";

import {
    createSong,
    updateSong,
    listenSong,
} from "../controllers/song.controllers.js";

const router = express.Router();

router.route("/").post(createSong);
router.route("/:id").patch(updateSong);
router.route("/listen").post(listenSong);

export default router;
