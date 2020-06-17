<template>
  <section class="message" :style="colourStyle">
    <p class="message-title">
      <span class="user">{{message.user}}</span>
      <span class="timestamp">{{timestamp}}</span>
    </p>
    <p class="message-text">{{message.message}}</p>
  </section>
</template>

<script lang="ts">
import { Vue, Component, PropSync } from "vue-property-decorator";
import moment from "moment";

@Component
export default class ChatMessages extends Vue {
  @PropSync("message", { type: Object }) messageItem!: {
    timestamp: string;
    color: string;
  };

  get timestamp() {
    const stamp = moment(this.messageItem.timestamp);
    const date = stamp.calendar();
    return date;
  }

  get colourStyle() {
    return {
      "border-left": `3px solid ${this.messageItem.color}`
    };
  }
}
</script>

<style scoped>
.message {
  width: 100%;
  padding-left: 10px;
}
.message:first-child {
  margin-top: auto;
}
.message:not(:last-child) {
  margin-bottom: 10px;
}
.message-title {
  margin-bottom: 5px;
}
.user {
  font-size: 1.1rem;
  font-weight: bold;
  margin-right: 5px;
}
.timestamp {
  font-size: 0.8rem;
  margin-bottom: 10px;
  text-transform: lowercase;
  color: #656565;
}
.message-text {
  color: #3e3737;
  font-size: 0.9rem;
}
</style>
