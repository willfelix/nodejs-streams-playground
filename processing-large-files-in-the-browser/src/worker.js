import Service from "./service.js";

console.log(`[worker] I'm ready!`);

const service = new Service();
onmessage = ({ data }) => {
    const { file, query } = data;

    service.processFile({
        query,
        file,
        onOcurrenceUpdate: (args) => {
            postMessage({
                eventType: "occurenceUpdate",
                ...args
            });
        },
        onProgress: (total) => {
            postMessage({ eventType: "progress", total });
        }
    });
};
