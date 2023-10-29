import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";

import connectDB from "./mongodb/connect";
import userRouter from "./routes/user.routes";
import songRouter from "./routes/song.routes";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send({ message: "Hello, World!" });
});

app.use("/api/v1/users", userRouter);
app.use("/api/v1/songs", songRouter);

const startServer = async () => {
  try {
    connectDB(process.env.MONGODB_URL);
    app.listen(3000, () =>
      console.log("Server started on port http://localhost:3000")
    );
  } catch (error) {
    console.log(error);
  }
};

startServer();
