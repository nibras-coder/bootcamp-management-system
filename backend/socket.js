const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const Community = require("./models/Community");
const CommunityMessage = require("./models/CommunityMessage");

let io = null;

const initSocket = (server, corsOptions) => {
  io = new Server(server, {
    cors: corsOptions,
    transports: ["websocket", "polling"],
  });

  // Socket Authentication Middleware
  io.use(async (socket, next) => {
    try {
      let token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace("Bearer ", "") ||
        socket.handshake.query?.token;

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      if (token.startsWith("Bearer ")) {
        token = token.slice(7);
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");

      if (!user || user.isActive === false) {
        return next(new Error("Authentication error: User not found or inactive"));
      }

      socket.user = user;
      next();
    } catch (err) {
      console.error("Socket authentication error:", err.message);
      return next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", async (socket) => {
    // Auto-join all authorized community rooms for this user
    try {
      const userId = socket.user._id || socket.user.id;
      const userCommunities = await Community.find({
        $or: [{ mentor: userId }, { members: userId }],
      }).select("_id");

      userCommunities.forEach((c) => {
        socket.join(`community:${c._id}`);
      });
      socket.join(`user:${userId}`);
    } catch (err) {
      console.error("Error auto-joining community rooms:", err);
    }

    // Join Community Room with strict authorization verification
    socket.on("community:join", async (communityId, callback) => {
      try {
        if (!communityId) return;

        const userId = String(socket.user._id || socket.user.id);
        const community = await Community.findById(communityId);

        if (!community) {
          if (typeof callback === "function") {
            callback({ success: false, message: "Community not found" });
          }
          return;
        }

        const isMentor = String(community.mentor) === userId;
        const isMember = community.members.some((m) => String(m) === userId);
        const isAdmin = socket.user.role === "admin";

        if (!isMentor && !isMember && !isAdmin) {
          if (typeof callback === "function") {
            callback({
              success: false,
              message: "Unauthorized: You are not a member of this community",
            });
          }
          return;
        }

        const room = `community:${communityId}`;
        socket.join(room);

        if (typeof callback === "function") {
          callback({ success: true });
        }
      } catch (error) {
        console.error("Error in community:join:", error);
        if (typeof callback === "function") {
          callback({ success: false, message: error.message });
        }
      }
    });

    // Leave Community Room
    socket.on("community:leave", (communityId) => {
      if (communityId) {
        socket.leave(`community:${communityId}`);
      }
    });

    // Direct Socket Message Support
    socket.on("community:message", async ({ communityId, content }, callback) => {
      try {
        if (!communityId || !content || !content.trim()) return;

        const userId = socket.user._id || socket.user.id;
        const community = await Community.findById(communityId);

        if (!community) {
          if (typeof callback === "function") {
            callback({ success: false, message: "Community not found" });
          }
          return;
        }

        const isMentor = String(community.mentor) === String(userId);
        const isMember = community.members.some((m) => String(m) === String(userId));
        const isAdmin = socket.user.role === "admin";

        if (!isMentor && !isMember && !isAdmin) {
          if (typeof callback === "function") {
            callback({ success: false, message: "Unauthorized" });
          }
          return;
        }

        const message = await CommunityMessage.create({
          community: communityId,
          sender: userId,
          content: content.trim(),
        });

        const populated = await CommunityMessage.findById(message._id)
          .populate("sender", "name email role profilePhoto mentorRole")
          .populate("community", "name track");

        io.to(`community:${communityId}`).emit("community:message:new", populated);

        if (typeof callback === "function") {
          callback({ success: true, data: populated });
        }
      } catch (error) {
        console.error("Error in community:message:", error);
        if (typeof callback === "function") {
          callback({ success: false, message: error.message });
        }
      }
    });


    // Typing indicator
    socket.on("community:typing", ({ communityId, isTyping }) => {
      if (communityId) {
        socket.to(`community:${communityId}`).emit("community:typing", {
          communityId,
          userId: socket.user._id,
          userName: socket.user.name,
          isTyping,
        });
      }
    });

    socket.on("disconnect", () => {
      // Clean up connection
    });
  });

  return io;
};

const emitToCommunity = (communityId, event, data) => {
  if (io && communityId) {
    io.to(`community:${communityId}`).emit(event, data);
  }
};

const emitToUser = (userId, event, data) => {
  if (io && userId) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

const getIO = () => io;

module.exports = {
  initSocket,
  emitToCommunity,
  emitToUser,
  getIO,
};

