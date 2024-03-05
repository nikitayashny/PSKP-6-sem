const redis = require('redis');
const client = redis.createClient({ url: 'redis://localhost:6379' });

client.on('error', () => console.log('Redis internal error.'));
client.on('connect', () => console.log('\nClient connected to Redis.'));
client.on('end', () => console.log('Client disconnected.\n'));

(async () => {
    await client.connect();

    client.set('incr', 0);

    console.time('[INCR]');
    for (let i = 1; i <= 10000; ++i) {
        await client.incr('incr');
    }
    console.timeEnd('[INCR]');

    console.time('[DECR]');
    for (let i = 1; i <= 10000; ++i) {
        await client.decr('incr');
    }
    console.timeEnd('[DECR]');

    await client.quit();
})();