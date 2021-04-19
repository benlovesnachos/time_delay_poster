const AWS = require('aws-sdk');
const SQS = new AWS.SQS();
const QUEUE_URL = process.env.QUEUE_URL;
const MAX_QUE_TIME = 900;

exports.handler = function (event, context, callback) {
    console.log('event.body: ' + event.body);

    if (!event.body) {
        return Promise.resolve({ statusCode: 400, body: 'invalid' });
    }

    const { body } = event;
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

    var errorMessages = [];

    if (!waittime) {
        errorMessages.push('Missing waittime');
    } else if (isNaN(waittime)) {
        errorMessages.push('Waittime must be numeric');
    }
    if (!url) {
        errorMessages.push('Missing postback url');
    }
    if (payload === undefined || payload === null) {
        errorMessages.push('Missing payload');
    }

    if (errorMessages.length > 0) {
        console.log(errorMessages);
        return Promise.resolve({ statusCode: 400, body: JSON.stringify({ error: errorMessages.join(', ') }) });
    }

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
};
