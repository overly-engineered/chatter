<template>
  <div>
    <button @click="decrement">-</button>
    <button @click="increment">+</button>
    <button @click="getChats">Get Chats</button>
    <button @click="getChat">Get Chat</button>
    <button @click="createChat">Create Chat</button>
    <button @click="deleteChat">Delete Chat</button>
    <button @click="socketConnect">Socket connect</button>
    <button @click="socketClose">Socket close</button>
    <button @click="sendMessage">Send Message</button>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
//@ts-ignore
let socket;
export default Vue.extend({
  methods: {
    getChats() {
      fetch("/chat-api/chats")
        .then(response => response.json())
        .then(data => {
          console.log(data);
        })
        .catch(error => {
          console.error(error);
        });
    },
    getChat() {
      fetch("/chat-api/chat/1")
        .then(response => response.json())
        .then(data => {
          console.log(data);
        })
        .catch(error => {
          console.error(error);
        });
    },
    deleteChat() {
      fetch("/chat/2", { method: "delete" })
        .then(response => console.log(response))
        .catch(error => {
          console.error(error);
        });
    },
    createChat() {
      fetch(`/chat-api/chat/`, {
        method: "post",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: "chat abc" })
      })
        .then(response => response.json())
        .then(data => {
          console.log(data);
        })
        .catch(error => {
          console.error(error);
        });
    },
    socketConnect() {
      socket = new WebSocket(
        "ws://localhost:3000/chat-api/connection?chat=76b382fa-741d-4b50-a910-0adab59fc078"
      );
      socket.addEventListener("message", function(event) {
        console.log("Message from server ", JSON.parse(event.data));
      });
    },
    sendMessage() {
      //@ts-ignore
      if (socket) {
        //@ts-ignore
        socket.send("MESSAGE");
      }
    },
    socketClose() {
      //@ts-ignore
      socket.close();
    }
  }
});
</script>

<style>
.greeting {
  font-size: 20px;
}
</style>
