const TELEGRAM_CONFIG = require("../connection/TelegramConfig.json");

const REQUEST_PROMISE = require('request-promise')


async function getRecurringOrders(identification, callback) {

    try {
        console.log(TELEGRAM_CONFIG.URL);
        let orders = {
            method: 'GET',
            url: TELEGRAM_CONFIG.URL + 'orders',
            body: identification,
            json: true
        };

        let orderResponse = await REQUEST_PROMISE(orders);
        //console.log("length" + orderResponse.data.length);
        //let body = JSON.parse(orderResponse);
        //console.log("Telegram: " + body.data.length);
        callback(null, orderResponse);

        //return { status: 200, estado: true, mensaje: 'Exitoso', datos: orderResponse };

    } catch (error) {
        console.log(error.message)
        callback(error);
        //return { status: 500, estado: false, mensaje: error.message, datos: null }

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
    /*GetRecurringOrders: function(identification, callback) {
        return (getRecurringOrders(identification, callback))
    }*/
    getRecurringOrders
}