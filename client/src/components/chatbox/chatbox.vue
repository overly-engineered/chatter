<template>
  <input
    type="text"
    v-model="message"
    @keyup.enter="send"
    placeholder="Send a message..."
    :disabled="InputDisabled"
  />
  <!-- <el-input
    @keyup.enter="send"
    type="textarea"
    :disabled="InputDisabled"
    autosize
    placeholder="Send a message..."
    v-model="message"
  ></el-input>-->
</template>

<script lang="ts">
import { Vue, Component, PropSync } from "vue-property-decorator";
import moment from "moment";
import ChatList from "./../components/chatlist/chatlist.vue";

@Component
export default class Chatbox extends Vue {
  @PropSync("sendMessage", { type: Function }) props!: Function;
  @PropSync("enabled", { type: Boolean }) inputEnabled!: Boolean;
  message: string = "";

  send() {
    this.props(this.message);
    this.message = "";
  }

  get InputDisabled() {
    return !this.inputEnabled;
  }
}
</script>

<style scoped>
input {
  resize: none;
  width: 100%;
  border-radius: 5px;
  padding: 10px 10px 10px 10px;
  height: 45px;
  border: 1px solid #dcdfe6;
}
input:disabled {
  cursor: not-allowed;
}
</style>
