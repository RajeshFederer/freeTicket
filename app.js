'use strict';

const restify = require('restify');

const connector = require('./lib/service/botConnector').connector;
const bot = require('./lib/service/botConnector').bot;

// Setup Restify Server
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 4500, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

let intents = require('./lib/model/bot')();
bot.dialog('/', intents);