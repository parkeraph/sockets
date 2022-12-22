require("dotenv").config();
import { Request, Response, Application } from "express";
import express = require("express");
import * as http from "http";
import { Server } from "socket.io";
import * as path from "path";

const app = express();
const server = http.createServer(app);
const serverPort = process.env.SERVER_PORT || "8080";

const corsWhiteList = [
  "http://localhost:" + serverPort,
  "http://localhost:5173",
];

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (origin !== undefined && corsWhiteList.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  },
});

let users: string[] = [];

const getResgisterResponse = () => {
  let responseString =
    "There are currently " +
    users.length +
    " user(s) connected. Current users: " +
    users.join(", ");
  return responseString;
};

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "wwwroot", "index.html"));
});

app.get("/assets/:fileName", function (req, res) {
  res.sendFile(path.join(__dirname, "wwwroot", "assets", req.params.fileName));
});

io.on("connection", function (socket) {
  let displayName: string = "";
  console.log("a user connected");

  socket.once("register-request", function (args) {
    displayName = args;
    console.log("user registered as " + args);
    users.push(args);
    socket.emit("register-response", getResgisterResponse());

    socket.broadcast.emit(
      "user-joined",
      displayName + " has joined the server"
    );
  });

  socket.on("disconnect", () => {
    if (displayName.length) {
      console.log(displayName + " disconnected");
      users = users.filter((user) => user === displayName);
    }
  });
});
server.listen(Number(serverPort), function () {
  console.log("listening on port " + serverPort);
});
