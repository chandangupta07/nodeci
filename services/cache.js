const mongoose = require("mongoose");
const redis = require("redis");
const util = require("util");
const keys = require('../config/keys');
const client = redis.createClient(keys.redisUrl);
// for nested caching 
client.hget = util.promisify(client.hget);
// for linear caching
// client.get = util.promisify(client.get);
const exec = mongoose.Query.prototype.exec;
// creating a cache proeprty for inside mongoose query prototype so we can use in our query wherever we want 

mongoose.Query.prototype.cache = function (options = {}) {
    this.useCache = true;
    // using for nested level caching for partcular users
    this.hashKey = JSON.stringify(options.key || "");
    return this;
}

mongoose.Query.prototype.exec = async function () {
    if (!this.useCache) {
        return exec.apply(this, arguments);
    }
    console.log("IM ABOUT TO RUN A QUERY");

    // creating key with query and collection name
    // const key = JSON.stringify(Object.assign({}, this.getQuery(), { collection: this.mongooseCollection.name }));
    const key = JSON.stringify(Object.assign({}, this.getQuery(), { collection: this.mongooseCollection.name }));
    console.log(key);
    //checking if that query have caxched value nested
    const cachedValue = await client.hget(this.hashKey, key);

    // checking if that query have caxched value linear
    //const cachedValue = await client.get(key);
    if (cachedValue) {
        console.log("RETURNING FROM CACHED")
        // returning data from cache by creating model object of mongo with stored data
        // it conver to actual document
        let doc;
        const parsedDoc = JSON.parse(cachedValue);
        // if parsed doc is an array of object
        if (Array.isArray(parsedDoc)) {
            doc = parsedDoc.map(d => new this.model(d));
        } else {
            // if coming cached value is single object
            doc = new this.model(parsedDoc);
        }
        return doc;
    }

    // if not have cached value than executing the query and storing data into cache
    const result = await exec.apply(this, arguments);
    //setting cached dta expiring in 10 secs nested
    client.hset(this.hashKey, key, JSON.stringify(result));
    // setting cached dta expiring in 10 secs linear
    //client.set(key, JSON.stringify(result), "EX", 10);
    //client.set(key, JSON.stringify(result));
    return result;
}

module.exports = {
    clearCache(hashKey) {
        client.del(JSON.stringify(hashKey));
    }
}