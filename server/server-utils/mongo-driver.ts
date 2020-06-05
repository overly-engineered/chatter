// https://mongodb.github.io/node-mongodb-native/2.1/tutorials/projections/
const MongoClient = require("mongodb").MongoClient;
const ObjectID = require('mongodb').ObjectID;
import { uuid } from 'uuidv4';
import * as types from "../@types/interfaces";

const REGISTRY = "chat_registry";
const CHATS = "chats";

const deletedFilter = {
  $or: [{ deleted: { $exists: false } }, { deleted: false }]
}

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
  /**
   * List chats
   *
   * @returns {Array} chats Array of chats
   */
  listChats(): Promise<types.ChatItems> {
    return new Promise((resolve, reject) => {
      MongoClient.connect(
        this.url,
        async (
          dbErr: any,
          client: { db: (arg0: string) => any; close: () => void }
        ) => {
          if (dbErr) {
            reject(dbErr);
          }

          const { registryCollection } = this._getCollection(client);

          try {
            const chats = await registryCollection.find(deletedFilter).project({ _id: 0 }).toArray();
            resolve(chats);
          } catch (e) {
            reject(e)
          } finally {
            client.close();
          }
        }
      );
    });
  }

  getChat(chatId: number): Promise<types.ChatDetails> {
    // Get chat registry details
    // Get total messages
    return new Promise((resolve, reject) => {
      MongoClient.connect(
        this.url,
        async (
          dbErr: any,
          client: { db: (arg0: string) => any; close: () => void }
        ) => {
          if (dbErr) {
            reject(dbErr);
          }

          const { registryCollection, chatsCollection } = this._getCollection(client);

          const chatPromise = registryCollection.findOne({ $and: [{ id: chatId }, deletedFilter] }, { projection: { _id: 0, type: 0 } })
          const messageCountPromise = chatsCollection.estimatedDocumentCount({ chatId });

          try {
            const [chat, messageCount] = [await chatPromise, await messageCountPromise];

            if (chat && messageCount) {
              resolve({
                ...chat,
                messageCount
              })
            } else {
              reject();
            }
          } catch (e) {
            reject(e);
          } finally {
            client.close();
          }

        }
      );
    });
  }

  createChat(name: string): Promise<types.ChatDetails> {
    console.log(name);
    return new Promise((resolve, reject) => {
      MongoClient.connect(this.url,
        async (dbErr: any, client: { db: (arg0: string) => any; close: () => void }) => {
          if (dbErr) {
            reject(dbErr);
          }

          const { registryCollection } = this._getCollection(client);

          const id = uuid();

          const timestamp = this._createTimestamp()

          const chatPromise = await registryCollection.insertOne({ type: "chat", name, createdAt: timestamp, lastUpdatedAt: timestamp, id })
          const chatDocument = registryCollection.findOne(ObjectID(chatPromise.insertedId), { projection: { _id: 0, type: 0 } });

          try {
            const chat = await chatDocument;
            if (chat) {
              resolve(chat);
            } else {
              reject();
            }
          } catch (e) {
            reject(e)
          } finally {
            client.close()
          }
        });
    });
  }

  updateChat(chatId: number, update: object): Promise<types.ChatDetails> {
    return new Promise((resolve, reject) => {
      resolve(true);
    });
  }

  deleteChat(chatId: number): Promise<object> {
    return new Promise((resolve, reject) => {
      resolve(true);
    });
  }


  _getCollection(client: any): { db: any, registryCollection: any, chatsCollection: any } {
    const db = client.db(this.dbName);
    const registryCollection = db.collection(REGISTRY);
    const chatsCollection = db.collection(CHATS);

    return { db, registryCollection, chatsCollection }
  }

  _createTimestamp(): number {
    return new Date().getTime();
  }

  createMessage({ chatId, message, user, color }: { chatId: string; message: string, user: string, color: string }): Promise<types.Message> {
    return new Promise((resolve, reject) => {
      // Use connect method to connect to the server
      MongoClient.connect(
        this.url,
        async (
          dbErr: any,
          client: { db: (arg0: string) => any; close: () => void }
        ) => {
          if (dbErr) {
            reject(dbErr);
          };
          const { chatsCollection } = this._getCollection(client);
          if (!chatId || !message) {
            throw Error();
          }
          const timestamp = this._createTimestamp();
          try {
            const chatCreation = await chatsCollection.insertOne({ timestamp, chatId, message, user, color });
            const chatDocument = await chatsCollection.findOne(ObjectID(chatCreation.insertedId), { projection: { _id: 0 } });
            if (chatDocument) {
              resolve(chatDocument);
            } else {
              throw Error("Create failure")
            }
          } catch (e) {
            reject(e)
          } finally {
            client.close();
          }
        }
      );
    });
  }
}

export default ChatsMongoDriver;
