import * as dotenv from "dotenv";
import bcrypt from "bcrypt";
// eslint-disable-next-line import/no-extraneous-dependencies, camelcase
import random_name from "node-random-name";
import aws from "aws-sdk";
import fs from "fs";
// eslint-disable-next-line import/no-extraneous-dependencies
import { getAudioDurationInSeconds } from "get-audio-duration";
import connectDB from "./mongodb/connect.js";
import User from "./mongodb/models/user.js";
import Song from "./mongodb/models/song.js";
import Trend from "./mongodb/models/trend.js";
import { updateTrend } from "./controllers/trend.controllers.js";
import { createComment } from "./controllers/comment.controllers.js";

dotenv.config();

function generateRandomDate(from, to) {
  return new Date(
    from.getTime() + Math.random() * (to.getTime() - from.getTime())
  );
}

const createUserMock = async (req) => {
  try {
    const { email, rawPassword, name, DOB } = req.body;
    const password = bcrypt.hashSync(rawPassword, 10, null);

    const checkUserExist = await User.findOne({ email });
    // const checkBanExist = await Ban.findOne({ "users.email": email });
    // if (checkUserExist || checkBanExist) throw new Error("Invalid email!");
    if (checkUserExist) throw new Error("Invalid email!");

    const newUser = await User.create({
      email,
      password,
      name,
      DOB,
    });

    return newUser;
  } catch (error) {
    return error;
  }
};

const createSongMock = async (req) => {
  try {
    const { title, artist } = req.body;
    const newSong = await Song.create({ title, artist });
    const baseDownURL = "https://museos-seslay.s3.ap-southeast-1.amazonaws.com";
    await Song.findByIdAndUpdate(newSong._id, {
      lyricsPath: `${baseDownURL}/${newSong._id}_lyrics.txt`,
      fileLink: `${baseDownURL}/${newSong._id}_file.mp3`,
      coverPath: `${baseDownURL}/${newSong._id}_cover.png`,
    });

    return newSong;
  } catch (error) {
    return error;
  }
};

// eslint-disable-next-line no-unused-vars
const addUser = async () => {
  for (let i = 0; i <= 25; i += 1) {
    const firstName = random_name({ first: true, gender: "male" });
    const lastName = random_name({ last: true });
    const userName = `${firstName} ${lastName}`;
    const userEmail = `${firstName + lastName}@gmail.com`;
    const userPassword = `${firstName + lastName}123`;
    const userDOB = generateRandomDate(new Date(1960, 0, 1), new Date());
    const req = {
      body: {
        email: userEmail,
        name: userName,
        rawPassword: userPassword,
        DOB: userDOB,
      },
    };
    const res = {};
    console.log(createUserMock(req, res));
  }
};

const updateSongTime = async (songID) => {
  const s3Link = `https://museos-seslay.s3.ap-southeast-1.amazonaws.com/${songID}.mp3`;
  getAudioDurationInSeconds(s3Link).then((duration) => {
    console.log("Song ID", songID);
    console.log("Duration", duration);
    const filter = { _id: songID };
    const update = { length: Math.floor(duration) };
    Song.findByIdAndUpdate(filter, update).then((result) => {
      console.log(result);
      console.log("Update song length successfully");
    });
  });
};

const updateArtistSong = async (artistID, songID) =>
  User.findOneAndUpdate({ _id: artistID }, { $push: { uploadedSongs: songID } })
    .then((result) => result)
    .catch((error) => error);

const addSong = async () => {
  const songPath = "../../song_data/";
  aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.REGION,
    signatureVersion: "v4",
  });

  const s3 = new aws.S3();

  const myBucket = process.env.BUCKET;

  fs.readdir(songPath, async (error, files) => {
    console.log(files);
    files.forEach(async (file) => {
      User.find({}, "_id").then(async (userList) => {
        const randomUser =
          userList[Math.floor(Math.random() * userList.length)];
        console.log("Random user is: ", randomUser);

        const req = {
          body: {
            title: file,
            artist: randomUser,
          },
        };
        createSongMock(req).then(async (result) => {
          const fileID = result._id;
          await updateArtistSong(randomUser, fileID);
          const filePath = songPath + file;
          console.log(filePath);
          console.log(fileID);
          const params = {
            Bucket: myBucket,
            Key: `${fileID}.mp3`,
            Body: fs.readFileSync(filePath),
          };
          s3.putObject(params, async (err) => {
            if (err) {
              console.log(err);
            } else {
              console.log("Successfully uploaded ");
              updateSongTime(fileID);
            }
          });
        });
      });
    });
  });
};

const listenToSong = async () => {
  Song.find({}, "_id artist").then(async (songList) => {
    const randomSong = songList[Math.floor(Math.random() * songList.length)];
    const songFilter = { _id: randomSong._id };
    const songUpdate = { $inc: { listenCnt: 1 } };
    await Song.updateOne(songFilter, songUpdate);

    await Trend.updateOne(
      { "artists.artist": randomSong.artist },
      { $inc: { "artists.$.listenCnt": 1 } }
    );
    await Trend.updateOne(
      { "songs.song": randomSong._id },
      { $inc: { "songs.$.listenCnt": 1 } }
    );
    console.log("Listen to song: ", randomSong._id);
    console.log("Listen to artist: ", randomSong.artist);
  });
};

const randomCmt = [
  "I love this song <3",
  "I don't like it",
  "OMG this song is rockkkk",
  "Who is the artist",
  "LOLLLLLLLL",
];

const commentSong = async () => {
  Song.find({}, "_id").then(async (songList) => {
    const randomSong = songList[Math.floor(Math.random() * songList.length)];
    User.find({}, "_id").then(async (userList) => {
      const randomUser = userList[Math.floor(Math.random() * userList.length)];
      const randomComment =
        randomCmt[Math.floor(Math.random() * randomCmt.length)];
      const req = {
        body: {
          user: randomUser._id,
          song: randomSong._id,
          content: String(randomComment),
        },
      };
      await createComment(req);
    });
  });
};

const startServer = async () => {
  try {
    connectDB(`${process.env.MONGODB_URL}`);
    // addUser();
    //addSong();
    // Trend.create({ month: 10 });
    // updateTrend();
    // for (let i = 0; i <= 15; i += 1) listenToSong();
    for (let i = 0; i <= 1; i += 1) commentSong();
  } catch (error) {
    console.log(error);
  }
};

startServer();
