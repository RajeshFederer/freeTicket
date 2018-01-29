'use strict';

const builder = require('botbuilder');
const moment = require('moment');
const recognizer = require('../service/botConnector').recognizer;

let persistIntents = () => {
    let intents = new builder.IntentDialog({ recognizers: [recognizer] })
    .matches('Greeting', (session) => {
        session.send("Hey! I'm the Book Flight Ticket Bot. I can book / cancel you flight tickets");
        session.userData = session.userData || {};
        session.userData.oldUser = true;
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
        console.log('TESTER ',args, session);
        let intent = args.intent;
        let dateOfTravel = builder.EntityRecognizer.findEntity(args.entities, 'dateTimeV2');
        let noOfTickets = builder.EntityRecognizer.findEntity(args.entities, 'builtin.number');
        let destinationLocation = builder.EntityRecognizer.findEntity(args.entities, 'location::destinationLocation');
        let originLocation = builder.EntityRecognizer.findEntity(args.entities, 'location::originLocation');
        let travelClass = builder.EntityRecognizer.findEntity(args.entities, 'travelClass');
        console.log(args.entities+'DATE '+ dateOfTravel + ' noOfTickets :'+ noOfTickets + 'DESTINATION '+destinationLocation + 'ORIGIN '+ originLocation + 'TRAVEL CLASS '+ travelClass);
        console.log('DLOC '+ builder.EntityRecognizer.findEntity(args.entities, 'location.destinationLocation'));
        console.log('DLOC 2 '+builder.EntityRecognizer.findEntity(args.entities, 'destinationLocation'));
        console.log('DLOC 3 '+builder.EntityRecognizer.findEntity(args.entities, 'location'));
        session.userData = {};
        if (noOfTickets) {
            session.userData.noOfTickets = noOfTickets;
        }
        if (destinationLocation){
            session.userData.destinationLocation = destinationLocation;
        }
        if (originLocation){
            session.userData.originLocation = originLocation;
        }
        if (travelClass){
            session.userData.travelClass = travelClass;
        }
        if (dateOfTravel){
            session.userData.dateOfTravel = dateOfTravel;
            return callback();
        } else {
            builder.Prompts.time(session, 'Please tell me your date of travel?');
        }
    }, (session, results, callback) => {
        if (results.response) {
            session.userData.dateOfTravel = results.response;
        }
        if(session.userData.originLocation){
            return callback();
        }else{
            builder.Prompts.text(session, 'Please tell me your origin city?');
        }
    }, 
    
    (session, results, callback) => {
        if (results.response) {
            session.userData.originLocation = results.response;
        }
        if (session.userData.destinationLocation){
            return callback();
        } else {
            builder.Prompts.text(session, 'Please tell me your destination city?');
        }
    }, (session, results, callback) => {
        if (results.response) {
            session.userData.destinationLocation = results.response;
        }
        if (session.userData.noOfTickets){
            return callback();
        } else {
            builder.Prompts.number(session, 'How many tickets you want me to book?');
        }
    }, (session, results, callback) => {
        console.log(session.userData);
        if (results.response) {
            session.userData.noOfTickets = results.response;
        }
       /* if (session.userData.travelClass){
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
            console.log("TEST", msg);
            session.send(msg);
        }*/
        return callback();
    },  (session, results, callback) => {
       /* if (results.response) {
            session.userData.travelClass = results.response;
        }*/
        let flightList = [{
            flightName: "Air Asia", 
            logo : "https://akm-img-a-in.tosshub.com/indiatoday/images/story/201606/story_wikimedia,-mehdi-nazarinia_647_061316045520.jpg",
            price : 4000,
            departure : "10:30",
            arraival : "13:30"
        }, {
            flightName: "Indigo", 
            logo : "http://ste.india.com/sites/default/files/2016/05/24/491792-indigo.jpg",
            price : 4000,
            departure : "10:30",
            arraival : "13:00"
        }, {
            flightName: "Jet Airways", 
            logo : "http://ste.india.com/sites/default/files/2016/05/24/491792-indigo.jpg",
            price : 4000,
            departure : "10:00",
            arraival : "13:30"
        }];
        let attachments = [];

        for (var flight in flightList){
            attachments.push (new builder.HeroCard(session)
                .title(flightList[flight].flightName)
                .subtitle("Rs."+ flightList[flight].price)
                .text("Departure : " + flightList[flight].departure + "  Arraival : " +  flightList[flight].arraival)
                .images([builder.CardImage.create(session, flightList[flight.logo])])
                .buttons([
                    builder.CardAction.imBack(session, flightList[flight].flightName, "Select")
                ]));
        }

        var msg = new builder.Message(session);
        msg.attachmentLayout(builder.AttachmentLayout.carousel)
        msg.attachments(attachments);
        session.send(msg);
    }])

    .matches('flights',[(session, args,callback) =>{
        session.userData.flightName = session.message.text;
        builder.Prompts.text(session, 'Noted. Please tell your Email Id to receive ticket');
    }, (session, results, callback) => {
        session.userData.contactEmailId = results.response;
        builder.Prompts.confirm(session, 'Your Payable Amount is Rs.4000. Please Confirm for payment');
    },  (session, results, callback) => {
        if(results.response){
            session.send('Flight Ticket booking Successful. <br>'+ 
            session.userData.originLocation + " to " + session.userData.destinationLocation +  '<br> ' +
            session.userData.flightName + ' <br> ' +
            ' Boarding Time: ' + moment(session.userData.dateOfTravel.resolution.start).format('DD-MM-YYYY') + ' 10:30' + '<br>' +
            ' Ticket is emailed to '+ session.userData.contactEmailId ).endDialog();
        } else {
            session.send('Thank you. Have a nice day!').endDialog();
        }
    }])

    .matches('cancelTicket',[(session,results, callback) => {
        builder.Prompts.time(session, 'Please tell me your date of travel?');
        session.userData = session.userData || {};
        session.userData.oldUser = true;
    }, (session, results, callback) =>{
        session.userData.cancelDate = results.response;
        builder.Prompts.confirm(session, 'Can I cancel your ticket? Please Confirm ');
    }, (session, results, callback) => {
        if (results.response){
            session.send('I have cancelled your Ticket on ' + moment(session.userData.cancelDate.resolution.start).format('DD-MM-YYYY')).endDialog();
        } else {
            session.send('Okay ! Have a nice day !').endDialog();
        }
    }])

    .onDefault((session) => {
        session.send('Please Enter a valid Response .');
    });
    return intents;
};

module.exports = persistIntents;