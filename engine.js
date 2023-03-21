import { EventEmitter } from 'events';

function handleChunks (chunks) {
    let error = false;
    let message = '';

    for (const chunk of chunks) {
        if (chunk.error) error = true;
        message += chunk.text;
    }

    return [error, message];
}

export class Response extends EventEmitter {
    constructor (fetchResponse) {
        super();
        this.fetchResponse = fetchResponse;
        this.fetchBody = fetchResponse.body;

        this.data = '';

        this.fetchBody.on('data', (chunk) => {
            const chunks = chunk.toString().trim().split('\n\n').map(a => JSON.parse(a.trim().substring(6)));
            const [error, text] = handleChunks(chunks);
            if (error) return this.emit('error');
            this.data += text;
            this.emit('text', text);
        });

        this.fetchBody.on('end', () => {
            this.emit('end');
        });
    }

    onChunk (callback) {
        this.on('text', text => callback(text, this.data));
        return this;
    }

    onEnd (callback) {
        this.once('end', () => callback(this.data));
        return this;
    }

    onError (callback) {
        this.once('error', () => callback(this.data));
        return this;
    }
}

export class Conversation {
    constructor (model, client, locale = 'en-US') {
        this.locale = locale;
        this.model = model;
        this.client = client;
        this.messages = [];
    }
    
    async #ask (message) {
        this.messages.push({
            author: 'user',
            data: message
        });

        const body = {
            debug: false,
            locale: this.locale,
            messages: this.messages.map(message => ({
                author: message.author,
                content: {
                    text: message.data
                }
            }))
        };

        const res = await this.client.fetch(this.model.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'GPT-Free-Auth': this.client.token
            },
            body: JSON.stringify(body)        
        });

        const response = new Response(res);

        response.onEnd((text) => {
            this.messages.push({
                author: 'assistant',
                data: text
            });
        });

        return response;
    }

    async getCompleteResponse (message) {
        this.messages.push({
            author: 'user',
            data: message
        });

        const body = {
            debug: false,
            locale: this.locale,
            messages: this.messages.map(message => ({
                author: message.author,
                content: {
                    text: message.data
                }
            }))
        };

        const res = await this.client.fetch(this.model.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'GPT-Free-Auth': this.client.token
            },
            body: JSON.stringify(body)        
        }).then(res => res.text());

        const response = res.trim().split('\n\n').map(line => JSON.parse(line.trim().substring(6)).text).join('');
        
        this.messages.push({
            author: 'assistant',
            data: response
        });

        return res;
    }

    ask (message) {
        const responsePromise = this.#ask(message);
        const promise = new Promise((resolve, reject) => {
            responsePromise.then(response => {
                response.onEnd(resolve);
            });
        });

        promise.onChunk = callback => {
            responsePromise.then(response => {
                response.onChunk(callback);
            });
            return promise;
        };

        promise.onEnd = callback => {
            responsePromise.then(response => {
                response.onEnd(callback);
            });
            return promise;
        };
        

        promise.onError = callback => {
            responsePromise.then(response => {
                response.onError(callback);
            });
            return promise;
        };
        
        return promise;
    }

    static ask (message, locale) {
        return new Conversation(locale).ask(message);
    }
}

export const models = {
    chat: {
        name: 'chat',
        endpoint: 'https://chat.gptfree.top/ai'
    }
};

export class Model {
    constructor (name, endpoint) {
        this.name = name;
        this.endpoint = endpoint;
    }
}