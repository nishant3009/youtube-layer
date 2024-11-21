import express from "express";
import bodyParser from "body-parser";
import S3 from "aws-sdk/clients/s3.js";
import Youtube from "youtube-api";
import supabase from "./supabaseClient.js";
import oauth2Client from "./youtubeApi.js";
import { google } from "googleapis";
import path from "path";
import multer from "multer";
import fs from "fs";

const route = express.Router();

// const oauth = Youtube.authenticate({
//   type: "oauth",
//   client_id: process.env.client_id,
//   client_secret: process.env.client_secret,
//   redirect_url: process.env.redirect_url,
// });
// const uploadFolder = path.join(__dirname, "uploads");

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, `${file.originalname}`);
  },
});
const upload = multer({ storage });

const s3 = new S3({
  endpoint: process.env.s3_endpoint,
  accessKeyId: `${process.env.s3_access_key_id}`,
  secretAccessKey: `${process.env.s3_access_key_secret}`,
  signatureVersion: "v4",
});

// console.log(oauth);

route.post("/uploadToYoutube", upload.single("file"), async (req, res) => {
  try {
    // res.send(oauth.credentials);
    const video_id = req.body.video_id;
    const user = await supabase.auth.getUser();
    const id = user.data.user.id;
    const user_info = await supabase
      .from("user_profile")
      .select("*")
      .eq("id", id);
    const video_info = await supabase
      .from("video_log")
      .select("*")
      .eq("id", video_id);
    // console.log(user_info);
    // console.log(video_info);
    if (
      user_info.data[0].isOwner === false &&
      video_info.data[0].owner_id !== id
    ) {
      res.send("You are not authorized to upload videos");
      return;
    } else if (video_info.data[0].status !== "EDITED") {
      res.send("Video is not edited yet");
      return;
    } else {
      const s3data = {
        Bucket: process.env.s3_bucket_name,
        // Key: `${video_info.data[0].owner_id}/${video_info.data[0].video_name}`,
        Key: "8eb2be3a-a089-4047-8586-22b85777d079/big_buck_bunny_720p_1mb.mp4",
      };
      const fileStream = s3.getObject(s3data).createReadStream();
      const youtube = google.youtube({
        version: "v3",
        auth: oauth2Client,
      });
      console.log(oauth2Client);
      // console.log(req.file.path);
      const request = await youtube.videos.insert(
        {
          resource: {
            snippet: {
              title: req.body.title,
              description: req.body.description,
            },
            status: {
              privacyStatus: "private",
            },
          },
          part: "snippet, status",
          media: {
            mediaType: "mp4",
            body: fs.createReadStream(req.file.path),
          },
        },
        (err, data) => {
          // console.log(err);
          // console.log("Video is uploaded successfully to Youtube!");
          // const id = data.data.id;
          // const youtube_url = `https://www.youtube.com/watchv=${id}`;
          // console.log(youtube_url);
        }
      );
    }
  } catch (error) {
    res.send(error.message);
  }
});

export default route;
