import express from "express";

import { banUser, updateBan } from "../controllers/ban.controllers.js";

const router = express.Router();

router.use(updateBan);
router.route("/users/:id").post(banUser);

export default router;
