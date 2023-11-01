import bcrypt from "bcrypt";
import User from "../mongodb/models/user.js";

const createUser = async (req, res) => {
    const { userEmail, rawPassword, userName, userDOB } = req.body;

    try {
        const userPassword = bcrypt.hashSync(rawPassword, 10, null);
        const checkUserExist = await User.findOne({ userEmail });
        if (checkUserExist)
            throw new Error("Email is invalid or already taken!");

        const newUser = await User.create({
            userEmail,
            userPassword,
            userName,
            userDOB,
        });

        res.status(200).json(newUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    const { userEmail, userPassword } = req.body;
    try {
        User.findOne({ userEmail }).then((user) => {
            if (user) {
                const compPasswordRes = bcrypt.compareSync(
                    userPassword,
                    user.userPassword
                );
                if (compPasswordRes) return res.status(200).json(user);
            }
            throw new Error("Invalid email or password!");
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllUsers = async (req, res) => {
    const { nameLike = "", sorts, orders, limit } = req.query;
    const query = {};
    if (nameLike) query.userName = { $regex: nameLike, $options: "i" };

    let sortAttrs = ["userName"];
    if (sorts) sortAttrs = sorts.split("@");
    let sortOrds = "1";
    if (orders) sortOrds = orders;
    while (sortOrds.length < sortAttrs.length) sortOrds += "1";

    const sortq = {};
    for (let i = 0; i < sortAttrs.length; i += 1)
        sortq[sortAttrs[i]] = !parseInt(sortOrds[i], 10) ? -1 : 1;

    let qlimit = parseInt(limit, 10);
    if (Number.isNaN(qlimit)) qlimit = false;

    try {
        const users = await User.find(query).sort(sortq).limit(qlimit);
        res.header("user-total-count", users.length);
        res.header("Access-Control-Expose-Headers", "user-total-count");
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateUser = async (req, res) => {};

export { createUser, loginUser, getAllUsers, updateUser };
