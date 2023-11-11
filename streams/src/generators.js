import { pipeline } from "node:stream/promises";
import { setTimeout } from "node:timers/promises";

async function* customReadable() {
    yield Buffer.from("this is my");
    await setTimeout(100);
    yield Buffer.from("custom readable");
}

async function* customTransform(stream) {
    for await (const chunk of stream) {
        yield chunk.toString().replace(/\s/g, "-");
    }
}

async function* customDuplex(stream) {
    let bytesLength = 0;
    const result = [];
    for await (const chunk of stream) {
        result.push(chunk);
        bytesLength += chunk.length;
    }

    yield `Message: ${result.join("-")}`;
    yield `Bytes: ${bytesLength}`;
}

async function* customWritable(stream) {
    for await (const chunk of stream) {
        console.log(`[writable] ${chunk}`);
    }
}

await pipeline(customReadable, customTransform, customDuplex, customWritable);
