const SERVICE_LAYER_CLIENT = require('../service_layer/ServiceLayerClient');

async function getAllRecurringOrders(callback) {

    try {

        let prefix = 'Orders?$filter=CardCode eq \'30230986\' and U_PedidoRecurrente eq \'Y\'' +
            '&$select=CardCode, U_DescPedido, DocumentLines';

        let orders = SERVICE_LAYER_CLIENT.serviceLayerGet(prefix);
        console.log("data: " + orders);
        callback(null, orders);

    } catch (ex) {
        console.log(ex.message);
        callback(ex.message);
    }
}

async function postRecurringOrder(postBody) {
    console.log("in");
    try {

        let response = "";

        let prefix = 'Orders';

        let order = SERVICE_LAYER_CLIENT.serviceLayerPost(prefix, postBody);
        console.log("3 " + order);
        response = order;

    } catch (ex) {
        console.log(ex.message);
    }

    return response;
}

module.exports = {
    GetAllRecurringOrders: function(callback) {
        return (getAllRecurringOrders(callback))
    },
    postRecurringOrder
}