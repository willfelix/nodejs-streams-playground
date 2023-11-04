import { pipeline } from "node:stream/promises";
import { createReadStream, createWriteStream, statSync } from "node:fs";

import { Reporter } from "./streams/reporter.js";
import { CSVToNDJSON } from "./streams/csvtondjson.js";

async function main() {
    const filepath = "./data/bigfile.csv";
    const csv = createReadStream(filepath);
    const { size} = statSync(filepath);

    const csvtondjson = new CSVToNDJSON({
        headers: ["id", "name", "age"]
    });

    const reporter = new Reporter({});
    
    const writetofile = createWriteStream("./data/bigfile.json");

    await pipeline(
        csv, 
        csvtondjson, 
        reporter.progress(size), 
        writetofile
    );

    console.log("Done!");
}

main();
