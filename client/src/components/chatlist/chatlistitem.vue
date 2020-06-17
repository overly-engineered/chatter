<template>
  <router-link :to="{path: '/chat/'+ chat.id}">
    <section class="container">
      <div class="item-header">
        <h2 class="chat-name">{{chat.name}}</h2>
        <p class="message-count" title="Total message">{{chat.totalMessages}}</p>
      </div>
      <div class="details">
        <p class="created-at">Created at: {{createdAt}}</p>
        <p class="updated-at">Last updated at: {{lastUpdatedAt}}</p>
      </div>
    </section>
  </router-link>
</template>

<script lang="ts">
import { Vue, Component, PropSync } from "vue-property-decorator";
import moment from "moment";
import ChatList from "./../components/chatlist/chatlist.vue";

@Component
export default class ChatListItem extends Vue {
  @PropSync("chat", { type: Object }) chatItem!: {
    createdAt: number;
    lastUpdatedAt: number;
  };
  created() {}
  get createdAt() {
    return moment(this.chatItem.createdAt).calendar();
  }
  get lastUpdatedAt() {
    return moment(this.chatItem.lastUpdatedAt).calendar();
  }
}
</script>

<style scoped>
.container {
  margin-bottom: 20px;
  padding: 10px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  border-bottom: 1px solid #b8b8b8;
}
.container:hover {
  border-bottom: 1px solid #606060;
}
.item-header {
  display: flex;
}
.details {
  text-align: right;
}
.details,
.message-count {
  font-size: 0.7rem;
}
.updated-at {
  margin-top: 0.5rem;
}
.message-count {
  padding-left: 0.2rem;
}
.chat-name {
  text-transform: capitalize;
  font-size: 2.1rem;
}
@media screen and (max-width: 500px) {
  .container {
    flex-direction: column;
  }
  .details {
    text-align: left;
    margin-top: 10px;
  }
}
</style>
