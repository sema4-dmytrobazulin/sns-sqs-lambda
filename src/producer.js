
const aws = require("aws-sdk"); // eslint-disable-line import/no-extraneous-dependencies
const sns = new aws.SNS({ region: 'us-east-1' })
const TOPIC_NAME = process.env.SNS_TOPIC_ARN;

function produce(event, context, callback) {
	console.log(JSON.stringify(event, null, 4));

    const params = {
        Message: `triggering other Lambda(s).`,
        TopicArn: TOPIC_NAME
      }
    
    //TODO: pass number of messages via HTTP
    var i;
    for (i = 0; i < 5; i++ ) {

        console.log(`publishing message "${i}"`);
        
        params.Message = JSON.stringify({
            id: i,
            text: `Message number "${i}"`
        });

        sns.publish(params, (error, data) => {
            if (error) {
                return callback(error);
            }
        });
    }

    return callback(null, {
      statusCode: 200,
      body: JSON.stringify({
        message: `Messages successfully published to SNS topic "${TOPIC_NAME}"`
      }),
    });
}

module.exports.handler = produce;