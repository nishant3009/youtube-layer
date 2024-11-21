import express, { response } from "express";
import { google } from "googleapis";
import "dotenv/config";
import axios from "axios";
import supabase from "./supabaseClient.js";
import bodyParser from "body-parser";
import S3 from "aws-sdk/clients/s3.js";
import multer from "multer";
import fs from "fs";

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));

export const oauth2Client = new google.auth.OAuth2(
  process.env.client_id,
  process.env.client_secret,
  process.env.redirect_uri
);

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

let token;
router.get("/videos", (req, res) => {
  const scopes = [
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/youtube.upload",
  ];

  const authorizationUrl = oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: "online",
    /** Pass in the scopes array defined above.
     * Alternatively, if only one scope is needed, you can pass a scope URL as a string */
    scope: scopes,
    // Enable incremental authorization. Recommended as a best practice.
    include_granted_scopes: true,
  });

  res.writeHead(301, { Location: authorizationUrl });
  res.end();
  console.log("done");
});

router.get("/auth?", async (req, res) => {
  try {
    if (req.query.error) {
      res.send("Error: " + req.query.error);
      res.status(401);
    } else {
      token = await oauth2Client.getToken(req.query.code);
      oauth2Client.setCredentials({
        access_token: token,
      });
      console.log(token.res.data.access_token);
      // await sessionStorage.setItem("access_token", token);
      res.send("Token generated successfully");
    }
  } catch (err) {
    console.log(err);
  }
});

router.get("/userChannelInfo", async (req, res) => {
  //   try {
  //     // const accessToken = await getAccessTokenFromUser(oauth2Client);
  //     const youtube = google.youtube({ version: "v3", auth: token });
  //     const response = await youtube.channels.list({
  //       part: "snippet,statistics",
  //       mine: true, // Retrieve the authenticated user's channel
  //     });
  //     const storage = multer.diskStorage({
  //   destination: "uploads/",
  //   filename: (req, file, cb) => {
  //     cb(null, `${req.id}-${Date.now()}-${file.originalname}`);
  //   },
  // });
  //     const channel = response.data.items[0];
  //     res.json(channel);
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).send("Error fetching channel information");
  //   }
});

//using axios
router.get("/getChannelData", async (req, res) => {
  try {
    // console.log(oauth2Client);
    // const token = req.body.access_token;
    const accessToken =
      oauth2Client.credentials.access_token.tokens.access_token;
    console.log(oauth2Client.credentials);
    const response = await axios.get(
      `https://youtube.googleapis.com/youtube/v3/channels?part=snippet%2CcontentDetails%2Cstatistics&mine=true&key=${process.env.google_api_key}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const responseArray = [];
    await response.data.items.map((item) => {
      responseArray.push({
        id: item.id,
        channelName: item.snippet.title,
        channelDescription: item.snippet.description,
        channelProfilePicture: item.snippet.thumbnails.default.url,
        totalViews: item.statistics.viewCount,
        totalVideos: item.statistics.videoCount,
      });
    });
    res.send(responseArray);
  } catch (error) {
    res.send(error);
    console.log(error.message);
  }
});

router.post("/uploadToYoutube", upload.single("file"), async (req, res) => {
  try {
    const newAcc = await oauth2Client.refreshAccessToken();
    console.log(newAcc);
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
      // console.log(oauth2Client);
      // console.log(req.file.path);
      const request = youtube.videos.insert(
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
          if (err) {
            console.log(err);
          } else {
            console.log(data.data);
          }
        }
      );
    }
  } catch (error) {
    res.send(error.message);
  }
});

export default router;
