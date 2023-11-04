/**
 * Qual a diferença entre adicionar uma função num onclick e
 * chamar o método ja existente addEventListener?
 *
 * Estudar mais sobre AbortController
 *
 * Entender as diferenças entre Strems e WebStreams
 */

const API_URL = "http://localhost:3000";

let abortController = new AbortController();
let counter = 0;
let buffer = "";

const $cards = document.getElementById("cards");

document.getElementById("start").onclick = async () => {
    await consume(abortController.signal);
};

document.getElementById("stop").onclick = async () => {
    abortController.abort();
    abortController = new AbortController();
    counter = 0;
};

async function consume(signal) {
    const response = await fetch(API_URL, { signal });

    response.body
        .pipeThrough(new TextDecoderStream())
        .pipeThrough(
            new TransformStream({
                transform(chunk, controller) {
                    // const items = chunk.toString().split("\n");
                    // const data = items.filter((i) => i).map(JSON.parse);

                    // data.forEach((d) => controller.enqueue(d));

                    buffer += chunk;

                    const items = buffer.split("\n");
                    items
                        .slice(0, -1)
                        .forEach((item) =>
                            controller.enqueue(JSON.parse(item))
                        );

                    buffer = items[items.length - 1];
                },
                flush(controller) {
                    if (!buffer) return;
                    controller.enqueue(JSON.parse(buffer));
                }
            })
        )
        .pipeTo(
            new WritableStream({
                write({ title, description, url_anime, image }) {
                    const card = `
                        <article>
                            <div class="text">
                                <h3>[${++counter}] ${title}</h3>
                                <p>${description.slice(0, 100)}</p>
                                <img src='${image}' width='100' />
                                <a href="${url_anime}"> Here's why</a>
                            </div>
                        </article>
                    `;

                    $cards.innerHTML += card;
                }
            }),
            { signal }
        );
}
