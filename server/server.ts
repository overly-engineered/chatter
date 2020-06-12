import * as express from "express";
import * as bodyParser from "body-parser";
import * as session from "express-session";
import * as http from "http";
import * as WS from "ws";
import * as types from "./@types/interfaces";
import { get } from "lodash";
import { isUuid } from "uuidv4";

const app = express();
const server = http.createServer(app);

const _ = require("lodash");

import ChatsMongoDriver from "./server-utils/mongo-driver";

import randomWords from "random-words";
import colorGenerator from "./server-utils/color";

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

/**
 * Create session stuff
 */
const sessionParser = session({ secret: "superSecret", saveUninitialized: true, resave: true })
app.use(sessionParser);

/**
 * Body parser for application/json
 */
app.use(bodyParser.json());

/**
 * Doc page
 */
app.get(
  "/chat-api/docs",
  (req: express.Request, res: express.Response) => {
    console.log("docs");
    res.sendFile(__dirname + "/docs/index.html");
  }
);

/**
 * Get a list of chats
 */
app.get(
  "/chat-api/chats",
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

/**
 * Get a specific chat details
 */
app.get(
  "/chat-api/chat/:chatId",
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

/**
 * Create a new chat
 */
app.post(
  "/chat-api/chat",
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
 * Websocket stuff
 */

/**
 * Our created webserver
 */
const wss = new WS.Server({ server, path: "/chat-api/connection" });

/**
 * Our list of connected clients
 */
const connected_clients: { [index: string]: Set<WS> } = {};

/**
 * When the Websocket server gets a connection
 */
wss.on(
  "connection",
  (socket, req) => {

    /**
     *
     * Validate the new request object, to detect if its a valid connection attempt
     *
     * @param req Express request.
     *
     * @returns Object
     */
    const _validateRequestAndParams = (req: express.Request): types.SocketParams => {
      if (!req || !req.url) throw Error("Invalid connection attempt");
      const user = get(req, "session.user");
      if (!user) {
        throw new Error("No user detected")
      } else {
        const userName = get(user, "name", "anonymous");
        const userColor = get(user, "color", "rebeccapurple")

        const queryParam = req.url.split("?")[1];
        if (queryParam.indexOf("chat") !== 0) {
          throw new Error("Invalid url");
        }
        // Remember the chatId
        const chatId = queryParam.split("=")[1];

        if (!isUuid(chatId)) {
          throw new Error("Invalid chat id");
        }

        return { chatId, userName, userColor }
      }
    }

    /**
     *
     * Send a message to every registered client for a given chat
     *
     * @param chatId string
     * @param message string
     * @param sendToSelf boolean
     */
    const _broadcastMessage = (chatId: string, message: object, sendToSelf: boolean = false) => {
      wss.clients.forEach(client => {
        if (sendToSelf) {
          if (connected_clients[chatId].has(client)) {
            client.send(JSON.stringify(message));
          }
        } else {
          if (client !== socket && connected_clients[chatId].has(client)) {
            client.send(JSON.stringify(message));
          }
        }
      });
    }

    /**
     *
     * Welcome the new user and return the previous 100 messages.
     * Register the socket so they receive updates on the chatId
     *
     * @param param0
     * @param param0.chatId Chat for the attempted connection
     * @param param0.username Username on the current session
     */
    const initialResponse = async ({ chatId, userName }: types.SocketParams) => {
      const prevMessages = await mongo.getMessagesForChat(chatId);
      if (prevMessages) {
        const response = {
          broadcast: `Welcome to the chat`,
          prevMessages: prevMessages
        }
        _broadcastMessage(chatId, { broadcast: `${userName} joined the chat` })
        registerSocket(chatId)
        socket.send(JSON.stringify(response));
      } else {
        throw new Error("Could not retrieve messages")
      }
    }

    /**
     *
     * Register this socket as listening to this chat
     *
     * @param chatId Current chat id
     */
    const registerSocket = (chatId: string) => {
      if (connected_clients[chatId]) {
        connected_clients[chatId].add(socket);
      } else {
        connected_clients[chatId] = new Set();
        connected_clients[chatId].add(socket);
      }
    }

    /**
     *
     * Deregister this socket so we don't send it more messages
     *
     * @param chatId Current chat id
     */
    const deRegisterSocket = (chatId: string) => {
      connected_clients[chatId].delete(socket);
    }

    /**
     *
     * A user sent a message we need to handle it.
     *
     * @param message Incoming message
     * @param param1 Message params
     */
    const handleIncomingMessage = async (message: string, { chatId, userName, userColor }: types.SocketParams) => {
      try {
        const createdMessage = await mongo.createMessage(chatId, message, userName, userColor);
        if (createdMessage) {
          _broadcastMessage(chatId, { message: createdMessage }, true)
        }
      } catch (e) {
        console.error(e)
      }
    }

    /**
     *
     * User has disconnected.
     *
     * @param param0 Message params
     */
    const handleSocketClose = ({ chatId, userName }: types.SocketParams) => {
      _broadcastMessage(chatId, { broadcast: `${userName} left the chat` });
      deRegisterSocket(chatId)
    }

    /**
     * Main handling code that adds listeners etc.
     */
    try {
      // This is a bit of a hack to get the express session into websockets
      // @ts-ignore
      sessionParser(req, {}, async () => {
        // @ts-ignore
        const params = _validateRequestAndParams(req);

        // Do the initial response
        initialResponse(params);

        // connection is up, let's add a simple simple event
        socket.on("message", (message: any) => handleIncomingMessage(message, params));

        // Announce user has left
        socket.on("close", () => {
          handleSocketClose(params)
        });
      })
    } catch (e) {
      console.error(e)
      socket.terminate();
    }
  }
);



/**
 * Initial get request that everything hits.
 */
app.get(
  "*",
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
