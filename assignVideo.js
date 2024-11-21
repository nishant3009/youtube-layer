import express, { response } from "express";
import supabase from "./supabaseClient.js";

const route = express.Router();

route.post("/assignEditor", async (req, res) => {
  // owner will provide resgisterd email of the editor

  const editor_email = req.body.editor_email;
  const video_id = req.body.video_id;
  const response = await supabase
    .from("user_profile")
    .select("isOwner,id")
    .eq("email", editor_email);

  const editor_id_field = await response.data[0].id;
  console.log(editor_id_field);
  if (response.data[0].isOwner === false) {
    const response = await supabase
      .from("video_log")
      .update({
        editor_id: editor_id_field,
        editor_email: editor_email,
        status: "ASSIGNED",
      })
      .eq("id", video_id);

    res.send("Editor assigned successfully");
  } else {
    res.send("Given email is not a Editor");
  }
});

export default route;
