import { Duplex, Transform } from "node:stream";

const server = new Duplex({
    objectMode: true,
    read() {
        console.log(`[readable] Producing data`);

        // server.on('data') will be trigerred when it calls push method
        this.push(`Creating data from inside 1`);
        this.push(`Creating data from inside 2`);

        // this line finish the production of data
        // if this line doesn't exist the data will be produce infinitely
        this.push(null);
    },
    write(chunk, enc, cb) {
        console.log(`[writable] Receiving data: ${chunk}`);
        cb(null, "sending data from writable to readable");
    }
});

const transformToUppercase = new Transform({
    objectMode: true,
    transform(chunk, enc, cb) {
        cb(null, `[pipe.transformToUppercase] ${chunk.toUpperCase()}`);
    }
});

// this event listen only what the readable stream is producing
server.on("data", (chunk) => {
    console.log(`\n[server.ondata] ${chunk}`);
});

// write method triggers the write function in the Duplex Stream
// this line ignores the pipe, because its trigger directly the writable stream
server.write(`[server.write] Sending data to stream`);

// the same behavior as this.push inside the read function on stream
server.push(`[server.push] Creating data from outside`);

// process begins on this.push or server.push (creating data) that follows through pipes
server.pipe(transformToUppercase).pipe(server);
