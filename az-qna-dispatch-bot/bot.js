// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler, MessageFactory } = require('botbuilder');
const { QnAMaker } = require('botbuilder-ai');

class EchoBot extends ActivityHandler {
    constructor() {
        super();

        const qnaMaker = new QnAMaker({
            knowledgeBaseId: process.env.QnAKnowledgebaseId,
            endpointKey: process.env.QnAEndpointKey,
            host: process.env.QnAEndpointHostName
        });

        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {

            const response = await qnaMaker.getAnswers(context)
            const replyText = `QnA Answer ${ response[0].score }: ${ response[0].answer }`;
            await context.sendActivity(MessageFactory.text(replyText, replyText));

            // const replyText = `QnA Answer ${ response[0].score }: ${ response[0].answer }`;
            // await context.sendActivity(MessageFactory.text(replyText, replyText));
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            const welcomeText = 'Hello and welcome!';
            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await context.sendActivity(MessageFactory.text(welcomeText, welcomeText));
                }
            }
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }
}

module.exports.EchoBot = EchoBot;
