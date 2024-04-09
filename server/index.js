const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Post = require("./models/Post");
const app = express();
const cookieParser = require("cookie-parser");
const authRoute = require("./Routes/AuthRoute");
const multer = require("multer");
const uploadMiddleware = multer({ dest: "uploads/" });
const fs = require("fs");
const { userVerification } = require("./middlewares/authMiddleware");
const jwt = require("jsonwebtoken");
TOKEN_KEY = "";
const User = require("./Models/UserModel");

app.use(cookieParser());
app.use(express.json());
// Enable CORS
app.use(
  cors({
    origin: "http://localhost:3000", // Allow requests from this origin
    credentials: true, // Allow cookies to be sent along with the request
  })
);
app.use("/", authRoute);
app.use("/uploads", express.static(__dirname + "/uploads"));

require("dotenv").config();
const MONGO_URL =
  "mongodb+srv://mainajoadin100:@cluster0.t5y7dgm.mongodb.net/blog?retryWrites=true&w=majority&appName=Cluster0";
const PORT = 4000;

mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("Connected to database");
    app.listen(PORT, (error) => {
      if (!error) {
        console.log("App running on port " + PORT);
      } else {
        console.log("Error: " + error);
      }
    });
  })
  .catch((error) => {
    console.log(error);
  });

app.get("/profile", userVerification, async (req, res) => {
  try {
    // If userVerification middleware passes, the user details will be available in req.user
    return res.json({ status: true, user: req.user.username });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/post", uploadMiddleware.single("file"), async (req, res) => {
  try {
    const { originalname, path } = req.file;
    const parts = originalname.split(".");
    const ext = parts[parts.length - 1];
    const newPath = path + "." + ext;
    fs.renameSync(path, newPath);

    const { title, summary, content, author } = req.body;
    const postDoc = await Post.create({
      title,
      summary,
      content,
      cover: newPath,
      author,
    });
    res.json(postDoc);
  } catch (error) {
    console.error("Error creating post:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.put("/post", uploadMiddleware.single("file"), async (req, res) => {
  let newPath = null;

  if (req.file) {
    const { originalname, path } = req.file;
    const ext = originalname.split(".").pop();
    newPath = path + "." + ext;
    fs.renameSync(path, newPath);
  }

  const { id, title, summary, content, author } = req.body;
  const postDoc = await Post.findById(id);

  if (!postDoc) {
    return res.status(404).json({ message: 'Post not found' });
  }

  // Check if the user making the request is the author of the post
  if (postDoc.author.toString() !== author) {
    return res.status(403).json({ message: 'You are not the author of this post' });
  }

  await postDoc.updateOne({
    title,
    summary,
    content,
    cover: newPath || postDoc.cover,
  });

  res.json(postDoc);
});



app.get("/post", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", ["username"])
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/post/:id", async (req, res) => {
  const { id } = req.params;
  const postDoc = await Post.findById(id).populate("author", ["username"]);
  res.json(postDoc);
});










