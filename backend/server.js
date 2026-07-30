import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/mongodb.js";
import chatMessageModel from "./models/chatMessageModel.js";

// Route imports
import userRouter from "./routes/userRoute.js";
import professionalRouter from "./routes/professionalRoute.js";
import adminRouter from "./routes/adminRoute.js";
import categoryRouter from "./routes/categoryRoute.js";
import bookingRouter from "./routes/bookingRoute.js";
import paymentRouter from "./routes/paymentRoute.js";
import reviewRouter from "./routes/reviewRoute.js";

// --- App setup ---
const app = express();
const PORT = process.env.PORT || 8000;

// --- Dynamic CORS Middleware ---
const configuredOrigins = [
  process.env.CUSTOMER_FRONTEND_URL,
  process.env.PRO_FRONTEND_URL,
  process.env.ADMIN_FRONTEND_URL,
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : []),
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
].filter(Boolean);

const checkOrigin = (origin, callback) => {
  // Allow requests with no origin (like mobile apps, curl, server-to-server)
  if (!origin) return callback(null, true);

  // Check exact configured origins
  if (configuredOrigins.includes(origin)) {
    return callback(null, true);
  }

  // Allow any Vercel domain, Render domain, or localhost
  if (
    origin.endsWith(".vercel.app") ||
    origin.endsWith(".onrender.com") ||
    origin.includes("localhost") ||
    origin.includes("127.0.0.1")
  ) {
    return callback(null, true);
  }

  return callback(new Error(`CORS error: Origin ${origin} not allowed.`));
};

app.use(
  cors({
    origin: checkOrigin,
    credentials: true,
  })
);

app.use(express.json());

// --- API Routes ---
app.use("/api/user", userRouter);
app.use("/api/professional", professionalRouter);
app.use("/api/admin", adminRouter);
app.use("/api/category", categoryRouter);
app.use("/api/booking", bookingRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/review", reviewRouter);

// Health check
app.get("/", (_req, res) => {
  res.json({ success: true, message: "Home Services Marketplace API is running." });
});

// --- HTTP Server & Socket.io ---
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: checkOrigin,
    credentials: true,
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  // Join room for specific booking status updates & chat
  socket.on("joinRoom", ({ bookingId }) => {
    if (bookingId) {
      socket.join(bookingId.toString());
    }
  });

  socket.on("leaveRoom", ({ bookingId }) => {
    if (bookingId) {
      socket.leave(bookingId.toString());
    }
  });

  // Handle in-app chat messages
  socket.on("sendMessage", async ({ bookingId, senderId, senderRole, message }) => {
    try {
      if (!bookingId || !senderId || !message) return;

      const chatDoc = await chatMessageModel.create({
        booking: bookingId,
        sender: senderId,
        senderRole,
        message,
      });

      const populatedMsg = await chatMessageModel
        .findById(chatDoc._id)
        .populate("sender", "name email role");

      // Emit to booking room
      io.to(bookingId.toString()).emit("receiveMessage", populatedMsg);
    } catch (error) {
      console.error("Socket sendMessage error:", error);
    }
  });
});

// --- Start server ---
const startServer = async () => {
  await connectDB();

  server.listen(PORT, () => {
    console.log(`🚀 Server & Socket.io running on http://localhost:${PORT}`);
  });
};

startServer();
