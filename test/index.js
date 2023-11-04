import express from "express";
import fs from "node:fs";
import path from "node:path";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

app.get("/test", (req, res) => {
    try {
        fs.readFile(path.dirname + "/index.mjs", (err, data) => {
            // try {
            runDanger();
            res.json({ deubom: true });
            // } catch (error) {
            //     console.log("CAIU AQUI DENTRO? ERROR: ", error);
            //     res.json({ deubom: false });
            // }
        });
    } catch (error) {
        console.log("CAIU AQUI? ERROR: ", error);
        res.json({ seila: true });
    }
});

function runDanger() {
    throw new Error("Error modafoca");
}

app.listen(3000, () => {
    console.log("SERVER STARTED");
});

process.on("uncaughtException", (err) => {
    fs.writeSync(1, `Caught exception: ${err}\n`);

    process.exit();
});
