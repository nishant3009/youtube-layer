import express from "express";
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import youtubeApi from "./youtubeApi.js";
import upload from "./upload.js";
import session from "./session.js";
import bodyParser from "body-parser";
import supabase from "./supabaseClient.js";
import cors from "cors";
import assignVideo from "./assignVideo.js";
import listVideo from "./listVideo.js";
import downloadVideo from "./downloadVideo.js";
import uploadToYoutube from "./uploadToYoutube.js"
// import youtubeApi from "./youtubeApi.js";

const app = express();
const port = process.env.portnumber;

// app.use(
//   cors({
//     origin: [process.env.client_address, process.env.google_auth_url],
//   })
// );
app.use(cors());

// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
//   // Other CORS headers and settings as needed
//   next();
// });

app.use("/", youtubeApi);
app.use("/", upload);
app.use("/", session);
app.use("/", assignVideo);
app.use("/", listVideo);
app.use("/", downloadVideo);
app.use("/", uploadToYoutube);
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/signup", async (req, res) => {
  try {
    console.log(req.body);
    const { data, error } = await supabase.auth.signUp({
      email: req.body.email,
      password: req.body.password,
    });
    if (error) {
      res.send(error.message);
      console.log(error);
    } else {
      console.log(data);
      res.send("You signed up successfully");
      res.status(200);
    }
  } catch (error) {
    console.log(error.message);
  }
});

app.post("/signinWithPassword", async function (req, res) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: req.body.email,
      password: req.body.password,
    });
    if (error) {
      res.send(error.message);
    } else {
      // console.log(data);
      res.send("You signed in successfully");
    }
  } catch (error) {
    console.log(error);
  }
});

app.get("/home", (req, res) => {
  res.send("home");
});

app.get("/signinWithGoogle", async (req, res) => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
    res.redirect(data.url);
    // res.send("You logged in successfully");
  } catch (error) {
    res.send("Error" + error);
  }
});
//route after logging in the user first time to collect the info
app.post("/user_info", async (req, res) => {
  try {
    const user = await supabase.auth.getUser();
    console.log(user.email);
    const userId = user.data.id;
    const { error } = await supabase.from("user_profile").insert({
      id: userId,
      // username: req.body.username,
      // email: req.body.email,
      // isOwner: req.body.isOwner,
    });
    if (error) {
      res.send(error.message);
    } else {
      res.send("Details registered succesfully");
    }
  } catch (error) {
    console.log(error);
  }
});

app.listen(port, () => {
  console.log("Started Application on " + port);
});
