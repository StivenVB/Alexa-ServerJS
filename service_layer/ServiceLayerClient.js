const SERVICE_LAYER_CONFIG = require("../connection/ServiceLayerConfig.json");

const REQUEST_PROMISE = require('request-promise')

function serviceLayerLogin() {

    let login = {
        method: 'POST',
        url: SERVICE_LAYER_CONFIG.URL + 'Login',
        body: SERVICE_LAYER_CONFIG.Credentials,
        json: true,
        rejectUnauthorized: false,
        requestCert: false,
        agent: false,
        strictSSL: false,
        resolveWithFullResponse: true
    };

    return login;
}

async function serviceLayerGet(prefix) {

    try {
        let responseLogin = await REQUEST_PROMISE(serviceLayerLogin());

        if (responseLogin.statusCode !== 200) {
            return { status: 401, estado: false, mensaje: responseLogin.body.error.message.value, datos: null }
        }

        let request = {
            method: 'GET',
            url: SERVICE_LAYER_CONFIG.URL + prefix,
            headers: {
                'Cookie': responseLogin.headers['set-cookie']
            },
            rejectUnauthorized: false,
            requestCert: false,
            agent: false,
            strictSSL: false,
            resolveWithFullResponse: true
        };

        let requestResponse = await REQUEST_PROMISE(request);
        let body = JSON.parse(requestResponse.body);

        if (requestResponse.statusCode === 200) {
            return { status: 200, estado: true, mensaje: 'Exitoso', data: body.value };
        } else {
            return { status: 400, estado: false, mensaje: 'Petición fallida' };
        }

    } catch (ex) {
        return { status: 500, estado: false, mensaje: ex.message };
    }
}

async function serviceLayerPost(prefix, body) {

    try {
        let responseLogin = await REQUEST_PROMISE(serviceLayerLogin());

        if (responseLogin.statusCode !== 200) {
            return { status: 401, estado: false, mensaje: responseLogin.body.error.message.value, datos: null }
        }

        let request = {
            method: 'POST',
            url: SERVICE_LAYER_CONFIG.URL + prefix,
            headers: {
                'Cookie': responseLogin.headers['set-cookie']
            },
            body: body,
            json: true,
            rejectUnauthorized: false,
            requestCert: false,
            agent: false,
            strictSSL: false,
            resolveWithFullResponse: true
        };

        let requestResponse = await REQUEST_PROMISE(request);
        let responseBody = requestResponse.body;

        if (requestResponse.statusCode === 201) {
            return { status: 201, estado: true, mensaje: 'Exitoso', data: responseBody };
        } else {
            return { status: 400, estado: false, mensaje: requestResponse };
        }

    } catch (ex) {
        return { status: 500, estado: false, mensaje: ex.message };
    }

}

module.exports = { serviceLayerGet, serviceLayerPost }