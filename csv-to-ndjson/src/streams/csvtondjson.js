import { Transform } from "node:stream";

const BREAKLINE = "\n";
const INDEX_NOT_FOUND = -1;

export class CSVToNDJSON extends Transform {
    #headers;
    #delimiter = ",";
    #buffer = Buffer.alloc(0);

    constructor({ delimiter = ",", headers }) {
        super();

        this.#headers = headers;
        this.#delimiter = delimiter;
    }

    *#updateBuffer(chunk) {
        this.#buffer = Buffer.concat([this.#buffer, chunk]);

        let breaklineIndex = 0;
        while (breaklineIndex !== INDEX_NOT_FOUND) {
            breaklineIndex = this.#buffer.indexOf(Buffer.from(BREAKLINE));

            if (breaklineIndex === INDEX_NOT_FOUND) break;

            const finalPosition = breaklineIndex + BREAKLINE.length;
            const bufferData = this.#buffer.subarray(0, finalPosition);
            const data = bufferData.toString();
            this.#buffer = this.#buffer.subarray(finalPosition);

            const result = this.#buildChunkItem(data);

            if (!result.length) continue;

            yield Buffer.from(result);
        }
    }

    #buildChunkItem(data) {
        const json = {};
        const headers = Array.from(this.#headers);
        for (const item of data.split(this.#delimiter)) {
            const key = headers.shift();
            const value = item.replace(BREAKLINE, "");

            if (key === value || value === "") break;

            json[key] = isNaN(Number(value)) ? value : Number(value);
        }

        if (Object.values(json).length === 0) {
            return "";
        }

        return JSON.stringify(json) + ",\n";
    }

    _transform(chunk, enc, cb) {
        this.push("[");
        for (const item of this.#updateBuffer(chunk)) {
            this.push(item);
        }
        this.push("]");

        return cb();
    }

    _final(cb) {
        if (!this.#buffer.length) return cb();

        const chunk = Buffer.from(BREAKLINE);
        for (const item of this.#updateBuffer(chunk)) {
            this.push(item);
        }

        cb();
    }
}
