"use strict";
exports.__esModule = true;
require("dotenv").config();
var express = require("express");
var http = require("http");
var socket_io_1 = require("socket.io");
var path = require("path");
var app = express();
var server = http.createServer(app);
var serverPort = process.env.SERVER_PORT || "8080";
var corsWhiteList = [
    "http://localhost:" + serverPort,
    "http://localhost:5173",
];
var io = new socket_io_1.Server(server, {
    cors: {
        origin: function (origin, callback) {
            if (origin !== undefined && corsWhiteList.indexOf(origin) !== -1) {
                callback(null, true);
            }
            else {
                callback(new Error("Not allowed by CORS"));
            }
        }
    }
});
var users = [];
var getResgisterResponse = function () {
    var responseString = "There are currently " +
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
    var displayName = "";
    console.log("a user connected");
    socket.once("register-request", function (args) {
        displayName = args;
        console.log("user registered as " + args);
        users.push(args);
        socket.emit("register-response", getResgisterResponse());
        socket.broadcast.emit("user-joined", displayName + " has joined the server");
    });
    socket.on("disconnect", function () {
        if (displayName.length) {
            console.log(displayName + " disconnected");
            users = users.filter(function (user) { return user === displayName; });
        }
    });
});
server.listen(Number(serverPort), function () {
    console.log("listening on port " + serverPort);
});
