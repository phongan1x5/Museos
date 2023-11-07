import express from "express";

import { banUser, removeSong } from "../controllers/ban.controllers.js";

const router = express.Router();

router.route("/users/:id").post(banUser);
router.route("/songs/:id").post(removeSong);

export default router;
