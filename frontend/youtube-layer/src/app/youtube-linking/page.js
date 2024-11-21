"use client";

import { Button } from "@mui/material";
import axios from "axios";

export default function page() {
  const handleClick = async () => {
    const response = await axios.get("http://localhost:5000/videos");
    console.log(response.data);
  };

  return (
    <div>
      <Button onClick={handleClick}> Link Youtube </Button>
    </div>
  );
}
