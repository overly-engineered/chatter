// https://mongodb.github.io/node-mongodb-native/2.1/tutorials/projections/
import { MongoClient, ObjectID } from "mongodb"
import { uuid } from 'uuidv4';
import * as types from "../@types/interfaces";

const REGISTRY = "chat_registry";
const CHATS = "chats";

// Not implemented as yet
// const deletedFilter = {
//   $or: [{ deleted: { $exists: false } }, { deleted: false }]
// }

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


  listChats(searchString: string): Promise<types.ChatItems> {
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
          const regex = new RegExp(`${searchString}`)
          try {
            const chats = await registryCollection.find({ name: { $regex: regex } }).project({ _id: 0 }).limit(100).sort({ createdAt: -1 }).toArray();
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

  getChat(chatId: string): Promise<types.ChatDetails> {
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

          const { registryCollection } = this._getCollection(client);
          const chatPromise = registryCollection.findOne({ id: chatId }, { projection: { _id: 0, type: 0 } })

          try {
            const chat = await chatPromise;
            if (chat) {
              resolve(chat)
            } else {
              reject(404);
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
    return new Promise((resolve, reject) => {
      MongoClient.connect(this.url,
        async (dbErr: any, client: { db: (arg0: string) => any; close: () => void }) => {
          if (dbErr) {
            reject(dbErr);
          }

          const { registryCollection } = this._getCollection(client);

          const id = uuid();

          const timestamp = this._createTimestamp()

          const chatPromise = await registryCollection.insertOne({ type: "chat", name, createdAt: timestamp, lastUpdatedAt: timestamp, id, totalMessages: 0 })
          const chatDocument = registryCollection.findOne(new ObjectID(chatPromise.insertedId), { projection: { _id: 0, type: 0 } });

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

  // updateChat(chatId: number, update: object): Promise<types.ChatDetails> {
  //   return new Promise((resolve, reject) => {
  //     resolve(true);
  //   });
  // }

  // deleteChat(chatId: number): Promise<object> {
  //   return new Promise((resolve, reject) => {
  //     resolve(true);
  //   });
  // }

  getMessagesForChat(chatId: string, offset: number = 0): Promise<types.MessageItems> {
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

          const { chatsCollection } = this._getCollection(client);

          try {
            const messages = await chatsCollection.find({ chatId }, { sort: { timestamp: 1 }, limit: 200, skip: offset, projection: { _id: 0, chatId: 0 } }).toArray();
            if (messages) {
              resolve(messages)
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

  createMessage(chatId: string, message: string, user: string, color: string): Promise<types.Message> {
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
          const { chatsCollection, registryCollection } = this._getCollection(client);
          if (!chatId || !message) {
            throw Error();
          }
          const timestamp = this._createTimestamp();
          const id = uuid();

          try {
            const chatCreation = await chatsCollection.insertOne({ id, timestamp, chatId, message, user, color });
            const chatDocument = await chatsCollection.findOne(new ObjectID(chatCreation.insertedId), { projection: { _id: 0 } });
            // Update the chat document to include the new message
            const registryUpdate = await registryCollection.findOneAndUpdate({ id: chatId }, { $inc: { totalMessages: 1 }, $set: { lastUpdatedAt: timestamp } })
            if (chatDocument && registryUpdate) {
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

  /**
   * Helper functions
   */


  _getCollection(client: any): { db: any, registryCollection: any, chatsCollection: any } {
    const db = client.db(this.dbName);
    const registryCollection = db.collection(REGISTRY);
    const chatsCollection = db.collection(CHATS);

    return { db, registryCollection, chatsCollection }
  }

  _createTimestamp(): number {
    return new Date().getTime();
  }
}

export default ChatsMongoDriver;
