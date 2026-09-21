import http from "http";
import { Server } from "socket.io";
import { app } from "./app";
import { env } from "./config/env";
import { configureSocket } from "./socket";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: env.clientUrl === "*" ? true : env.clientUrl,
    methods: ["GET", "POST"]
  }
});

configureSocket(io);

server.listen(env.port, "0.0.0.0", () => {
  console.log(`Qalyubia Market API listening on port ${env.port}`);
  console.log(`Health: http://localhost:${env.port}/health`);
});
