import express from "express";
import S3 from "aws-sdk/clients/s3.js";
import supabase from "./supabaseClient.js";

const route = express.Router();

const s3 = new S3({
  endpoint: process.env.s3_endpoint,
  accessKeyId: `${process.env.s3_access_key_id}`,
  secretAccessKey: `${process.env.s3_access_key_secret}`,
  signatureVersion: "v4",
});

route.get("/downloadVideoForEditor", async (req, res) => {
  try {
    const reqVideoId = req.body.video_id;
    const user = await supabase.auth.getUser();
    const id = user.data.user.id;
    const videoInfo = await supabase
      .from("video_log")
      .select("editor_id, owner_id, status,video_name")
      .eq("id", reqVideoId);
    console.log(videoInfo.data[0].editor_id);
    console.log(id);
    if (videoInfo.data[0].editor_id === id) {
      const video = await s3
        .getObject({
          Bucket: process.env.s3_bucket_name,
          Key: `${videoInfo.data[0].owner_id}/${videoInfo.data[0].video_name}`,
        })
        .createReadStream();

      res.setHeader(
        "Content-Disposition",
        "attachment; filename=" + videoInfo.data[0].video_name
      );
      video.pipe(res);
      // res.send(video.data);
    }
  } catch (error) {
    res.send(error.message);
  }
});

route.get("/downloadVideoForOwner", async (req, res) => {
  try {
    const reqVideoId = req.body.video_id;
    const user = await supabase.auth.getUser();
    const id = user.data.user.id;
    const videoInfo = await supabase
      .from("video_log")
      .select("editor_id, owner_id, status,video_name")
      .eq("id", reqVideoId);
    if (videoInfo.data[0].owner_id === id) {
      const video = await s3
        .getObject({
          Bucket: process.env.s3_bucket_name,
          Key: `${videoInfo.data[0].owner_id}/${videoInfo.data[0].video_name}`,
        })
        .createReadStream();

      res.setHeader(
        "Content-Disposition",
        "attachment; filename=" + videoInfo.data[0].video_name
      );
      video.pipe(res);
      // res.send(video.data);
    }
  } catch (error) {
    res.send(error.message);
  }
});

export default route;
