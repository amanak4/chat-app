const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const groupRoutes = require("./routes/group");
const app = express();
const socket = require("socket.io");
const Group = require("./models/groupModel");
require("dotenv").config();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connection Successful");
  })
  .catch((err) => {
    console.log(err.message);
  });

app.get("/ping", (_req, res) => {
  return res.json({ msg: "Ping Successful" });
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/groups", groupRoutes); 

const server = app.listen(process.env.PORT, () =>
  console.log(`Server started on ${process.env.PORT}`)
);
const io = socket(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

global.onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`User ${userId} added with socket ID ${socket.id}`);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      console.log(`Sending message from ${data.from} to ${data.to}: ${data.msg}`);
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    }
  });

  socket.on("send-group-msg", async (data) => {
    const { groupId, msg, from } = data;
    console.log("grpID",groupId);
    console.log("msg",msg)
    console.log("from->",from)
    try {
      const group = await Group.findById(groupId).populate("users");
      if (group) {
        console.log("grouplength",group.users)
        group.users.forEach((user) => {
          console.log("userID",user._id.toString());
          const userSocket = onlineUsers.get(user._id.toString());

          console.log("usersocket",userSocket);
          // Emit only to group members excluding the sender
          if (userSocket && user._id.toString() !== from) {
            console.log(`Sending group message to ${user._id.toString()}`);
            socket.to(userSocket).emit("group-msg-recieve", msg);
          }
        });
      }
    } catch (error) {
      console.log("Error sending group message: ", error);
    }
  });

  // Cleanup when a user disconnects
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    // Find the user and remove from the map
    for (const [key, value] of onlineUsers.entries()) {
      if (value === socket.id) {
        onlineUsers.delete(key);
        break;
      }
    }
  });
});

