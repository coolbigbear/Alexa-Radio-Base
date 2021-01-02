/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const audio = require('AudioController.js');
const fetch = require('node-fetch');
const Alexa = require('ask-sdk-core');
var xmlToJson = require('xml-js');

const STATION_URL = "https://n-12-2.dcs.redcdn.pl/sc/o2/Eurozet/live/audio.livx"
const STATION_NAME = "Radio Zet"
const STATION_CHANNEL = "Poland"
const HERE_IS = "Here is"


let station = {
    name: STATION_NAME,
    channel: STATION_CHANNEL,
    url: "",
    progress: 0,
    token: `${STATION_NAME}:${STATION_CHANNEL}`
}

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    async handle(handlerInput) {

        await getLatestRadioLink();
        console.log(`Launch intent handler triggered: ${JSON.stringify(handlerInput)}`)

        let response = audio
            .speak(`${HERE_IS} - ${station.name}, from ${station.channel}.`)
            .play(station)

        return response;
    }
};

async function getLatestRadioLink() {
    station.url = STATION_URL
}

function stopMusic() {
    const speakOutput = 'Stopping!';

    let response = audio
        .speak(speakOutput)
        .stop()

    return response;
}

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'To listen to radio zet simply say, open radio zet';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const ResumeIntentHandler = {

    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.ResumeIntent');
    },
    async handle(handlerInput) {
        const speakOutput = `Resuming ${STATION_NAME}`;
        console.log(`Resuming intent handler triggered: ${JSON.stringify(handlerInput)}`)

        await getLatestRadioLink()

        let response = audio
            .speak(speakOutput)
            .play(station)

        return response;
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        console.log(`Cancel stop intent handler triggered: ${JSON.stringify(handlerInput)}`)
        return stopMusic();
    }
};


const PauseIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.PauseIntent');
    },
    handle(handlerInput) {
        console.log(`Pause intent handler triggered: ${JSON.stringify(handlerInput)}`)
        return stopMusic()
    }
};

const UnsupportedIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.LoopOffIntent' ||
                Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.LoopOnIntent' ||
                Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.PreviousIntent' ||
                Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.NextIntent' ||
                Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.RepeatIntent' ||
                Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.ShuffleOffIntent' ||
                Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.ShuffleOnIntent' ||
                Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StartOverIntent'
            );
    },
    handle(handlerInput) {

        const speakOutput = "Sorry, this is not supported for radio playback"
        console.log(`Unsupported intent rejected: ${JSON.stringify(handlerInput)}`);
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const AudioPlayerIntent = {
    canHandle(handlerInput) {
        return (handlerInput.requestEnvelope.request.type === 'AudioPlayer.PlaybackStarted' ||
            handlerInput.requestEnvelope.request.type === 'AudioPlayer.PlaybackFinished' ||
            handlerInput.requestEnvelope.request.type === 'AudioPlayer.PlaybackStopped' ||
            handlerInput.requestEnvelope.request.type === 'AudioPlayer.PlaybackNearlyFinished' ||
            handlerInput.requestEnvelope.request.type === 'AudioPlayer.PlaybackFailed'
        );
    },
    handle(handlerInput) {

        console.log(`AudioPlayerIntent called: ${JSON.stringify(handlerInput)}`);
        console.log(`AudioPlayerIntent was: ${JSON.stringify(handlerInput.requestEnvelope.request.type)}`);
        return handlerInput.responseBuilder.getResponse();
    }
};

const AudioPlayerPlaybackFailedPlaybackNearlyFinishedIntent = {
    canHandle(handlerInput) {
        return (
            handlerInput.requestEnvelope.request.type === 'AudioPlayer.PlaybackFailed' ||
            handlerInput.requestEnvelope.request.type === 'AudioPlayer.PlaybackNearlyFinished'
        );
    },
    async handle(handlerInput) {

        console.log(`AudioPlayerPlaybackOrNearlyFinished called: ${JSON.stringify(handlerInput)}`);
        console.log(`Playback failed or nearly finished was: ${JSON.stringify(handlerInput.requestEnvelope.request.type)}`)

        await getLatestRadioLink()

        let response = audio
            .play(station)
        
        return response
    }
};

/* *
* FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
* It must also be defined in the language model (if the locale supports it)
* This handler can be safely added but will be ingnored in locales that do not support it yet 
* */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Sorry, I don\'t know about that. Please try again.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};

/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
// const IntentReflectorHandler = {
//     canHandle(handlerInput) {
//         return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
//     },
//     handle(handlerInput) {
//         const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
//         const speakOutput = `You just triggered ${intentName}`;

//         return handlerInput.responseBuilder
//             .speak(speakOutput)
//             .withShouldEndSession(true)
//             //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
//             .getResponse();
//     }
// };

/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';
        console.log(`~~~~ Error handled: ${error}`);
        console.log(`~~~~ Error handled JSON: ${JSON.stringify(error)}`);
        console.log(`~~~~ Handler Input: ${JSON.stringify(handlerInput)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .withShouldEndSession(true)
            .getResponse();
    }
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        AudioPlayerPlaybackFailedPlaybackNearlyFinishedIntent,
        AudioPlayerIntent,
        HelpIntentHandler,
        ResumeIntentHandler,
        PauseIntentHandler,
        CancelAndStopIntentHandler,
        UnsupportedIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler)
    .addErrorHandlers(
        ErrorHandler)
    .lambda();