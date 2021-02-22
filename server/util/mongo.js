import mongopkg from "mongodb";

const mongoClient = mongopkg.MongoClient;
export const ObjectID = mongopkg.ObjectID;

// get simple pagination query
export const querystuff = (obj) => {
  const query = {
    page: 0,
    pageSize: 10
  };
  ["page", "pageSize"].forEach(key => {
    const c = obj[key];
    if (c) {
      query[key] = Number(c);
    }
  });

  return query;
};

// common validations
export const validations = {
  empty: (payload) => Object.keys(payload).length === 0,
  emptyN: (payload, n) => Object.keys(payload).length < n,
  noName: (payload) => !(payload.name)
};

export default class Mongler {
  constructor(connectionString, databaseName) {
    this.connectionString = connectionString;
    this.databaseName = databaseName;

    // mongo client
    this.client = null;
  }

  // create connection
  async init() {
    var [client, err] = await new Promise((res) => {
      mongoClient
        .connect(this.connectionString, { useUnifiedTopology: true })
        .then((c) => res([c, false]))
        .catch((err) => res([null, err]));
    });

    if (err) {
      throw new Error(`Error creating mongo client: ${err}`);
    }

    this.client = client;
    console.log("connected to mongodb");
    return true;
  }

  getDb(dbname = this.databaseName) {
    return this.client.db(dbname);
  }

  getCollection(collectionName) {
    return this.getDb().collection(collectionName);
  }

  // convenience? abstraction? idk
  async findInCollection(
    collectionName,
    query = { page: 0, pageSize: 0 },
    filter = {}
  ) {

    const collection = this.getCollection(collectionName);
    const cursor = collection
      .find(filter)
      .sort({ _id: 1 })
      .skip(query.page * query.pageSize)
      .limit(query.pageSize);

    //
    const records = [];
    await cursor.forEach((doc) => records.push(doc));
    return records;
  }

  async findOneInCollection(collectionName, id) {
    const collection = this.getCollection(collectionName);
    const record = await collection.findOne({_id: id});
    return record;
  }

  async postToCollection(collectionName, document) {
    // set / overwrite a document _id
    document._id = ObjectID().toString();

    const collection = this.getCollection(collectionName);
    const result = await collection.insertOne(document);
    return result.insertedCount === 1 ? result.insertedId : false;
  }

  async updateInCollection(collectionName, id, document) {
    // not necessary for update, prevent user from altering document id
    delete document._id;
    const collection = this.getCollection(collectionName);

    const result = await collection.replaceOne(
      { _id: id },
      document,
      { upsert: false }
    );

    if (result.modifiedCount > 0 || result.matchedCount > 0) {
      // document updated or found but no update
      return true;
    } else {
      // no matching document or an error
      return false;
    }
  }

  async deleteFromCollection(collectionName, id) {
    const collection = this.getCollection(collectionName);

    const result = await collection.deleteOne({ _id: id });

    if (result.deletedCount > 0) {
      return true;
    } else {
      return false;
    }
  }

  // close connection(s)
  close() {
    this.client.close();
  }
}
