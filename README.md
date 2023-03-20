# GPT-Free
#### GPT-3, but free

--------------------------------

https://gptfree.top


## Example usage
```js
import { Client } from "gpt-free";

const client = new Client();
const conversation = client.model("chat");

const response = conversation.ask("Hello! Write me an essay on the impact of AI.");

// example chunked usage

response.onChunk(chunk => {
    process.stdout.write(chunk);
});

response.onEnd(() => {
    console.log("\nDone!");
});

// example promise usage

response.then(result => {
    console.log(result);
});
```