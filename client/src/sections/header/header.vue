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
export default Vue.extend({
    props: ['name', 'initialEnthusiasm'],
    data() {
        return {
            enthusiasm: this.initialEnthusiasm,
        }
    },
    methods: {
        increment() { this.enthusiasm++; },
        decrement() {
            if (this.enthusiasm > 1) {
                this.enthusiasm--;
            }
        },
    },
    computed: {
        exclamationMarks(): string {
            return Array(this.enthusiasm + 1).join('!');
        }
    }
});
</script>

<style>
.greeting {
    font-size: 20px;
}
</style>
