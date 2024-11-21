import express, { response } from "express";
import supabase from "./supabaseClient.js";

const router = express.Router();

router.get("/sessionInfo", async (req, res) => {
  const session = await supabase.auth.getSession();
  if (session) {
    res.send(session);
  } else {
    res.send("No session found");
  }
});

export default router;
