// // utils/redis.js

// import redis from 'redis';

// class RedisClient {
//   constructor() {
//     this.client = redis.createClient({
//       host: process.env.REDIS_HOST || 'localhost',
//       port: process.env.REDIS_PORT || 6379,
//     });

//     this.client.on('error', (err) => {
//       console.log(`Redis error: ${err}`);
//     });
//   }

//   isAlive() {
//     return this.client.connected;
//   }

//   async get(key) {
//     return new Promise((resolve, reject) => {
//       this.client.get(key, (err, data) => {
//         if (err) reject(err);
//         resolve(data);
//       });
//     });
//   }

//   async set(key, value, duration) {
//     return new Promise((resolve, reject) => {
//       this.client.setex(key, duration, value, (err, response) => {
//         if (err) reject(err);
//         resolve(response);
//       });
//     });
//   }

//   async del(key) {
//     return new Promise((resolve, reject) => {
//       this.client.del(key, (err, response) => {
//         if (err) reject(err);
//         resolve(response);
//       });
//     });
//   }
// }

// const redisClient = new RedisClient();
// export default redisClient;
import { promisify } from 'util';
import { createClient } from 'redis';

/**
 * Represents a Redis client.
 */
class RedisClient {
  /**
   * Creates a new RedisClient instance.
   */
  constructor() {
    this.client = createClient();
    this.isClientConnected = true;
    this.client.on('error', (err) => {
      console.error('Redis client failed to connect:', err.message || err.toString());
      this.isClientConnected = false;
    });
    this.client.on('connect', () => {
      this.isClientConnected = true;
    });
  }

  /**
   * Checks if this client's connection to the Redis server is active.
   * @returns {boolean}
   */
  isAlive() {
    return this.isClientConnected;
  }

  /**
   * Retrieves the value of a given key.
   * @param {String} key The key of the item to retrieve.
   * @returns {String | Object}
   */
  async get(key) {
    return promisify(this.client.GET).bind(this.client)(key);
  }

  /**
   * Stores a key and its value along with an expiration time.
   * @param {String} key The key of the item to store.
   * @param {String | Number | Boolean} value The item to store.
   * @param {Number} duration The expiration time of the item in seconds.
   * @returns {Promise<void>}
   */
  async set(key, value, duration) {
    await promisify(this.client.SETEX)
      .bind(this.client)(key, duration, value);
  }

  /**
   * Removes the value of a given key.
   * @param {String} key The key of the item to remove.
   * @returns {Promise<void>}
   */
  async del(key) {
    await promisify(this.client.DEL).bind(this.client)(key);
  }
}

export const redisClient = new RedisClient();
export default redisClient;