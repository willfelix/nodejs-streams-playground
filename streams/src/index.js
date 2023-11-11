import rdl from "node:readline";
import { PassThrough, Transform } from "node:stream";
import { statSync, createReadStream, createWriteStream, write } from "node:fs";

const filename = "./data/bigfile.txt";

const printProgress = () => {
    let cursor = 4;
    let byteCount = 0;
    const set = new Set();
    const { size } = statSync(filename);

    return new PassThrough({
        /**
         * @param {Buffer} chunk
         * @param {*} enc
         * @param {*} cb
         */
        write(chunk, enc, cb) {
            if (byteCount === 0) {
                process.stdout.write("\x1B[?25l");
                process.stdout.write("0% [");
                for (let i = 0; i <= 100; i++) {
                    process.stdout.write("\u2591");
                }
                process.stdout.write("] 100%");
            }

            byteCount += chunk.byteLength;
            const percent = Math.floor(parseFloat(byteCount / size) * 100);
            if (!set.has(percent)) {
                set.add(percent);
                rdl.cursorTo(process.stdout, cursor);
                process.stdout.write(`\u2588`);
                cursor++;
            }

            cb();
        },

        final(cb) {
            process.stdout.write("\x1B[?25h");
            console.log();
            cb();
        }
    });
};

const mapIntoObject = new Transform({
    transform(chunk, enc, cb) {
        const data = chunk.toString().replaceAll("world ", "will\n");
        cb(null, data);
    }
});

const writeToFile = createWriteStream("./data/result.txt");

createReadStream(filename)
    .once("ready", () => {
        rdl.clearScreenDown();
        console.time("stream");
        console.log("Starting process data...");
    })
    .pipe(printProgress())
    .pipe(mapIntoObject)
    .pipe(writeToFile)
    .on("finish", () => {
        console.log("Finished process...");
        console.timeEnd("stream");
    });
