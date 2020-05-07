# Producer-Consumer template with Throttling

## Description

Microservice that uses SNS as an intake of potentially large amount of messages for asynchronous processing by long(ish) running Lambda function that allows throttling in order to control pressure on the resources used in Lambdas (RDS connections). Without such throttling AWS will attempt to spin up as many instances of Lambda as possible potentially exhausting service limits (1000 concurrent executions) and affecting downward resources (Aurora RDS).

Maximum number of concurrent executions is controlled via

```yaml
    reservedConcurrency: 5
```

SNS immediatelly delivers all messages to SQS queue which in turn delivers messages via trigger (no polling is required) to Lambda function for processing. SNS-to-SQS message delivery is considered highly reliable and almost instant.

Consumer Lambda will simulate long-running processing (Unit Of Work) of the SQS messages via configurable timout.

Messages from SQS will be delivered to Lambda in batches via SQS trigger (no need to poll queue for messages). Size of the batch is configured via serverless.yml parameter:

```yaml
batchSize: 5
```

Messages from SQS will be processed by Consumer Lambda out of order due to the throttling and SQS retry mechanism.

## Retry mechanism

Throttling of the Consumer Lambda (maximum number of instances) requires certain SQS configuration in order to ensure that each message sent to SQS gets processed.

The retry mechanism relies on 2 parameters:

```yaml
        VisibilityTimeout: 180 #seconds
        RedrivePolicy:
        ...
          maxReceiveCount: 500
```

*VisibilityTimeout* - controls for how long SQS message will be "in flight" (hidden, not available for receiving) from the queue in attempt to deliver it to Lambda. If no lambda instance is availabe to process this message, it will be returned to the queue.

*maxReceiveCount* - number of attempts SQS will make for the message to deliver it to lambda before moving it to the Dead Letter Queue (DLQ).

By adjusting the following parameters:

- reservedConcurrency
- batchSize
- VisibilityTimeout
- maxReceiveCount

one can achieve optimal throughput without the need to write any code other than actual processing of the messages.
