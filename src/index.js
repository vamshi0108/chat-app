const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const { generateMessage } = require("./utils/messages");
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const publicDirectory = path.join(__dirname, "../public");
const { getUser, addUser, removeUser, getUsersInRoom } = require("./utils/users");
const port = process.env.PORT || 3000;
app.use(express.static(publicDirectory));
io.on("connection", (socket) => {
  console.log("new connection");
  socket.on("join", (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options });
    if (error) {
      return callback(error);
    }
    socket.join(user.room);
    socket.emit("message", generateMessage("Welcome to the Vays app!", "Admin"));
    socket
      .to(user.room)
      .broadcast.emit("message", generateMessage(`${user.userName} has joined`, "Admin")); //every connection except present
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
  });
  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    if (user) io.to(user.room).emit("message", generateMessage(message, user.userName));
    callback();
  });
  socket.on("sendLocation", (message, callback) => {
    const user = getUser(socket.id);
    if (user)
      io.to(user.room).emit(
        "messageLocation",
        generateMessage(
          `https://www.google.com/maps?q=${message.lat},${message.long}`,
          user.userName
        )
      );
    callback();
  });
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit("message", generateMessage(`${user.userName} has left`, "Admin"));
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});
server.listen(port, () => console.log("server started"));
