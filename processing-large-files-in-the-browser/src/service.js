export default class Service {
    processFile({ query, file, onProgress, onOcurrenceUpdate }) {
        const updateProgressStream = this.#updateProgress({
            fileSize: file.size,
            onProgress
        });

        const csvToJSONStream = this.#csvToJSON();

        const writableStream = new WritableStream({
            write(chunk) {
                console.log(chunk);
            }
        });

        file.stream()
            .pipeThrough(new TextDecoderStream())
            .pipeThrough(updateProgressStream)
            .pipeThrough(csvToJSONStream)
            .pipeTo(writableStream);
    }

    #updateProgress({ fileSize, onProgress }) {
        let totalChunk = 0;
        onProgress(0);

        return new TransformStream({
            transform(chunk, controller) {
                totalChunk += chunk.length;
                const percent = (100 / fileSize) * totalChunk;
                onProgress(percent);

                controller.enqueue(chunk);
            }
        });
    }

    #csvToJSON() {
        const DELIMITER = ",";
        const INDEX_NOT_FOUND = -1;
        const BREAKLINE_SYMBOL = "\n";

        let _buffer = "";
        let _columns = "";

        function removeBreakLine(text) {
            return text.replace(BREAKLINE_SYMBOL, "");
        }

        function getJSONLine(line) {
            const json = {};
            const headers = Array.from(_columns);
            for (const lineValue of line.split(DELIMITER)) {
                const key = removeBreakLine(headers.shift());
                const value = removeBreakLine(lineValue);
                const finalValue = value.trimEnd().replace(/"/g, "");
                json[key] = finalValue;
            }

            if (!Object.keys(json).length) return null;

            return json;
        }

        function consumeLineData(breaklineIndex) {
            const lineToProcessIndex = breaklineIndex + BREAKLINE_SYMBOL.length;
            const line = _buffer.slice(0, lineToProcessIndex);
            _buffer = _buffer.slice(lineToProcessIndex);

            return line;
        }

        return new TransformStream({
            transform(chunk, controller) {
                _buffer = _buffer.concat(chunk);
                let breaklineIndex = 0;
                while (breaklineIndex !== INDEX_NOT_FOUND) {
                    breaklineIndex = _buffer.indexOf(BREAKLINE_SYMBOL);
                    if (breaklineIndex === INDEX_NOT_FOUND) break;

                    const lineData = consumeLineData(breaklineIndex);

                    // first line is the columns
                    if (!_columns.length) {
                        _columns = lineData.split(DELIMITER);
                        continue;
                    }

                    // ignore this line if it's an empty line
                    if (lineData === BREAKLINE_SYMBOL) continue;

                    const result = getJSONLine(lineData);
                    if (!result) continue;

                    controller.enqueue(result);
                }
            }
        });
    }
}
