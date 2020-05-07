
const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
  }
  
async function consume(event, context) {
    console.log(JSON.stringify(event, null, 4));

    for (const record of event.Records) {
        const { body } = record;
        console.log(body);
        console.log('Taking a break...');
        //TODO: make "working" delay configurable via environment variable
        await sleep(10000);
        console.log('Twenty seconds later,...');
    }    
    
    return {};
}

module.exports.handler = consume;