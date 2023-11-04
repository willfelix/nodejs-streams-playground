import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { setTimeout } from "node:timers/promises";
import { Readable, Transform } from "node:stream";
import { WritableStream, TransformStream } from "node:stream/web";

import csvtojson from "csvtojson";

const PORT = 3000;

createServer(async (req, res) => {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*"
    };

    if (req.method === "OPTIONS") {
        res.writeHead(204, headers);
        res.end();
        return;
    }

    let items = 0;
    const abortController = new AbortController();

    req.once("close", () => {
        console.log(`\nConnection was closed with ${items} items processed!\n`);
        abortController.abort();
    });

    res.writeHead(200, headers);

    Readable.toWeb(createReadStream("./data/animeflv.csv"))
        .pipeThrough(Transform.toWeb(csvtojson()))
        .pipeThrough(
            new TransformStream({
                transform(chunk, controller) {
                    const data = JSON.parse(Buffer.from(chunk));
                    console.log(data);

                    items++;
                    controller.enqueue(chunk);
                }
            })
        )
        .pipeTo(
            new WritableStream({
                async write(chunk) {
                    await setTimeout(300);
                    res.write(chunk);
                },
                close() {
                    res.end();
                }
            }),
            {
                signal: abortController.signal
            }
        )
        .catch((error) => {
            if (!error.message.includes("abort")) throw error;
        });
})
    .listen(PORT)
    .on("listening", () =>
        console.log(`\nApplication is running on port ${PORT}...\n`)
    );
