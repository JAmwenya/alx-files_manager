// utils/redis.js

import redis from 'redis';

class RedisClient {
  constructor() {
    this.client = redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
    });

    this.client.on('error', (err) => {
      console.log(`Redis error: ${err}`);
    });
  }

  isAlive() {
    return this.client.connected;
  }

  async get(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, data) => {
        if (err) reject(err);
        resolve(data);
      });
    });
  }

  async set(key, value, duration) {
    return new Promise((resolve, reject) => {
      this.client.setex(key, duration, value, (err, response) => {
        if (err) reject(err);
        resolve(response);
      });
    });
  }

  async del(key) {
    return new Promise((resolve, reject) => {
      this.client.del(key, (err, response) => {
        if (err) reject(err);
        resolve(response);
      });
    });
  }
}

const redisClient = new RedisClient();
export default redisClient;
