'use strict';

const axios = require('axios');
const AWS = require('aws-sdk');
const SQS = new AWS.SQS();
const QUEUE_URL = process.env.QUEUE_URL;
const MAX_QUE_TIME = process.env.MAX_QUE_TIME;

function processRecord(record, callback) {
    console.log('record: ' + JSON.stringify(record));
    const { body } = record;
    console.log('body: ' + body);
    const { receiptHandle } = record;
    console.log('record.ReceiptHandle: ' + receiptHandle);

    try {
        var _body = JSON.parse(body);
    } catch (err) {
        console.log('ERROR: ' + err);
        return Promise.resolve({ statusCode: 500, body: JSON.stringify({ error: err }) });
    }

    var { waittime } = _body;
    const { url } = _body;
    const { payload } = _body;

    console.log('body: ' + body);
    console.log('waittime: ' + waittime);
    console.log('url: ' + url);
    console.log('payload: ' + payload);

    if (waittime > 0) {
        // add new message to the queue...

        var _waittime_remaining = 0;
        if (waittime > MAX_QUE_TIME) {
            _waittime_remaining = waittime - MAX_QUE_TIME;
            waittime = MAX_QUE_TIME;
        }
        _body.waittime = _waittime_remaining;
        console.log('waittime_remaining: ' + _waittime_remaining);

        var _messageBody = JSON.stringify(_body);
        console.log('_messageBody: ' + _messageBody);

        var params = {
            DelaySeconds: waittime,
            MessageBody: _messageBody,
            QueueUrl: QUEUE_URL
        };

        return SQS.sendMessage(params)
            .promise()
            .then(() => ({ statusCode: 204, body: '' }))
            .catch(err => {
                console.log(err);
                return ({ statusCode: 500, body: 'Error:' + err });
            });

    } else {
        axios.post(url, payload)
            .then((res) => {
                console.log(`statusCode: ${res.statusCode}`);
                console.log(res);
            })
            .catch((error) => {
                console.error(error);
            });
    }


}

exports.handler = (event, context, callback) => {
    try {
        event.Records.forEach(record => {
            processRecord(record, callback);
        });
    } catch (err) {
        callback(err);
    }
};
