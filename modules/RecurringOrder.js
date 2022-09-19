const SERVICE_LAYER_CLIENT = require('../service_layer/ServiceLayerClient');

async function getAllRecurringOrders() {

    try {

        let prefix = 'Orders?$filter=CardCode eq \'30230986\' and U_PedidoRecurrente eq \'Y\'' +
            '&$select=CardCode, U_DescPedido, DocumentLines';

        let orders = SERVICE_LAYER_CLIENT.serviceLayerGet(prefix);

        callback(null, orders);

    } catch (ex) {
        console.log(ex.message);
        callback(error);
    }
}

async function postRecurringOrder(postBody) {

    let response = "";

    let prefix = 'Orders';

    let order = SERVICE_LAYER_CLIENT.serviceLayerPost(prefix, postBody);

    response = order;

    return response;
}

module.exports = {
    GetAllRecurringOrders: function(callback) {
        return (getAllRecurringOrders(callback))
    },
    postRecurringOrder
}