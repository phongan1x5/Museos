import express from "express";

import { createSong, updateSong } from "../controllers/song.controllers";

const router = express.Router();

router.route("/").post(createSong);
router.route("/:id").patch(updateSong);

export default router;
