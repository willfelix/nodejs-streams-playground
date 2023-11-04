import { describe, it, expect, jest } from "@jest/globals";
import { CSVToNDJSON } from "../../../src/streams/csvtondjson";

describe("# CSVToNDJSON", () => {
    it("should return a ndjson when passing a valid csv input", () => {
        const csv = `id,name,age\n1,will,30\n2,drika,29\n`;
        const stream = new CSVToNDJSON({
            delimiter: ",",
            headers: ["id", "name", "age"]
        });

        const expected = JSON.stringify([
            { id: 1, name: "will", age: 30 },
            { id: 2, name: "drika", age: 29 }
        ]);

        const fn = jest.fn();
        stream.on("data", fn);
        stream.write(csv);
        stream.end();

        const [first, second] = fn.mock.calls;
        const result = `[${first},${second}]`;

        expect(fn).toBeCalledTimes(2);
        expect(result).toStrictEqual(expected);
    });

    it("should return a ndjson when input has not breakline in the end", () => {
        const csv = `id,name,age\n1,will,30\n2,drika,29`;
        const stream = new CSVToNDJSON({
            delimiter: ",",
            headers: ["id", "name", "age"]
        });

        const expected = JSON.stringify([
            { id: 1, name: "will", age: 30 },
            { id: 2, name: "drika", age: 29 }
        ]);

        const fn = jest.fn();
        stream.on("data", fn);
        stream.write(csv);
        stream.end();

        const [first, second] = fn.mock.calls;
        const result = `[${first},${second}]`;

        expect(fn).toBeCalledTimes(2);
        expect(result).toStrictEqual(expected);
    });

    it("should return a ndjson when input has breakline in the begin", () => {
        const csv = `\nid,name,age\n1,will,30\n2,drika,29\n`;
        const stream = new CSVToNDJSON({
            delimiter: ",",
            headers: ["id", "name", "age"]
        });

        const expected = JSON.stringify([
            { id: 1, name: "will", age: 30 },
            { id: 2, name: "drika", age: 29 }
        ]);

        const fn = jest.fn();
        stream.on("data", fn);
        stream.write(csv);
        stream.end();

        const [first, second] = fn.mock.calls;
        const result = `[${first},${second}]`;

        expect(fn).toBeCalledTimes(2);
        expect(result).toStrictEqual(expected);
    });
});
