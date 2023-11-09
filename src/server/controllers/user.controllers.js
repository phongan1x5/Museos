import bcrypt from "bcrypt";
import User from "../mongodb/models/user.js";
import Ban from "../mongodb/models/ban.js";

const createUser = async (req, res) => {
  try {
    const { email, rawPassword, name, DOB } = req.body;
    const password = bcrypt.hashSync(rawPassword, 10, null);

    const checkUserExist = await User.findOne({ email });
    const checkBanExist = await Ban.findOne({ "users.email": email });
    if (checkUserExist || checkBanExist) throw new Error("Invalid email!");

    const newUser = await User.create({
      email,
      password,
      name,
      DOB,
    });

    res.status(200).json(newUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    User.findOne({ email }).then((user) => {
      if (user) {
        const compPasswordRes = bcrypt.compareSync(password, user.password);
        if (compPasswordRes) return res.status(200).json(user);
      }
      throw new Error("Invalid email or password!");
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { nameLike = "", sorts, orders, limit } = req.query;
    const query = {};
    if (nameLike) query.name = { $regex: nameLike, $options: "i" };

    let sortAttrs = ["name"];
    if (sorts) sortAttrs = sorts.split("@");
    let sortOrds = "1";
    if (orders) sortOrds = orders;
    while (sortOrds.length < sortAttrs.length) sortOrds += "1";

    const sortq = {};
    for (let i = 0; i < sortAttrs.length; i += 1)
      sortq[sortAttrs[i]] = !parseInt(sortOrds[i], 10) ? -1 : 1;

    let qlimit = parseInt(limit, 10);
    if (Number.isNaN(qlimit)) qlimit = false;

    const users = await User.find(query).sort(sortq).limit(qlimit);
    res.header("user-total-count", users.length);
    res.header("Access-Control-Expose-Headers", "user-total-count");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).populate([
      {
        path: "uploadedSongs",
      },
      {
        path: "playlists",
      },
    ]);

    if (!user) throw new Error("Invalid user!");

    res.header("song-total-count", user.uploadedSongs.length);
    res.header("comment-total-count", user.postedComments.length);
    res.header("playlist-total-count", user.playlists.length);
    res.header("Access-Control-Expose-Headers", [
      "song-total-count",
      "comment-total-count",
      "playlist-total-count",
    ]);

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {};

export { createUser, loginUser, getAllUsers, getUserById, updateUser };
