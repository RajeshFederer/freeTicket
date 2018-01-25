'use strict';

const builder = require('botbuilder');
const recognizer = require('../service/botConnector').recognizer;

let persistIntents = () => {
    let intents = new builder.IntentDialog({ recognizers: [recognizer] })
    .matches('Greeting', (session) => {
        session.send("Hey! I'm the Book Flight Ticket Bot. I can book / cancel you flight tickets");
        let msg = new builder.Message(session);
        msg.attachmentLayout(builder.AttachmentLayout.carousel)
        msg.attachments([
            new builder.HeroCard(session)
                .title("What would you like to do?")
                .buttons([
                    builder.CardAction.imBack(session, "Book Ticket", "Book"),
                    builder.CardAction.imBack(session, "Cancel Ticket", "Cancel")
                ])
        ]);
        session.send(msg).endDialog();
    })
    
    .matches('bookTicket', [(session, args,callback) =>{
        let intent = args.intent;
        let dateOfTravel = builder.EntityRecognizer.findEntity(intent.entities, 'dateTimeV2');
        let noOfTickets = builder.EntityRecognizer.findEntity(intent.entities, 'number');
        let toLocation = builder.EntityRecognizer.findEntity(intent.entities, 'Weather.Location');
        let travelClass = builder.EntityRecognizer.findEntity(intent.entities, 'travelClass');
        if (noOfTickets) {
            session.dialogData.noOfTickets = noOfTickets;
        }
        if (toLocation){
            session.dialogData.toLocation = toLocation;
        }
        if (travelClass){
            session.dialogData.travelClass = travelClass;
        }
        if (dateOfTravel){
            session.dialogData.dateOfTravel = dateOfTravel;
            return callback();
        } else {
            builder.Prompts.text(session, 'Please tell me your date of travel?');
        }
    }, (session, results, callback) => {
        if (results.response) {
            session.dialogData.dateOfTravel = results.response;
        }
        builder.Prompts.text(session, 'Please tell me your origin city?');
    }, (session, results, callback) => {
        if (results.response) {
            session.dialogData.fromLocation = results.response;
        }
        if (session.dialogData.toLocation){
            return callback();
        } else {
            builder.Prompts.text(session, 'Please tell me your destination city?');
        }
    }, (session, results, callback) => {
        if (results.response) {
            session.dialogData.toLocation = results.response;
        }
        if (session.dialogData.noOfTickets){
            return callback();
        } else {
            builder.Prompts.text(session, 'How many tickets you want me to book?');
        }
    }, (session, results, callback) => {
        if (results.response) {
            session.dialogData.noOfTickets = results.response;
        }
        if (session.dialogData.travelClass){
            return callback();
        } else {
            let msg = new builder.Message(session);
            msg.attachmentLayout(builder.AttachmentLayout.carousel)
            msg.attachments([
                new builder.HeroCard(session)
                    .title("Please select your mode of travel?")
                    .buttons([
                        builder.CardAction.imBack(session, "Economy", "Economy"),
                        builder.CardAction.imBack(session, "Business", "Business"),
                        builder.CardAction.imBack(session, "Premium Economy", "Premium Economy"),
                        builder.CardAction.imBack(session, "First Class", "First Class")
                    ])
            ]);
            session.send(msg);
        }
    },  (session, results, callback) => {
        if (results.response) {
            session.dialogData.travelClass = results.response;
        }
        session.send(session.dialogData.travelClass).endDialog();
    }])
    .matches('cancelTicket',(session) => {
        session.send('You have Entered Cancel ticket').endDialog();
    })
    .onDefault((session) => {
        session.send('Sorry, I did not understand \'%s\'.', session.message.text);
    });
    return intents;
};

module.exports = persistIntents;