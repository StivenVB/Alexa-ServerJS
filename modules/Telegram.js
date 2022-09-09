const TELEGRAM_CONFIG = require("../connection/TelegramConfig.json");

const REQUEST_PROMISE = require('request-promise')


async function getRecurringOrders(identification, callback) {

    try {

        let orders = {
            method: 'GET',
            url: TELEGRAM_CONFIG.URL + 'recurringOrders/' + identification
        };

        let orderResponse = await REQUEST_PROMISE(orders);
        let body = JSON.parse(orderResponse);

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
    GetRecurringOrders: function(year, quarter, callback) {
        return (getRecurringOrders(year, quarter, callback))
    }
}