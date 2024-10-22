import redis from 'redis';

const redisClient = redis.createClient({
    host: process.env.REDIS_HOST || 'localhost', // Redis server host (default: localhost)
    port: 6379 // Redis server port (default: 6379)
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