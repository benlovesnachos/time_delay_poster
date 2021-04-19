
# Applications

These are different applications that can be built with the CloudFormation scripts in the `cloud_formation` folder.

## Time Delay Poster

`timeDelayPoster.json`

This application will allow an endpoint to be called after a delay of 0-900 seconds.  A payload may be specified and sent when the call is made.

Uses: [post-sqs.js](#markdown-header-post-sqs) [sqs-poster.js](#markdown-header-sqs-poster)


# Lambda Functions

---
## Post SQS

`post-sqs.js`

This function will take a JSON payload and post the payload to an SQS queue.  The message can be put on a time delay on when it would be available for consumption from the SQS queue.

```
    {
        "waittime":"0",
        "url":"https://your.url.com/",
        "payload": "WOOOO!!!!"
    }    
```



---
## SQS Poster

This function will receive an SQS message containing JSON in the body.

`sqs-poster.js`

This will send a **POST** to the `url` in the JSON sent to the Lambda function running `post-sqs.js`.


----
## Enhancement ideas

Use `cron` format strings for fine tuning closer to exact trigger time.

https://github.com/sourceclear/cron-builder
https://www.npmjs.com/package/cron-parser



---
## Known issues

1. Processing will be stuck if the `payload` is malformed JSON and the URL trigger will not fire properly.
2. Time will drift about 70 seconds per 12 hours.
