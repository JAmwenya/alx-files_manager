// utils/redis.js

import redis from 'redis';

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
});

// Check if Redis is alive by sending a ping command
export async function isAlive() {
  return new Promise((resolve, reject) => {
    redisClient.ping((err, result) => {
      if (err) {
        console.error('Error pinging Redis:', err);
        reject(new Error('Redis ping failed')); // Rejecting with an Error object
      } else {
        resolve(result === 'PONG');
      }
    });
  });
}

export default redisClient;
