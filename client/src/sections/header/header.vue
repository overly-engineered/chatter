<template>
  <div>
    <div class="greeting">Hello {{ name }}{{ exclamationMarks }}</div>
    <button @click="decrement">-</button>
    <button @click="increment">+</button>
    <button @click="getChats">Get Chats</button>
    <button @click="getChat">Get Chat</button>
    <button @click="createChat">Create Chat</button>
    <button @click="deleteChat">Delete Chat</button>
    <button @click="socketConnect">Socket connect</button>
    <button @click="sendMessage">Send Message</button>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
let socket;
export default Vue.extend({
  props: ["name", "initialEnthusiasm"],
  data() {
    return {
      enthusiasm: this.initialEnthusiasm
    };
  },
  methods: {
    increment() {
      this.enthusiasm++;
    },
    decrement() {
      if (this.enthusiasm > 1) {
        this.enthusiasm--;
      }
    },
    getChats() {
      fetch("/chats")
        .then(response => response.json())
        .then(data => {
          console.log(data);
        })
        .catch(error => {
          console.error(error);
        });
    },
    getChat() {
      fetch("/chat/1")
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
      fetch(`/chat/`, {
        method: "post",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: "chat " + this.enthusiasm })
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
        "ws://localhost:3000/ws?chat=76b382fa-741d-4b50-a910-0adab59fc078"
      );
      socket.addEventListener("message", function(event) {
        console.log("Message from server ", event.data);
      });
    },
    sendMessage() {
      if (socket) {
        socket.send("MESSAGE");
      }
    }
  },
  computed: {
    exclamationMarks(): string {
      return Array(this.enthusiasm + 1).join("!");
    }
  }
});
</script>

<style>
.greeting {
  font-size: 20px;
}
</style>
