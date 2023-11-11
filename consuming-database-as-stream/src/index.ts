import { PrismaClient } from "@prisma/client";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";

const prisma = new PrismaClient();

async function main() {
    console.log("starting process...\n");
    await doQuery();
    // await doQueryAsStream();

    console.log("\nprocess was finished!");
}

async function doQuery() {
    console.time("query");

    const versiculos = await prisma.versiculos.findMany();
    console.log({ versiculos: JSON.stringify(versiculos) });

    console.timeEnd("query");
}

async function doQueryAsStream() {
    console.time("queryStream");

    async function* readable() {
        const take = 500;
        let skip = 0;

        while (true) {
            const versiculos = await prisma.versiculos.findMany({
                take,
                skip
            });

            skip += take;
            if (!versiculos.length) break;
            for await (let item of versiculos) yield `${JSON.stringify(item)}\n`;
        }
    }

    await pipeline(readable, createWriteStream("./data/query.txt"));

    console.timeEnd("queryStream");
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
