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

Connect via cli

```shell
$ mongo --port 37017
```

Create a database called chats

```shell
> use chats
```

Create the chat_registry collection

```shell
> db.createCollection("chat_registry");
```

Create the chats collection

```shell
> db.createCollection("chats")
```

---

## Running

Use the node version specified in .nvmrc

```shell
$ nvm use
```

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
