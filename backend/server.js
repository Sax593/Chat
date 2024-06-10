// backend/server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { PrismaClient } = require("@prisma/client");
const cors = require("cors");

const prisma = new PrismaClient();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// Endpoint pour obtenir tous les messages
app.get("/messages", async (req, res) => {
  const messages = await prisma.message.findMany({
    orderBy: { createdAt: "asc" },
  });
  res.json(messages);
});

// Endpoint pour créer un nouveau message
app.post("/messages", async (req, res) => {
  const { content, sender } = req.body;
  const newMessage = await prisma.message.create({
    data: { content, sender },
  });
  res.status(201).json(newMessage);
});

// Logique pour gérer les WebSockets
io.on("connection", (socket) => {
  console.log("Un client est connecté");

  socket.on("message", async (data) => {
    const { content, sender } = data;
    const newMessage = await prisma.message.create({
      data: { content, sender },
    });

    // Diffuser le message à tous les clients
    io.emit("newMessage", newMessage);
  });

  socket.on("disconnect", () => {
    console.log(`Un client s'est déconnecté`);
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
