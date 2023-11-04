import { PassThrough } from "node:stream";

import { log } from "../utils/log.js";

export class Reporter {
    #loggerFn;
    #totalProgress = 0;

    constructor({ logger = log }) {
        this.#loggerFn = logger;
    }

    #onData(size) {
        let amountOfProcessedChunks = 0;
        return (chunk) => {
            amountOfProcessedChunks += chunk.length - 25;
            this.#totalProgress = (amountOfProcessedChunks / size) * 100;
            this.#loggerFn(`Progress: ${this.#totalProgress.toFixed(2)}%`);
        };
    }

    progress(size) {
        const stream = new PassThrough();
        stream.on("data", this.#onData(size));
        stream.on("end", () =>
            this.#loggerFn(`Finished process with ${this.#totalProgress}%`)
        );
        return stream;
    }
}
