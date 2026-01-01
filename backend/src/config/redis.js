const { createClient } = require('redis');

const redisClient = createClient({
    username: 'default',
    password: 'JG8HI4sTxUny05hyWGD8Lq3hRhHjl7eQ',
    socket: {
        host: 'redis-18466.c326.us-east-1-3.ec2.cloud.redislabs.com',
        port: 18466 
    }
});


// Add error handling
redisClient.on('error', (err) => console.log('Redis Client Error', err));

// IMPORTANT: Connect before using


module.exports = redisClient;