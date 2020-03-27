# chatter

## Requirements

- Mongodb@4.2.3
- Node >=v10.19.0

## Setup

### Dependencies

```shell
npm i
```

### Mongo setup

Ensure Mongodb is running and exposed on port 37017

<details>
  <summary>How to run mongo locally</summary>

Start with:

```shell
$ mongod --config /usr/local/etc/mongod.conf --fork --port 37017
```

Kill with:

```shell
$ ps aux | grep mongo
$ kill <pid>
```

---

</details>

Create a database called chats

```shell
$ use chats
```

Create the chat_registry collection

```shell
$ db.createCollection("chat_registry");
```

Create the chats collection

```shell
$ db.createCollection("chats")
```

---

(Optional) Create your first chat

````
Insert the registry record into the registry collection
```shell
$ db.chat_registry.insertOne({type: "chat", name: "My first chat", createdAt: new Date(), id: 1})
````

Create the chat record in the chats collection

```shell
$ db.chats.insertOne({id: 1, messages: []})
```

---

## Running

In development mode

```shell
$ npm run start:dev
```

Build for production

```
$ npm run dist
```

Run in production

```
$ npm run start
```

---

## Testing
