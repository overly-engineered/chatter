import * as express from "express";
import * as bodyParser from "body-parser";
import * as session from "express-session";
import * as http from "http";
import * as WS from "ws";
import { get } from "lodash";

import { isUuid } from "uuidv4";

const app = express();
const server = http.createServer(app);

const _ = require("lodash");

import ChatsMongoDriver from "./server-utils/mongo-driver";

import randomWords from "random-words";
import colorGenerator from "./server-utils/color";
import { createDecipher } from "crypto";

const url = "mongodb://localhost:37017";
const dbName = "chats";

const mongo = new ChatsMongoDriver({ url, dbName });

server.listen(3000, () => {
  console.log("listening on 3000");
});
/**
 * Standard server
 */
app.use("/dist", express.static(__dirname));
app.use("/docs", express.static(__dirname + "/docs"));

const sessionParser = session({ secret: "superSecret", saveUninitialized: true, resave: true })

app.use(sessionParser);

app.use(bodyParser.json());

app.get(
  "/",
  (req: express.Request, res: express.Response) => {
    _.defaults(req.session, {
      user: {
        color: colorGenerator(),
        name: randomWords({ exactly: 2, join: "-" })
      }
    });
    res.sendFile(__dirname + "/index.html");
  }
);

app.get(
  "/docs",
  (req: express.Request, res: express.Response) => {
    console.log("docs");
    res.sendFile(__dirname + "/docs/index.html");
  }
);

/**
 * Rest endpoints
 */

app.get(
  "/chats",
  async (req: express.Request, res: express.Response) => {
    try {
      const chats = await mongo.listChats();
      return res.json({ chats });
    } catch (e) {
      console.error(e);
      res.status(500)
      return res.send("Something went wrong listing chats")
    }
  }
);

app.get(
  "/chat/:chatId",
  async (req: express.Request, res: express.Response) => {
    const chatId = +req.params.chatId;
    try {
      const chatDetails = await mongo.getChat(chatId);
      return res.json({ chatDetails })
    } catch (e) {
      console.error(e);
      res.status(500)
      return res.send("Something went wrong getting chat")
    }
  }
)


app.post(
  "/chat",
  async (req: express.Request, res: express.Response) => {
    const chatName = req.body.name;
    try {
      const chatDetails = await mongo.createChat(chatName);
      return res.json({ chatDetails });
    } catch (e) {
      console.error(e);
      res.status(500);
      return res.send("Something went wrong creating chat")
    }
  }
)

/**
 * Websocket
 */

let wss = new WS.Server({ server, path: "/ws" });
wss.on(
  "connection",
  (ws: {
    on: (arg0: string, arg1: (message: any) => void) => void;
    send: (arg0: string) => void;
  }) => {
    // connection is up, let's add a simple simple event
    ws.on("message", (message: any) => {
      // log the received message and send it back to the client
      console.log("received: %s", message);
      ws.send(`Hello, you sent message -> ${message}`);
    });

    // send immediatly a feedback to the incoming connection
    ws.send("Hi there, I am a WebSocket server");
  }
);

// * Chats
// subscribe to chat stats
// unsubscribe to chat stats

// * Single chat
// subscribe to chat
// push to chat
// receive from chat
// unsubscribe from chat

// * Single chat rest
// fetch chat messages up to 100
// fetch more chat messages
