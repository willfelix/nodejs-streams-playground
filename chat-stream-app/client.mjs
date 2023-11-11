import net from "node:net";
import { Writable, PassThrough } from "node:stream";

const me = { id: "" };
const messages = [];
const server = net.connect(3000);

process.stdout.cursorTo(0, 0);
process.stdout.clearScreenDown();

const log = (msg) => process.stdout.write(msg);

const onLog = () => {
    process.stdout.cursorTo(0, 0);
    process.stdout.clearScreenDown();
    log(`[client] Hi, I'm ${me?.id} and I am connected!\n\n`);

    messages.forEach(log);

    log(`\nType your message: `);
};

const updateLogStream = new PassThrough();
updateLogStream.on("data", onLog);

const output = new Writable({
    write(chunk, enc, cb) {
        const data = JSON.parse(chunk);

        if (!data.message) {
            me.id = data.id;
        } else if (data.id === me.id) {
            messages.push(`>> [I said]: ${data.message}`);
        } else {
            messages.push(`>> [${data.id} says]: ${data.message}`);
        }

        onLog();

        cb(null, chunk);
    }
});

// server.once("connect", () => {
//     log(`[client] Hi, I'm ${me?.id} and I am connected!\n\n`);
// });

process.stdin.pipe(updateLogStream).pipe(server).pipe(output);
