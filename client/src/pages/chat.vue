<template>
  <el-row type="flex" class="row-bg chat-page" justify="center">
    <el-col :span="18">
      <section class="chat-page-container">
        <h2 class="chat-name">{{name}}</h2>
        <div v-if="name" class="message-area">
          <div class="message-list" ref="messageList" v-on:scroll.passive="onScroll">
            <div v-if="loading" class="loading">Entering the chat</div>
            <div
              v-if="messages.length === 0"
              class="empty class"
            >No messages in this chat. Start the conversation</div>
            <ChatMessage
              v-for="message in messages"
              v-bind:message="message"
              v-bind:key="message.id"
            ></ChatMessage>
          </div>
          <ChatBox :sendMessage="sendMessage" v-bind:enabled="enabled"></ChatBox>
        </div>
      </section>
    </el-col>
  </el-row>
</template>

<script lang="ts">
import { Vue, Component, Watch, PropSync } from "vue-property-decorator";
import ChatBox from "./../components/chatbox/chatbox.vue";
import ChatMessage from "./../components/message/message.vue";

interface IMessage {
  username: string;
  message: string;
  timestamp: number;
  color: string;
}

@Component({
  components: {
    ChatBox,
    ChatMessage
  }
})
export default class Chat extends Vue {
  loading = false;
  name = "";
  socket!: WebSocket;
  messages: IMessage[] = [];
  customScrollPos = false;
  enabled = true;

  @PropSync("chat", { type: Object }) props!: {
    chatId: number;
  };
  get chatId() {
    return this.$route.params.chatId;
  }

  @Watch("messages")
  onSearchChange(val: Array<IMessage>, oldVal: Array<IMessage>) {
    if (!this.customScrollPos) {
      this.$nextTick(() => {
        const messageList = this.$refs.messageList as HTMLElement;
        messageList.scrollTop = messageList.scrollHeight;
      });
    }
  }

  onScroll(e: MouseWheelEvent) {
    const target = e.target as HTMLElement;
    if (target) {
      if (target.scrollHeight - target.scrollTop > target.clientHeight + 50) {
        this.customScrollPos = true;
      } else {
        this.customScrollPos = false;
      }
    }
  }

  disconnect() {
    this.socket.close();
  }

  createSocket() {
    try {
      this.socket = new WebSocket(
        `ws://localhost:3000/chat-api/connection?chat=${this.$route.params.chatId}`
      );
      this.enabled = true;
      this.socket.addEventListener("message", ({ data }) => {
        try {
          const {
            prevMessages,
            message
          }: {
            prevMessages: Array<IMessage>;
            message: IMessage;
          } = JSON.parse(data);
          this.loading = false;
          if (prevMessages) {
            this.messages = prevMessages;
          }
          if (message) {
            this.messages.push(message);
          }
        } catch (e) {
          console.error(e);
        }
      });
      this.socket.onclose = event => {
        this.$confirm(
          "Disconnected from server. Attempt Reconnect?",
          "Warning",
          {
            confirmButtonText: "Reconnect",
            cancelButtonText: "Cancel",
            type: "error"
          }
        )
          .then(() => {
            this.createSocket();
          })
          .catch(() => {
            this.$message({
              message: "Disconnected from server",
              type: "error"
            });
          });
        this.enabled = false;
      };
    } catch (error) {
      console.error(error);
    }
  }

  async created() {
    this.loading = true;
    fetch(`/chat-api/chat/${this.chatId}`)
      .then(response => response.json())
      .then(data => {
        this.name = data.name;
        this.createSocket();
      })
      .catch(error => {
        console.error(error);
      });
  }

  async sendMessage(newMessage: string) {
    if (this.socket) {
      this.socket.send(newMessage);
    }
  }
}
</script>

<style scoped>
.chat-page {
  height: calc(100% - 85px);
}
.chat-page-container {
  height: calc(100% - 100px);
  padding-top: 20px;
}
.chat-name {
  text-transform: capitalize;
  font-size: 4rem;
  font-weight: 900;
  color: #b5b5b5;
  position: absolute;
  bottom: 0;
  left: 0;
}
.message-area {
  padding: 15px;
  height: 100%;
  box-shadow: 0 0 20px -5px rgba(0, 0, 0, 0.1);
  display: block;
  overflow: hidden;
}
.message-list {
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  width: 100%;
  height: calc(100% - 45px);
  overflow: auto;
  padding: 15px 12px;
  margin-bottom: 10px;
}
</style>
