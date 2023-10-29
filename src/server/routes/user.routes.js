import express from "express";

import { createUser, updateUser } from "../controllers/user.controllers";

const router = express.Router();

router.route("/").post(createUser);
router.route("/:id").patch(updateUser);

export default router;