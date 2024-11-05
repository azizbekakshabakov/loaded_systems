import redis from 'redis';

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisClient = redis.createClient({
    url: `redis://${redisHost}:6379`,
    // host: process.env.REDIS_HOST || 'localhost',
    // port: 6379
});

redisClient.on('error', (err) => {
    console.error('Redis Client Error', err);
});

(async () => {
    await redisClient.connect();
})();

if (!redisClient.isOpen) {
    console.log("Redis: Не удалось");
} else {
    console.log("Redis: Ура");
}

export { redisClient };