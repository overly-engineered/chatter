<template>
  <section>
    <div class="container">
      <ChatListItem v-for="chat in chats" v-bind:chat="chat" v-bind:key="chat.id"></ChatListItem>
    </div>
  </section>
</template>

<script lang="ts">
import ChatListItem from "./chatlistitem.vue";
export default {
  components: {
    ChatListItem
  },
  props: ["chats"]
};
</script>

<style scoped>
.container {
  width: 100%;
}
</style>
