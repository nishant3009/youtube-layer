import express from "express";
import "dotenv/config";
import multer from "multer";
import supabase from "./supabaseClient.js";
import S3 from "aws-sdk/clients/s3.js";
import fs from "fs";

const router = express.Router();
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, `${file.originalname}`);
  },
});

const s3 = new S3({
  endpoint: process.env.s3_endpoint,
  accessKeyId: `${process.env.s3_access_key_id}`,
  secretAccessKey: `${process.env.s3_access_key_secret}`,
  signatureVersion: "v4",
});

const upload = multer({ storage });

router.post("/uploadVideo", upload.single("file"), async function (req, res) {
  try {
    const user = await supabase.auth.getUser();
    const id = user.data.user.id;
    const file = fs.readFileSync(req.file.path);

    // Save the video URL to your database or perform any other necessary operations
    const upload_response = await s3
      .upload({
        Bucket: process.env.s3_bucket_name,
        Key: `${id}/${req.file.filename}`,
        ContentType: "video/mp4",
        Body: file,
      })
      .promise();

    if (upload_response) {
      console.log(id);
      const response = await supabase.from("video_log").insert({
        video_name: req.file.filename,
        owner_id: id,
        owner_email: user.data.user.email,
      });
      console.log(response);
      res.send("File uploaded successfully");
    } else {
      res.send("File upload failed");
    }
  } catch (error) {
    res.send(error);
  }
});

router.post(
  "/uploadEditedVideo",
  upload.single("file"),
  async function (req, res) {
    try {
      const user = await supabase.auth.getUser();
      const id = user.data.user.id;
      const file = fs.readFileSync(req.file.path);
      const video_id = req.body.video_id;

      const user_info = await supabase
        .from("user_profile")
        .select("isOwner")
        .eq("id", id);
      console.log(user_info);
      const video_info = await supabase
        .from("video_log")
        .select("*")
        .eq("id", video_id);

      console.log(user_info.data[0].isOwner);
      console.log(video_info.data[0].status);
      console.log(video_info.data[0].editor_id);
      // Save the video URL to your database or perform any other necessary operations
      if (
        user_info.data[0].isOwner === false &&
        video_info.data[0].status !== "EDITIED" &&
        video_info.data[0].editor_id === id
      ) {
        const upload_response = await s3
          .upload({
            Bucket: process.env.s3_bucket_name,
            Key: `${video_info.data[0].owner_id}/${video_info.data[0].video_name}`,
            ContentType: "video/mp4",
            Body: file,
          })
          .promise();

        if (upload_response) {
          const response = await supabase
            .from("video_log")
            .update({
              status: "EDITED",
            })
            .eq("id", video_id);
          console.log(response);
          res.send("Edited Video uploaded successfully");
        }
      } else {
        res.send("File upload failed");
      }
    } catch (error) {
      res.send(error.message);
    }
  }
);

export default router;
