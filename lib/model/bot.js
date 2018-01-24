'use strict';

const builder = require('botbuilder');
const recognizer = require('../service/botConnector').recognizer;

let persistIntents = function(){
    let intents = new builder.IntentDialog({ recognizers: [recognizer] })
    .matches('Greeting', (session) => {
        session.send("Hey! I'm the Book Flight Ticket Bot. I can book / cancel you flight tickets");
        session.send("What would you like to do?" +"\n" +"1. Book Tickets" + "\n" +"2. Cancel Tickets");
    })
    
    /*
    .matches('<yourIntent>')... See details at http://docs.botframework.com/builder/node/guides/understanding-natural-language/
    */
    .onDefault((session) => {
        session.send('Sorry, I did not understand \'%s\'.', session.message.text);
    });
    return intents;
};

module.exports = persistIntents;