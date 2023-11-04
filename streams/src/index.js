import { Transform } from "node:stream";
import { createReadStream, createWriteStream } from "node:fs";

const filename = "./data/bigfile.txt";

const mapIntoObject = new Transform({
  transform(chunk, enc, cb) {
    const data = chunk.toString().replaceAll("world ", "will\n");
    cb(null, data);
  },
});

const writeToFile = createWriteStream("./data/result.txt");

createReadStream(filename)
  .once("ready", () => console.log("Starting process data..."))
  .pipe(mapIntoObject)
  .pipe(writeToFile)
  .on("finish", () => console.log("Finished process..."));
