/**  This module implements the interaction of the B1 Assistant Skill with 
 * the Amazon Echo device
 */

// Module to perform Service Layer Calls
const B1SL = require("./Azure_b1ServiceLayer");

const RECURRING_ORDER = require("./RecurringOrder");
const SERVICE_LAYER_CLIENT = require("../service_layer/ServiceLayerClient");
const HELPERS = require("../helpers/Helpers");

exports.handler = function(event, context) {
    try {
        //console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        /**
         * prevent someone else from configuring a skill that sends requests to this function.
         * To be uncommented when SKill is ready
        
        if (event.session.application.applicationId !== "amzn1.echo-sdk-ams.app.c014e6d6-a7a4-44ee-8b2f-9b10c7969743") {
             context.fail("Invalid Application ID");
        }
         */

        if (event.session.new) {
            onSessionStarted({
                requestId: event.request.requestId
            }, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request, event.session, function callback(sessionAttributes, speechletResponse) {
                context.succeed(buildResponse(sessionAttributes, speechletResponse));
            });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request, event.session, function callback(sessionAttributes, speechletResponse) {
                context.succeed(buildResponse(sessionAttributes, speechletResponse));
            });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        //context.fail("Exception: " + e);
        console.log('exception: ' + e.message);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId + ", sessionId=" + session.sessionId);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId + ", sessionId=" + session.sessionId);
    // Dispatch to skill's launch.
    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {

    try {

        console.log(intentRequest);
        var intent = intentRequest.intent;
        intentName = extractValue('PreviousIntent', intent, session);

        console.log('CURRENT Intent is ' + intent.name);
        console.log('PREVIOUS intent was ' + intentName);

        if ("AMAZON.StopIntent" === intent.name ||
            "AMAZON.CancelIntent" === intent.name) {
            handleSessionEndRequest(callback);
        }

        if (intentName === null) {
            intentName = intent.name;
        }

        // Dispatch to your skill's intent handlers
        switch (intentName) {
            case "SayHello":
                sayHello(intent, session, callback);
                break;

            case "Informacion_Ventas":
                getSalesInfo(intent, session, callback);
                break;

            case "Ventas_Anuales":
                getSalesInfoYear(intent, session, callback);
                break;

            case "MakePurchase":
                postPurchase(intent, session, callback);
                break;

            case "AMAZON.HelpIntent":
                getWelcomeResponse(callback);
                break;

            case "MakeOrder":
                recurringOrderProcess(intent, session, callback);
                break;

            default:
                throw "Invalid intent";
        }
    } catch (ex) {
        console.log(ex.message);
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId + ", sessionId=" + session.sessionId);
}

// --------------- Functions that control the skill's behavior -----------------------
function getWelcomeResponse(callback) {
    var sessionAttributes = {};
    var cardTitle = "Bienvenido/a";
    var speechOutput = getWelcomeMessage();

    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = 'What is my command, master?';
    var shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function handleSessionEndRequest(callback) {
    var cardTitle = "Session Ended";
    //var speechOutput = "Thank you for using B1 Assistant. Have a nice day!";
    var speechOutput = "Okay.";

    // Setting this to true ends the session and exits the skill.
    var shouldEndSession = true;

    callback({}, buildSpeechletResponse(cardTitle, speechOutput, null, shouldEndSession));
}


/**
 * B1 Interactions
 */
function sayHello(intent, session, callback) {

    var cardTitle = intent.name;
    var repromptText = "";
    var sessionAttributes = {};
    var shouldEndSession = true;
    var speechOutput = "";

    speechOutput = "Hi there! I am the Be One Assistant. I am here to help you with the Hackathon! Let's whin this shit!"

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}


function getSalesInfo(intent, session, callback) {

    //Default
    var repromptText = null;
    var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "";

    var SalesQuarter = extractValue('SalesQuarter', intent, session)
    var SalesYear = extractValue('SalesYear', intent, session)
    console.log("intent json" + JSON.stringify(intent) + " session " + JSON.stringify(session));

    sessionAttributes = handleSessionAttributes(sessionAttributes, 'SalesQuarter', SalesQuarter);
    sessionAttributes = handleSessionAttributes(sessionAttributes, 'SalesYear', SalesYear);

    if (SalesQuarter == null) {
        speechOutput = "De que trimestre?";
        repromptText = "De que trimestre?";
    } else if (SalesYear == null) {
        speechOutput = "De que año?";
        repromptText = "De que año";
    } else {
        B1SL.GetSalesInfo(SalesYear, SalesQuarter, function(err, response) {
            if (err) {
                console.error(err)
                speechOutput = "Hubo un problema en la comunicación con Service Layer. Porfavor intentelo de nuevo" + "intent json" + JSON.stringify(intent) + " session " + JSON.stringify(session)
            } else {
                console.log("Sales Info Retrieved. Building speech Outbut")

                response = response.value

                if (response.length == 0) {
                    speechOutput = "Lo siento, pero no hay ventas para el trimestre " + SalesQuarter + " del año " + SalesYear;
                } else {
                    for (var i = 0; i < response.length; i++) {
                        console.log("ENTRO " + response[i].BusinessPartnerCurrency.toString());
                        if (response[i].BusinessPartnerCurrency.toString() === "COP") {
                            console.log("ENTRO2 " + response[i].BusinessPartnerCurrency.toString());
                            speechOutput = "Las ventas para trimestre " + stringQuarter(SalesQuarter) + " del año " +
                                SalesYear + " es de " + response[i].NetSalesAmountLC_SUM +
                                response[i].BusinessPartnerCurrency + ". ";
                        }
                    }
                }
            }

            shouldEndSession = true;

            callback(sessionAttributes,
                buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession)
            );
        });
        return;
    }

    sessionAttributes = handleSessionAttributes(sessionAttributes, 'PreviousIntent', intent.name);

    callback(sessionAttributes,
        buildSpeechletResponse(
            intent.name, speechOutput,
            repromptText, shouldEndSession
        )
    );
}


function getSalesInfoYear(intent, session, callback) {
    console.log("ENTRO A YEAR")

    var repromptText = null;
    var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "";

    var SalesYear = extractValue('SalesYear', intent, session)
    console.log("intent json" + JSON.stringify(intent) + " session " + JSON.stringify(session));

    sessionAttributes = handleSessionAttributes(sessionAttributes, 'SalesYear', SalesYear);

    if (SalesYear == null) {
        speechOutput = "De que año?";
        repromptText = "De que año?";
    } else {
        B1SL.GetSalesInfoYear(SalesYear, function(err, response) {
            if (err) {
                console.error(err)
                speechOutput = "Hubo un problema en la comunicación con Service Layer. Porfavor intentelo de nuevo" + "intent json" + JSON.stringify(intent) + " session " + JSON.stringify(session)
            } else {
                console.log("Sales Info Retrieved. Building speech Outbut")

                response = response.value

                if (response.length == 0) {
                    speechOutput = "Lo siento, pero no hay ventas para el trimestre " + SalesQuarter + " del año " + SalesYear;
                } else {
                    for (var i = 0; i < response.length; i++) {
                        console.log("ENTRO " + response[i].BusinessPartnerCurrency.toString());
                        if (response[i].BusinessPartnerCurrency.toString() === "COP") {
                            console.log("ENTRO2 " + response[i].BusinessPartnerCurrency.toString());
                            speechOutput = "Las ventas para el año " + SalesYear + " es de " + response[i].NetSalesAmountLC_SUM +
                                response[i].BusinessPartnerCurrency + ". ";
                        }
                    }
                }
            }

            shouldEndSession = true;

            // callback with result
            callback(sessionAttributes,
                buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession)
            );
        });
        return;
    }

    sessionAttributes = handleSessionAttributes(sessionAttributes, 'PreviousIntent', intent.name);

    callback(sessionAttributes,
        buildSpeechletResponse(
            intent.name, speechOutput,
            repromptText, shouldEndSession
        )
    );
}


function postPurchase(intent, session, callback) {

    var repromptText = null;
    var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "";

    console.log("INTENT RECEIVED");
    console.log(JSON.stringify(intent));
    console.log("SESSION RECEIVED")
    console.log(JSON.stringify(session));


    var ItemName = extractValue('ItemName', intent, session)
    var Quantity = extractValue('Quantity', intent, session)
    var ItemRecom = extractValue('ItemRecom', intent, session)

    var ItemRecomName = null;
    var params = null;


    console.log("ItemName Extraido " + ItemName);
    console.log("Quantity Extraido " + Quantity);


    sessionAttributes = handleSessionAttributes(sessionAttributes, 'ItemName', ItemName);
    sessionAttributes = handleSessionAttributes(sessionAttributes, 'Quantity', Quantity);



    // Answer to: Do you need anything else?
    if (intent.name == "AMAZON.YesIntent") {
        ItemRecom = extractValue('ItemRecom', intent, session)
    } else if (intent.name == "AMAZON.NoIntent") {
        ItemRecom = null;
    } else {
        sessionAttributes = handleSessionAttributes(sessionAttributes, 'PreviousIntent', intent.name);
    }


    if (ItemName == null) {
        speechOutput = "Should I get you printer ink, paper or maybe an USB drive.";
        repromptText = "You can say. I need printer ink. Or Buy me an USB drive";
    } else if (Quantity == null) {
        speechOutput = "Ok, how many packs do you need?";
        repromptText = "Tell me the quantity you need.";
    } else if (ItemRecom == null && intent.name != "AMAZON.NoIntent") {
        speechOutput = "Do you need anything else?";
        repromptText = "Can I get you need anything else?";

    } else {

        B1SL.PostSalesOrder(extractItem(ItemName), Quantity, extractItem(ItemRecom), function(err, response) {
            if (err) {
                console.error(err)
                speechOutput = "There was a problem calling Service Layer. "
                speechOutput += err + ". Check the logs for more details."
            } else {
                speechOutput = "Your order number " + response.DocNum + " was placed successfully! " +
                    "The total amount of your purchase is " + response.DocTotal +
                    " " + response.DocCurrency;
            };
            shouldEndSession = true;

            // call back with result
            callback(sessionAttributes,
                buildSpeechletResponse(
                    intent.name, speechOutput,
                    repromptText, shouldEndSession
                )
            );
        })
        return;
    }

    console.log("Vao ser exportados " + JSON.stringify(sessionAttributes));

    callback(sessionAttributes,
        buildSpeechletResponse(
            intent.name, speechOutput,
            repromptText, shouldEndSession
        )
    );
}


// --------------- Handle of Session Attributes -----------------------
function extractValue(attr, intent, session) {

    console.log("Extracting " + attr);

    if (session.attributes) {
        if (attr in session.attributes) {
            console.log("Session attribute " + attr + " is " + session.attributes[attr]);
            return session.attributes[attr];
        }
    }

    console.log("No session attribute for " + attr);

    if (intent.slots) {
        if (attr in intent.slots && 'value' in intent.slots[attr]) {
            var slot = intent.slots[attr]
            try {
                //Try to returns slot ID otherwise returns slot value
                return slot.resolutions.resolutionsPerAuthority[0].values[0].value.id
            } catch (e) {
                return intent.slots[attr].value;
            }
        }
    };
    return null;
}


function handleSessionAttributes(sessionAttributes, attr, value) {

    //if Value exists as attribute than returns it
    console.log("Previous " + attr + "is: " + value)
    if (value) {
        sessionAttributes[attr] = value;
    }
    return sessionAttributes;
}

// --------------- Auxiliar Functions Formatting -----------------------

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function stringQuarter(input) {

    if (input == '01' || input == 'Q1') {
        return 'primero';
    }

    if (input == '02' || input == 'Q2') {
        return 'segundo';
    }

    if (input == '03' || input == 'Q3') {
        return 'tercero';
    }

    if (input == '04' || input == 'Q4') {
        return 'cuarto';
    }

}

function extractItem(item) {
    if (item === null) {
        return null;
    }

    var auxitem = item.toLowerCase();

    if (auxitem.indexOf('ink') >= 0) {
        return 'I00008';
    }

    if (auxitem.indexOf('paper') >= 0) {
        return 'R00001';
    }

    if (auxitem.indexOf('drive') >= 0) {
        return 'I00004';
    }
    return item;
}

// -------------------- Speech Functions Formatting -----------------------
function getWelcomeMessage() {
    var message = [];

    message[0] = "Soy el asistente virtual del Consensus Day. ¿Cómo puedo ayudarte?"
    return message[getRandomInt(0, message.length - 1)];
}

// --------------- Helpers that build all of the responses -----------------------
function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    console.log("ALEXA: " + output);
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Standard",
            title: title,
            text: output,
            image: {
                smallImageUrl: "https://consensussa.net/images/logo-css-sap-pq-white.png"
            }
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}

function recurringOrderProcess(intent, session, callback) {

    try {
        let repromptText = null,
            sessionAttributes = {},
            shouldEndSession = false,
            speechOutput = "",
            orderData = false;

        let recurringOrder = extractValue('Order', intent, session);
        // let orderConfirmation = extractValue('Process', intent, session);

        sessionAttributes = handleSessionAttributes(sessionAttributes, 'Order', recurringOrder);
        //sessionAttributes = handleSessionAttributes(sessionAttributes, 'Process', orderConfirmation);
        console.log("order: " + recurringOrder);
        if (recurringOrder === null) {
            speechOutput = "¿Cuál es el pedido recurrente que deseas realizar?";
            repromptText = "¿Cuál es el pedido recurrente que deseas realizar?";
        }
        /*else if (orderConfirmation === null) {
                   speechOutput = "¿Deseas confirmar el pedido recurrente: " + recurringOrder + "?";
                   repromptText = "¿Deseas confirmar el pedido recurrente: " + recurringOrder + "?";
                   console.log("in1")
               } */
        else {

            let prefix = 'Orders?$filter=CardCode eq \'30230986\' and U_PedidoRecurrente eq \'Y\'' +
                '&$select=CardCode, U_DescPedido, DocumentLines';

            let response = SERVICE_LAYER_CLIENT.serviceLayerGet(prefix);
            SERVICE_LAYER_CLIENT.serviceLayerGet(prefix).then(data => {
                let body = JSON.parse(data.data);
                console.log("in67: " + body);
            });
            console.log("inprocess" + response);
            console.log("in");
            if (response.status !== 200) {
                speechOutput = "Hubo un problema en la comunicación con Service Layer. Porfavor intentelo de nuevo:";
            } else {
                console.log("length : " + response.data.length)
                if (response.data.length === 0) {
                    speechOutput = "Lo siento, pero se presento un error o no existen pedidos recurrentes";
                } else {
                    console.log("response: " + response);
                    while (!orderData && index < response.data.length) {
                        if (recurringOrder.replace(/ /g, "").toUpperCase() === reponse.data[index].U_DescPedido.replace(/ /g, "").toUpperCase()) {
                            orderData = reponse.data[index];
                        }
                    }
                    if (!orderData) {
                        speechOutput = "El pedido recurrente: " + recurringOrder + " no existe en SAP Business One";
                    } else {
                        let postBody = bodyBuildPost(orderData);
                        let postRecurringOrder = RECURRING_ORDER.postRecurringOrder(postBody);

                        if (postRecurringOrder.status === 201) {
                            speechOutput = "Pedido recurrente creado correctamente, su pedido es: " +
                                postRecurringOrder.data.U_DescPedido + "número de documento " +
                                postRecurringOrder.data.DocNum + "\n";

                            for (let i = 0; i < postRecurringOrder.data.DocumentLines; i++) {
                                speechOutput += postRecurringOrder.data.DocumentLines[i].ItemName + " Cantida" +
                                    postRecurringOrder.data.DocumentLines[i].Quantity + "\n";
                            }

                        } else {
                            speechOutput = "Se presento un error creando su pedido recurrente";
                        }
                    }
                }
            }


            shouldEndSession = true;

            callback(sessionAttributes,
                buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession)
            );

            return;
        }
        sessionAttributes = handleSessionAttributes(sessionAttributes, 'PreviousIntent', intent.name);

        callback(sessionAttributes,
            buildSpeechletResponse(
                intent.name, speechOutput,
                repromptText, shouldEndSession
            )
        );
    } catch (ex) {
        console.log(ex.message);
    }
}

function bodyBuildPost(order) {

    let lines = [];

    for (let i = 0; i < order.DocumentLines; i++) {
        lines.push({
            ItemCode: order.DocumentLines[i].ItemCode,
            ItemName: order.DocumentLines[i].ItemName,
            Quantity: order.DocumentLines[i].Quantity
        });
    }

    let body = {
        CardCode: order.CardCode,
        BPL_IDAssignedToInvoice: 1,
        DocDate: HELPERS.getServiceLayerDate(),
        DocumentLines: lines
    };

    return body;
}