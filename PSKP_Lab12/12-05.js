const redis = require('redis');
const client = redis.createClient({ url: 'redis://localhost:6379' });

client.on('error', () => console.log('Redis internal error.'));
client.on('connect', () => console.log('\nClient connected to Redis.'));
client.on('end', () => console.log('Client disconnected.\n'));

(async () => {
    await client.connect();

    setInterval(async () => {
        await client.publish('first channel', 'Hello from first channel');
    }, 1000)
        .unref();

    setInterval(async () => {
        await client.publish('second channel', 'Hello from second channel');
    }, 1500)
        .unref();

    setTimeout(async () => {
        await client.quit();
    }, 9000);
})();
