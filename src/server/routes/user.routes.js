import express from "express";

import {
    createUser,
    loginUser,
    getAllUsers,
    updateUser,
} from "../controllers/user.controllers.js";

const router = express.Router();

router.route("/").post(createUser);
router.route("/login").get(loginUser);
router.route("/").get(getAllUsers);
router.route("/:id").patch(updateUser);

export default router;
