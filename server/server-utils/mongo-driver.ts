const MongoClient = require("mongodb").MongoClient;
// const Db = require("mongodb").Db;
// const Server = require("mongodb").Server;
const REGISTRY = "chat_registry";
const chats = "chats";

class ChatsMongoDriver {
  url: string;
  dbName: string;
  constructor(params: { url: string; dbName: string }) {
    this.url = params.url;
    this.dbName = params.dbName;

    if (!this.dbName || !this.url) {
      throw new Error("MongoDriver: port and dbName required");
    }
  }

  listChats() {
    return new Promise((resolve, reject) => {
      MongoClient.connect(
        this.url,
        (
          dbErr: any,
          client: { db: (arg0: string) => any; close: () => void }
        ) => {
          if (dbErr) {
            reject(dbErr);
          }

          const db = client.db(this.dbName);

          const collection = db.collection(REGISTRY);

          collection.find({}).toArray((err: any, docs: unknown) => {
            if (err) {
              reject(err);
            }
            resolve(docs);
          });

          client.close();
        }
      );
    });
  }

  // getChat() {}

  createMessage({ chatId, message }: { chatId: string; message: string }) {
    return new Promise((resolve, reject) => {
      // Use connect method to connect to the server
      MongoClient.connect(
        this.url,
        (
          dbErr: any,
          client: { db: (arg0: string) => any; close: () => void }
        ) => {
          if (dbErr) {
            reject(dbErr);
          }
          console.log("Connected successfully to server");
          const db = client.db(this.dbName);

          const collection = db.collection(REGISTRY);

          collection.find({}).toArray((err: any, docs: unknown) => {
            if (err) {
              reject(err);
            }
            resolve(docs);
          });

          client.close();
        }
      );
    });
  }
}

module.exports = ChatsMongoDriver;
