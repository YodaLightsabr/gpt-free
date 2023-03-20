#!/usr/bin/env node

import Client from './index.js';
import chalk from 'chalk';

const prompt = process.argv[2];

const client = new Client();

client.model("chat").ask(prompt).onChunk(_ => process.stdout.write(_)).onError(_ => console.log(chalk.red('There was an unexpected error with your request.'))).then(_ => console.log(''));