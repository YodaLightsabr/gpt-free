#!/usr/bin/env node

import Client from './index.js';

const prompt = process.argv[2];

const client = new Client();

client.model("chat").ask(prompt).onChunk(_ => process.stdout.write(_)).then(_ => console.log(''));