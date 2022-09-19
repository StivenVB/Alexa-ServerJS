/**
 * This is a nodejs express web server wrapper as a standalone version of b1Assistant(b1Assistant.js) 
 */


//begin of wrapper for https endpoint of b1Assistant.js
//You could deploy this alexa nodejs skill locally or on cloud foundry
const express = require('express');
//var fs = require('fs');
//var https = require('https');
const bodyParser = require('body-parser');
const b1Assistant = require('./modules/b1Assistant');
var data = require('./service_layer/ServiceLayerClient');

const app = express();
const PORT = process.env.PORT || 8089;

const SL = require('./service_layer/ServiceLayerClient')

/*https.createServer({
    cert: fs.readFileSync('server.crt'),
    key: fs.readFileSync('server.key')
}, app).listen(PORT, function() {
    console.log('B1AssistantAlexa https App listening to port ...' + PORT);
});*/

app.use(({
    method,
    url
}, rsp, next) => {
    rsp.on('finish', () => {
        console.log(`${rsp.statusCode} ${method} ${url}`);
    });
    next();
});

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

app.post('/', function(req, res) {
    const context = {
        fail: () => {
            //fail with internal server error
            console.log('failure in context');
            res.sendStatus(500);
        },
        succeed: data => {
            res.send(data);
        }
    };
    b1Assistant.handler(req.body, context);
});

app.get('/', function(req, res) {

    return res.send(JSON.stringify({ status: "En linea" }));

});



app.post('/test', function(req, res, next) {
    let tmp = {
        "CardCode": "30230986",
        "DocDueDate": "2022-09-19",
        "BPL_IDAssignedToInvoice": 1,
        "DocumentLines": [{
            "ItemCode": "01254811",
            "Quantity": 1
        }]
    };

    let prefix = 'Orders';

    data.serviceLayerPost(prefix, tmp)
        .then(function(data) {
            var status = data.status
            delete data['status']
            res
                .status(status)
                .json(data)

        })
        .catch(function(error) {
            var status = error.status || 500
            delete error['status']
            res
                .status(status)
                .json(error)
        })
})


app.listen(PORT, function() {
    console.log('B1AssistantAlexa App listening to port ...' + PORT);
});
//end of wrapper for cloud foundry