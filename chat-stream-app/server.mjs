import net from "node:net";
import { Writable } from "node:stream";
import { randomUUID } from "node:crypto";

const users = new Map();

const notify = (socketId, chunk) => {
  [...users.values()]
    .forEach((user) =>
      user.write(
        JSON.stringify({
          id: socketId,
          message: chunk.toString(),
        })
      )
    );
};

const broadcaster = (socket) => {
  return new Writable({
    write(chunk, enc, cb) {
      notify(socket.id, chunk);
      cb(null, chunk);
    },
  });
};

const server = net.createServer((socket) => socket.pipe(broadcaster(socket)));

server.listen(3000, () => console.log("Server is running at 3000\n"));

server.on("connection", (socket) => {
  socket.id = randomUUID().substring(0, 5);
  socket.write(JSON.stringify({ id: socket.id }));
  console.log(`[server] ${socket.id} is connected!`);

  users.set(socket.id, socket);

  socket.on("close", () => {
    console.log(`[server] ${socket.id} is disconnected!`);
    users.delete(socket.id);
  });
});
