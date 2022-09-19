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

    let response = "";
    try {
        let responseLogin = await REQUEST_PROMISE(serviceLayerLogin());

        if (responseLogin.statusCode !== 200) {
            response = { status: 401, estado: false, mensaje: responseLogin.body.error.message.value, datos: null }
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
        response = JSON.parse(JSON.stringify(requestResponse.body));

        if (requestResponse.statusCode === 200) {
            console.log("SL: " + response);
            response = { status: 200, estado: true, mensaje: 'Exitoso', data: response };
        } else {
            response = { status: 400, estado: false, mensaje: 'Petición fallida' };
        }

    } catch (ex) {
        response = { status: 500, estado: false, mensaje: ex.message };
    }
    return response;
}

async function serviceLayerPost(prefix, body) {

    let response = "";
    try {
        let responseLogin = await REQUEST_PROMISE(serviceLayerLogin());

        if (responseLogin.statusCode !== 200) {
            response = { status: 401, estado: false, mensaje: responseLogin.body.error.message.value, datos: null }
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

        response = JSON.parse(JSON.stringify(requestResponse.body));
        if (requestResponse.statusCode === 201) {
            response = { status: 201, estado: true, mensaje: 'Exitoso', data: response };
        } else {
            response = { status: 400, estado: false, mensaje: response.body.error.message.value };
        }

    } catch (ex) {
        console.log("2: " + ex.message);
        response = { status: 500, estado: false, mensaje: ex.message };
    }
    console.log("response post: " + response)
    return response;
}

module.exports = { serviceLayerGet, serviceLayerPost }