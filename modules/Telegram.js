const TELEGRAM_CONFIG = require("../connection/TelegramConfig.json");

const REQUEST_PROMISE = require('request-promise')


async function getRecurringOrders(identification, callback) {

    try {

        let orders = {
            method: 'GET',
            url: TELEGRAM_CONFIG.URL + 'orders',
            body: identification,
            json: true
        };

        let orderResponse = await REQUEST_PROMISE(orders);

        callback(null, orderResponse);

    } catch (error) {
        console.log(error.message)
        callback(error);
    }
};

async function postRecurringOrders(sendOrder, callback) {

    try {

        let order = {
            method: 'POST',
            url: TELEGRAM_CONFIG.URL + 'sendNotification',
            body: sendOrder,
            json: true
        };

        let orderResponse = await REQUEST_PROMISE(order);

        callback(null, orderResponse);

    } catch (error) {
        console.log(error.message)
        callback(error);
    }
};

module.exports = {
    GetRecurringOrders: function(identification, callback) {
            return (getRecurringOrders(identification, callback))
        }
        /*PostRecurringOrders: function(sendOrder, callback) {
            return (postRecurringOrders(sendOrder, callback))
        }*/
}