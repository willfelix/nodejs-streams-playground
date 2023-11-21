export default class Controller {
    #view;
    #service;
    #worker;
    #events = {
        alive() {
            console.log("alive");
        },
        progress: ({ total }) => {
            this.#view.updateProgress(total);
        },
        ocurrenceUpdate(data) {
            console.log(`ocurrenceUpdate`, data);
        }
    };

    constructor({ view, service, worker }) {
        this.#view = view;
        this.#service = service;
        this.#worker = worker;
    }

    static init(deps) {
        const controller = new Controller(deps);
        controller.init();
        return controller;
    }

    init() {
        this.#view.configureOnFileChange(
            this.#configureOnFileChange.bind(this)
        );

        this.#view.configureOnSubmit(this.#configureOnSubmit.bind(this));

        this.#configureWorker(this.#worker);
    }

    #formatBytes(bytes) {
        const units = ["B", "KB", "MB", "GB", "TB"];
        let i = 0;
        for (i; bytes >= 1024 && i < 4; i++) {
            bytes /= 1024;
        }

        return `${bytes.toFixed(2)} ${units[i]}`;
    }

    #configureWorker(worker) {
        worker.onmessage = ({ data }) => {
            const { eventType, ...msg } = data;
            this.#events[eventType](msg);
        };
    }

    #configureOnFileChange(file) {
        this.#view.setFileSize(this.#formatBytes(file.size));
    }

    #configureOnSubmit({ description, file }) {
        const query = {};
        query["call description"] = new RegExp(description, "i");
        // HOLD | hold | hOlD
        if (this.#view.isWorkerEnabled()) {
            console.log("executing on worker thread!");
            this.#worker.postMessage({ file, query });
            return;
        }
        console.log("executing on main thread!");
    }
}
