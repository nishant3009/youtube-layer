"use client";
import React, { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import axios from "axios";
import Alert from "@mui/material/Alert";

function page() {
  const [username, setUsername] = useState("");
  const [isOwner, setIsOwner] = useState();
  const [email, setEmail] = useState();
  const [error, setError] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const handleSubmit = async () => {
    try {
      if (username == "") {
        setError(true);
        return;
      }

      const formData = {
        username: username,
        isOwner: isOwner,
      };
      await axios.post("http://localhost:5000/user_info", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    async function checkForSession() {
      const response = await axios.get("http://localhost:5000/sessionInfo");
      console.log(response.data.data.session.user.email);
      if (response.data.data.session === null) {
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
        // console.log(response.data);
        setEmail(response.data.data.session.user.email);
      }
    }
    checkForSession();
  });
  return (
    <>
      <div>
        {isAuthenticated ? (
          <div className="relative  bg-white w-full h-[690px] overflow-hidden text-left text-17xl text-black font-inter">
            {error ? (
              <Alert style={{ height: "80px" }} severity="error">
                Fill up all the details{" "}
              </Alert>
            ) : (
              ""
            )}
            <div className="absolute top-[897px] left-[402px] rounded-[14px] bg-gainsboro w-[961px] h-[86px]" />
            <div className="absolute top-[784px] left-[1283px] rounded-[50%] bg-gainsboro w-[100px] h-[100px]" />
            <div className="absolute top-[37px] left-[456px] rounded-[50%] bg-gainsboro w-[165px] h-[164px]" />
            <div className="absolute top-[283px] left-[476px] rounded-3xs bg-gainsboro box-border w-[398px] h-[74px] border-[2px] border-solid border-white" />
            <div className="absolute top-[416px] left-[476px] rounded-3xs bg-gainsboro w-[398px] h-[74px]" />
            <div className="absolute top-[563px] left-[476px] rounded-3xs bg-gainsboro w-[398px] h-[74px]" />
            <div className="absolute top-[710px] left-[586px] rounded-3xs bg-gainsboro w-72 h-[74px]" />
            <div className="absolute top-[710px] left-[476px] rounded-3xs bg-gainsboro w-[92px] h-[74px]" />
            <div className="absolute grid top-[200px] left-[476px] font-light  w-[409px] h-9">
              Username
              <TextField
                onChange={(e) => {
                  setUsername(e.target.value);
                }}
                id="outlined-basic"
                variant="outlined"
              />
            </div>
            <div className="absolute grid top-[300px] left-[476px] font-light  w-[409px] h-9">
              You are a ...
              <div className="font-light w-[409px] text-xs text-slate-500">
                {isOwner ? (
                  <p>
                    Creator is one who will link account to youtube and will
                    pass video to editor
                  </p>
                ) : (
                  <p>
                    Editor is one who will recieve the videos from the creator
                    to edit
                  </p>
                )}
              </div>
              <Box
                sx={{
                  marginTop: 2,
                  minWidth: 120,
                }}
              >
                <FormControl fullWidth>
                  <InputLabel id="demo-simple-select-label"></InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={isOwner}
                    onChange={(value) => {
                      setIsOwner(value);
                    }}
                  >
                    <MenuItem value={true}>Creator</MenuItem>
                    <MenuItem value={false}>Editor</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </div>

            <div className="absolute  rounded-sm grid top-[450px] left-[476px] font-light w-[409px] h-9 bg-green-400 text-white">
              <Button
                onClick={handleSubmit}
                className="bg-green-400 text-white "
              >
                Submit
              </Button>
            </div>

            <div className=" flex absolute top-[80px] left-[460px] text-21xl font-extrabold  w-[358px] h-28"></div>
            <img
              className="absolute top-[543px] left-[0px] w-[476px] h-[339px] object-cover"
              alt="Avatar image "
              src="https://img.freepik.com/free-vector/open-source-concept-illustration_114360-3583.jpg?w=996&t=st=1685906975~exp=1685907575~hmac=676ea80776dbd97f03deba16d09409b1c8dc9d30cd75ca543d5dfafb7f194b1a"
            />
            <div className="absolute top-[312px] left-[192px] text-21xl font-extrabold inline-block w-80 h-[283px]"></div>
          </div>
        ) : (
          <div> No session found </div>
        )}
      </div>
    </>
  );
}

export default page;
