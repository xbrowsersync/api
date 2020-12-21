# xBrowserSync Serverless API

This is a simple implementation of [xBrowserSync API](https://github.com/xbrowsersync/api) using AWS Serverless technologies. All the components that's used here are on-demand hence you pay only for what you use.

### Prerequisites
* Active AWS Account
* IAM permissions to create IAM Role, DynamoDB Tabe, API Gateway & Lambda function.
* AWS CLI (*if you are going to use the command in next step*)

### Deployment
Run the following [AWS CLI](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/index.html) command to create this API backend using [AWS CloudFormation](https://aws.amazon.com/cloudformation/).

```
aws cloudformation create-stack --stack-name xBrowserSync --capabilities CAPABILITY_IAM --template-body file://xBrowserSync.yaml
```

***Note:***
This has been written for personal use as a private API backend hence followed the below mentioned best practices.
* DynamoDB Table - [On-demand capacity](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ReadWriteCapacityMode.html#HowItWorks.OnDemand) and [Point-in Time Recovery](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/PointInTimeRecovery.html) are configured.
* API Gateway - [Error logs](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-logging.html) are enabled and [requests are throttled](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-request-throttling.html#apigateway-how-throttling-limits-are-applied) to 10 requests/second
* Lambda functions - [Per function concurrency](https://docs.aws.amazon.com/lambda/latest/dg/API_PutFunctionConcurrency.html) is been configured to be 10 and 20 for two different API calls.

