const express = require("express");
const dotenv = require("dotenv");
const http = require("http");
const cors = require("cors");
const path = require("path");
const { Server } = require("socket.io");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());


app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
  maxHttpBufferSize: 1e8,
  pingTimeout: 60000,
});

// Enum and Types
const SocketEvent = {
  JOIN_REQUEST: "join-request",
  JOIN_ACCEPTED: "join-accepted",
  USER_JOINED: "user-joined",
  USER_DISCONNECTED: "user-disconnected",
  SYNC_FILE_STRUCTURE: "sync-file-structure",
  DIRECTORY_CREATED: "directory-created",
  DIRECTORY_UPDATED: "directory-updated",
  DIRECTORY_RENAMED: "directory-renamed",
  DIRECTORY_DELETED: "directory-deleted",
  FILE_CREATED: "file-created",
  FILE_UPDATED: "file-updated",
  FILE_RENAMED: "file-renamed",
  FILE_DELETED: "file-deleted",
  USER_OFFLINE: "offline",
  USER_ONLINE: "online",
  SEND_MESSAGE: "send-message",
  RECEIVE_MESSAGE: "receive-message",
  TYPING_START: "typing-start",
  TYPING_PAUSE: "typing-pause",
  USERNAME_EXISTS: "username-exists",
  REQUEST_DRAWING: "request-drawing",
  SYNC_DRAWING: "sync-drawing",
  DRAWING_UPDATE: "drawing-update",
};

const USER_CONNECTION_STATUS = {
  OFFLINE: "offline",
  ONLINE: "online",
};

let userSocketMap = [];

// Utility Functions
function getUsersInRoom(roomId) {
  return userSocketMap.filter((user) => user.roomId === roomId);
}

function getRoomId(socketId) {
  const user = userSocketMap.find((user) => user.socketId === socketId);
  if (!user) {
    console.error("Room ID is undefined for socket ID:", socketId);
    return null;
  }
  return user.roomId;
}

function getUserBySocketId(socketId) {
  return userSocketMap.find((user) => user.socketId === socketId);
}

// Socket.IO Events
io.on("connection", (socket) => {
  socket.on(SocketEvent.JOIN_REQUEST, ({ roomId, username }) => {
    const isUsernameExist = getUsersInRoom(roomId).some(
      (user) => user.username === username
    );
    if (isUsernameExist) {
      io.to(socket.id).emit(SocketEvent.USERNAME_EXISTS);
      return;
    }

    const user = {
      username,
      roomId,
      status: USER_CONNECTION_STATUS.ONLINE,
      cursorPosition: 0,
      typing: false,
      socketId: socket.id,
      currentFile: null,
    };
    userSocketMap.push(user);
    socket.join(roomId);
    socket.broadcast.to(roomId).emit(SocketEvent.USER_JOINED, { user });
    const users = getUsersInRoom(roomId);
    io.to(socket.id).emit(SocketEvent.JOIN_ACCEPTED, { user, users });
  });

  socket.on("disconnecting", () => {
    const user = getUserBySocketId(socket.id);
    if (!user) return;
    const roomId = user.roomId;
    socket.broadcast.to(roomId).emit(SocketEvent.USER_DISCONNECTED, { user });
    userSocketMap = userSocketMap.filter((u) => u.socketId !== socket.id);
    socket.leave(roomId);
  });

  socket.on(SocketEvent.SYNC_FILE_STRUCTURE, ({ fileStructure, openFiles, activeFile, socketId }) => {
    io.to(socketId).emit(SocketEvent.SYNC_FILE_STRUCTURE, { fileStructure, openFiles, activeFile });
  });

  socket.on(SocketEvent.DIRECTORY_CREATED, ({ parentDirId, newDirectory }) => {
    const roomId = getRoomId(socket.id);
    if (!roomId) return;
    socket.broadcast.to(roomId).emit(SocketEvent.DIRECTORY_CREATED, { parentDirId, newDirectory });
  });

  socket.on(SocketEvent.DIRECTORY_UPDATED, ({ dirId, children }) => {
    const roomId = getRoomId(socket.id);
    if (!roomId) return;
    socket.broadcast.to(roomId).emit(SocketEvent.DIRECTORY_UPDATED, { dirId, children });
  });

  socket.on(SocketEvent.DIRECTORY_RENAMED, ({ dirId, newName }) => {
    const roomId = getRoomId(socket.id);
    if (!roomId) return;
    socket.broadcast.to(roomId).emit(SocketEvent.DIRECTORY_RENAMED, { dirId, newName });
  });

  socket.on(SocketEvent.DIRECTORY_DELETED, ({ dirId }) => {
    const roomId = getRoomId(socket.id);
    if (!roomId) return;
    socket.broadcast.to(roomId).emit(SocketEvent.DIRECTORY_DELETED, { dirId });
  });

  socket.on(SocketEvent.FILE_CREATED, ({ parentDirId, newFile }) => {
    const roomId = getRoomId(socket.id);
    if (!roomId) return;
    socket.broadcast.to(roomId).emit(SocketEvent.FILE_CREATED, { parentDirId, newFile });
  });

  socket.on(SocketEvent.FILE_UPDATED, ({ fileId, newContent }) => {
    const roomId = getRoomId(socket.id);
    if (!roomId) return;
    socket.broadcast.to(roomId).emit(SocketEvent.FILE_UPDATED, { fileId, newContent });
  });

  socket.on(SocketEvent.FILE_RENAMED, ({ fileId, newName }) => {
    const roomId = getRoomId(socket.id);
    if (!roomId) return;
    socket.broadcast.to(roomId).emit(SocketEvent.FILE_RENAMED, { fileId, newName });
  });

  socket.on(SocketEvent.FILE_DELETED, ({ fileId }) => {
    const roomId = getRoomId(socket.id);
    if (!roomId) return;
    socket.broadcast.to(roomId).emit(SocketEvent.FILE_DELETED, { fileId });
  });

  socket.on(SocketEvent.USER_OFFLINE, ({ socketId }) => {
    userSocketMap = userSocketMap.map((user) => {
      if (user.socketId === socketId) {
        return { ...user, status: USER_CONNECTION_STATUS.OFFLINE };
      }
      return user;
    });
    const roomId = getRoomId(socketId);
    if (!roomId) return;
    socket.broadcast.to(roomId).emit(SocketEvent.USER_OFFLINE, { socketId });
  });

  socket.on(SocketEvent.USER_ONLINE, ({ socketId }) => {
    userSocketMap = userSocketMap.map((user) => {
      if (user.socketId === socketId) {
        return { ...user, status: USER_CONNECTION_STATUS.ONLINE };
      }
      return user;
    });
    const roomId = getRoomId(socketId);
    if (!roomId) return;
    socket.broadcast.to(roomId).emit(SocketEvent.USER_ONLINE, { socketId });
  });

  socket.on(SocketEvent.SEND_MESSAGE, ({ message }) => {
    const roomId = getRoomId(socket.id);
    if (!roomId) return;
    socket.broadcast.to(roomId).emit(SocketEvent.RECEIVE_MESSAGE, { message });
  });

  socket.on(SocketEvent.TYPING_START, ({ cursorPosition }) => {
    userSocketMap = userSocketMap.map((user) => {
      if (user.socketId === socket.id) {
        return { ...user, typing: true, cursorPosition };
      }
      return user;
    });
    const user = getUserBySocketId(socket.id);
    if (!user) return;
    const roomId = user.roomId;
    socket.broadcast.to(roomId).emit(SocketEvent.TYPING_START, { user });
  });

  socket.on(SocketEvent.TYPING_PAUSE, () => {
    userSocketMap = userSocketMap.map((user) => {
      if (user.socketId === socket.id) {
        return { ...user, typing: false };
      }
      return user;
    });
    const user = getUserBySocketId(socket.id);
    if (!user) return;
    const roomId = user.roomId;
    socket.broadcast.to(roomId).emit(SocketEvent.TYPING_PAUSE, { user });
  });

  socket.on(SocketEvent.REQUEST_DRAWING, () => {
    const roomId = getRoomId(socket.id);
    if (!roomId) return;
    socket.broadcast.to(roomId).emit(SocketEvent.REQUEST_DRAWING, { socketId: socket.id });
  });

  socket.on(SocketEvent.SYNC_DRAWING, ({ drawingData, socketId }) => {
    socket.broadcast.to(socketId).emit(SocketEvent.SYNC_DRAWING, { drawingData });
  });

  socket.on(SocketEvent.DRAWING_UPDATE, ({ snapshot }) => {
    const roomId = getRoomId(socket.id);
    if (!roomId) return;
    socket.broadcast.to(roomId).emit(SocketEvent.DRAWING_UPDATE, { snapshot });
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
