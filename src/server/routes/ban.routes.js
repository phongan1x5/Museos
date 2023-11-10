import express from "express";

import {
    banUser,
    removeComment,
    removeSong,
    updateBan,
} from "../controllers/ban.controllers.js";

const router = express.Router();

router.use(updateBan);
router.route("/users/:id").post(banUser);
router.route("/songs/:id").post(removeSong);
router.route("/comments/:id").post(removeComment);

export default router;
