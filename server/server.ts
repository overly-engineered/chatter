const express = require("express");
const session = require("express-session");
const http = require("http");
const WS = require("ws");
const app = express();
const server = http.createServer(app);

const _ = require("lodash");

const CMD = require("./server-utils/mongo-driver");
// import ChatsMongoDriver from "./utils/mongo-driver";

const randomWords = require("random-words");
const colorGenerator = require("./server-utils/color");

const url = "mongodb://localhost:37017";
const dbName = "chats";

const mongo = new CMD({ url, dbName });

/**
 * Standard server
 */
app.use("/dist", express.static(__dirname));

app.use(
  session({ secret: "superSecret", saveUninitialized: true, resave: true })
);

server.listen(3000, () => {
  console.log("listening on 3000");
});

app.get(
  "/",
  (req: { session: any }, res: { sendFile: (arg0: string) => void }) => {
    console.log(req.session);
    _.defaults(req.session, {
      user: {
        color: colorGenerator(),
        name: randomWords({ exactly: 2, join: "-" })
      }
    });
    res.sendFile(__dirname + "/index.html");
  }
);

app.post(
  "/chats",
  async (
    req: { session: any },
    res: { send: (arg0: any) => void; error: (arg0: string, arg1: any) => void }
  ) => {
    console.log(JSON.stringify(req.session));
    try {
      const chats = await mongo.listChats();
      res.send(chats);
    } catch (e) {
      console.error(e);
      res.error("500", e);
    }
  }
);

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
