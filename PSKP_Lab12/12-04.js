const redis = require('redis');
const client = redis.createClient({ url: 'redis://localhost:6379' });

client.on('error', () => console.log('Redis internal error.'));
client.on('connect', () => console.log('\nClient connected to Redis.'));
client.on('end', () => console.log('Client disconnected.\n'));

(async () => {
    await client.connect();

    console.time('[HSET]');
    for (let i = 1; i <= 10000; ++i) {
        await client.hSet('HashField', i.toString(), JSON.stringify({ id: i, value: 'val-' + i }));
    }
    console.timeEnd('[HSET]');

    console.time('[HGET]');
    for (let i = 1; i <= 10000; ++i) {
        const value = await client.hGet('HashField', i.toString());
    }
    console.timeEnd('[HGET]');

    await client.quit();
})();