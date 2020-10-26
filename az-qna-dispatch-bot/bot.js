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
const { CosmosRepository, CosmosRepositoryInitializer  } = require("./cosmosdb");

class EchoBot extends ActivityHandler {

    cosmosRepo = null
    storageClient = null;

    constructor() {
        super();

        this.cosmosRepo = CosmosRepositoryInitializer();

        const dispatchRecognizer = new LuisRecognizer({
            applicationId: process.env.LUIS_APP_ID,
            endpointKey: process.env.LUIS_API_KEY,
            endpoint: `https://luis-01-demo.cognitiveservices.azure.com/`
        }, {
            includeAllIntents: true,
            includeInstanceData: true
        }, true);

        const qnaMaker = new QnAMaker({
            knowledgeBaseId: process.env.QNA_ID,
            endpointKey: process.env.QNA_KEY,
            host: process.env.QNA_HOST
        });

        this.dispatchRecognizer = dispatchRecognizer;
        this.qnaMaker = qnaMaker;

        this.onMessage(async (context, next) => {

            const response = await qnaMaker.getAnswers(context)
            if (response.length > 0 && response[0].score > .70) {
                const replyText = `QnA Answer ${ response[0].score }: ${ response[0].answer }`;
                await context.sendActivity(MessageFactory.text(replyText, replyText));
            } else {
                const recognizerResult = await dispatchRecognizer.recognize(context);
                const intent = LuisRecognizer.topIntent(recognizerResult);
                await this.dispatchToTopIntentAsync(context, intent, recognizerResult);
            }

            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            const welcomeText = 'Welcome to the Demo Bot!';
            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await context.sendActivity(MessageFactory.text(welcomeText, welcomeText));
                }
            }
            await next();
        });
    }

    async dispatchToTopIntentAsync(context, intent, recognizerResult) {
        switch (intent) {
        case 'RetrieveDocument':
            await context.sendActivity(`Retrieving document ${recognizerResult.entities.id[0]}`)
            await this.cosmosRepo.ConnectToCollection();
            const result = await this.cosmosRepo.GetItem(recognizerResult.entities.id[0]);
            await context.sendActivity(JSON.stringify(result.resources[0]))
            break;
        default:
            console.log(`Dispatch unrecognized intent: ${ intent }.`);
            await context.sendActivity(`Dispatch unrecognized intent: ${ intent }.`);
            break;
        }
    }
}

module.exports.EchoBot = EchoBot;
