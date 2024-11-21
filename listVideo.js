import express from "express";
import supabase from "./supabaseClient.js";

const route = express.Router();

//route to show videos by the particular owner

route.get("/listOwnerVideo", async (req, res) => {
  const user = await supabase.auth.getUser();
  console.log(user);
  const response = await supabase
    .from("video_log")
    .select("*")
    .eq("owner_email", user.data.user.email);
  res.send(response.data);
});

//route to show videos by the particular editor

route.get("/listEditorVideo", async (req, res) => {
  const user = await supabase.auth.getUser();
  const response = await supabase
    .from("video_log")
    .select("*")
    .eq("editor_email", user.data.user.email);
  res.send(response.data);
});

export default route;
