import Client from "./index.js";

const client = new Client();

client.model("chat").ask("Hi there! I'm looking for a good place to eat.").then(console.log);