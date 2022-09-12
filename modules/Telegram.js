const TELEGRAM_CONFIG = require("../connection/TelegramConfig.json");

const REQUEST_PROMISE = require('request-promise')


async function getRecurringOrders(identification, callback) {

    try {

        let orders = {
            method: 'GET',
            url: TELEGRAM_CONFIG.URL + 'recurringOrders/' + identification
        };
        console.log("ENTRO TELEGRAM " + orders);
        let orderResponse = await REQUEST_PROMISE(orders);
        console.log("ENTRO EJECUCION " + orderResponse);
        let body = JSON.parse(orderResponse);
        console.log("ENTRO BODY " + body.length);

        callback(null, body);
        //return { status: 200, estado: true, mensaje: 'Exitoso', datos: body };

    } catch (error) {
        console.log(error.message)
        callback(error);
        // return { status: 500, estado: false, mensaje: error.message, datos: null }

    }
};

async function postRecurringOrders() {

    try {

        let order = {
            method: 'POST',
            url: TELEGRAM_CONFIG.URL + 'order'
        };

        let orderResponse = await REQUEST_PROMISE(order);
        //let body = JSON.parse(orderResponse);

        return { status: 200, estado: true, mensaje: 'Exitoso', datos: orderResponse };

    } catch (error) {
        console.log(error.message)
            //callback(error);
            // return { status: 500, estado: false, mensaje: error.message, datos: null }

    }
};

module.exports = {
    GetRecurringOrders: function(identification, callback) {
        return (getRecurringOrders(identification, callback))
    }
}