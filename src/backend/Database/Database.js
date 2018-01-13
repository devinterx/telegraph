import MongoDB from 'mongodb'

const MongoClient = MongoDB.MongoClient;
const ObjectID = MongoDB.ObjectID;

export default class Database {
    static MONGO_DB = 'mongodb';

    /** @type {MongoDatabase} */
    static db;

    static init(config, callback) {
        if (Database.db === undefined) {
            if (config.database === Database.MONGO_DB) {
                Database.db = new MongoDatabase(config.mongodb, callback);
            } else {
                throw Error('Support only mongodb database.')
            }
        }
        return Database.db;
    }

    static count(collection, query, callback, limit, offset) {
        Database.db.count(collection, query, callback, limit, offset);
    }

    static list(collection, query, callback, limit, offset) {
        Database.db.list(collection, query, callback, limit, offset);
    }

    static find(collection, query, callback, limit, offset) {
        Database.db.find(collection, query, callback, limit, offset);
    }

    static load(collection, query, callback, defaultData) {
        Database.db.load(collection, query, callback, defaultData);
    }

    static save(collection, query, data, callback) {
        Database.db.save(collection, query, data, callback);
    }

    static remove(collection, query, callback) {
        Database.db.remove(collection, query, callback);
    }

    static removeAll(collection, query, callback) {
        Database.db.removeAll(collection, query, callback);
    }
}

class MongoDatabase {
    _db;

    constructor(config, callback) {
        let url;
        if (config.user !== "" && config.password !== "") {
            url = `mongodb://${config.user}:${config.password}@${config.host}:${config.port}/${config.db}`;
        } else {
            url = `mongodb://${config.host}:${config.port}/${config.db}`;
        }
        MongoClient.connect(url).then(client => {
            this._db = client.db(config.db);
            callback();
        }).catch(error => {
            console.log(`DB: error:`, error);
        });
    }

    count(collection, query, callback, limit, offset) {
        let cursor;
        if (limit !== undefined && offset !== undefined) {
            cursor = this._db.collection(collection).find(query).skip(offset).limit(limit);
        } else if (limit !== undefined) {
            cursor = this._db.collection(collection).find(query).limit(limit);
        } else cursor = this._db.collection(collection).find(query);

        cursor.count().then(count => {
            callback(count);
        });
    }

    list(collection, query, callback, limit, offset) {
        let cursor;
        if (limit !== undefined && offset !== undefined) {
            cursor = this._db.collection(collection).find(query).skip(offset).limit(limit);
        } else if (limit !== undefined) {
            cursor = this._db.collection(collection).find(query).limit(limit);
        } else cursor = this._db.collection(collection).find(query);

        cursor.toArray((error, results) => {
            if (error) return console.log(error);

            let items = [];
            for (let i = 0; i < results.length; i++) {
                items.push(MongoDatabase._itemToResult(results[i]));
            }

            cursor.count().then(count => {
                callback(items, count);
            });
        });
    }

    find(collection, query, callback, limit, offset) {
        let cursor;
        if (limit !== undefined && offset !== undefined) {
            cursor = this._db.collection(collection).find(query).skip(offset).limit(limit);
        } else if (limit !== undefined) {
            cursor = this._db.collection(collection).find(query).limit(limit);
        } else cursor = this._db.collection(collection).find(query);

        cursor.count().then(count => {
            if (count < 1) {
                callback(null);
            } else {
                cursor.toArray((error, results) => {
                    if (error) return console.log(error);

                    let items = [];
                    for (let i = 0; i < results.length; i++) {
                        items.push(MongoDatabase._itemToResult(results[i]));
                    }
                    callback(items)
                });
            }
        });
    }

    load(collection, query, callback, defaultData) {
        this._db.collection(collection).findOne(query).then(item => {
            if (item === null && typeof defaultData === 'object' && defaultData !== null) {
                console.log(`DB: record in ${collection} not exist. Trying create...`, query);
                this.save(collection, query, defaultData, callback);
                console.log(`DB: record in ${collection} created.`);
            } else {
                callback(MongoDatabase._itemToResult(item));
            }
        }).catch(error => {
            console.log(`DB: error:`, error);
        });
    }

    save(collection, query, data, callback) {
        if (typeof data === 'object' && data !== null) {
            this._db.collection(collection).updateOne(query, {$set: data}, {upsert: true}).then(updateInfo => {
                callback(data, updateInfo);
            }).catch(error => {
                console.log(`DB: error:`, error);
            });
        } else console.log(`DB: error saving record in "${collection}", DATA is not object.`, data);
    }

    remove(collection, query, callback) {
        this._db.collection(collection).findOne(query).then(item => {
            if (item !== null) {
                this._db.collection(collection).removeOne({_id: new ObjectID(item._id)}).then(() => {
                    callback();
                }).catch(error => {
                    console.log(`DB: error:`, error);
                });
            } else callback();
        }).catch(error => {
            console.log(`DB: error:`, error);
        });
    }

    removeAll(collection, query, callback) {
        this._db.collection(collection).removeMany(query).then(() => {
            callback();
        }).catch(error => {
            console.log(`DB: error:`, error);
        });
    }

    static _itemToResult(item) {
        let result = Object.assign({}, item);
        delete result._id;
        return result;
    }
}
