import { Conversation, models } from "./engine.js";
export * from "./engine.js";

export class Client {
    constructor (token = "demo-v1") {
        this.token = token;
        this.fetch = fetch;
    }

    model (model) {
        return new Conversation(models[model], this);
    }

    customModel (model) {
        return new Conversation(model, this);
    }
}

export default Client;