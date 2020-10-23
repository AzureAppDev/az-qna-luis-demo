// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// Development Tasks (Since this is a demo all functionality can be here)

// Step 1: Add QnA maker support to answer the following Question:
//              "What is the link for the HR Portal?"

// Step 2: Add Luis support to intent and entity extraction:
//              "Who is the representative for Microsoft?" entities: "representative", "Microsoft"

// Step 3: Pull the Representative from Microsoft from Table Storage and send activity back

const { ActivityHandler, MessageFactory } = require('botbuilder');
const { LuisRecognizer, QnAMaker } = require('botbuilder-ai');

class EchoBot extends ActivityHandler {
    constructor() {
        super();

        this.onMessage(async (context, next) => {

            await context.sendActivity(`ECHO: ${context.activity.text}`);
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

    async dispatchToTopIntentAsync(context, intent, recognizerResult) {
        switch (intent) {
        case 'none':
            await this.processHomeAutomation(context, recognizerResult.luisResult);
            break;
        default:
            console.log(`Dispatch unrecognized intent: ${ intent }.`);
            await context.sendActivity(`Dispatch unrecognized intent: ${ intent }.`);
            break;
        }
    }
}

module.exports.EchoBot = EchoBot;
