import express from "express";

import {
    createComment,
    updateComment,
} from "../controllers/comment.controllers.js";

const router = express.Router();

router.route("/").post(createComment);
router.route("/:id").patch(updateComment);

export default router;
