<template>
  <main>
    <el-row type="flex" class="row-bg" justify="center">
      <el-col :md="18" :lg="16" :xl="14" :span="24">
        <div v-if="!error" class="search-container">
          <div class="search-box">
            <input
              v-model="search"
              type="text"
              class="search-input"
              placeholder="Search for chat..."
            />
            <span />
          </div>
          <el-button
            type="primary"
            icon="el-icon-plus"
            class="create-button"
            v-on:click="triggerModal"
          >Create chat</el-button>
        </div>
        <div v-if="loading" class="loading">Getting the chats</div>
        <div v-if="error" class="error">{{ error }}</div>
        <div v-if="chats.length">
          <div v-if="loading" class="loading">Loading...</div>
          <ChatList v-bind:chats="chats"></ChatList>
        </div>
        <div
          v-if="chats.length === 0 && !loading && !error"
        >There are no chats. Create one to get started</div>
      </el-col>
    </el-row>
    <el-dialog
      title="Create a new chat"
      :visible.sync="dialogVisible"
      width="30%"
      :before-close="hideModal"
    >
      <el-input
        type="text"
        placeholder="Enter name"
        v-model="newChatName"
        maxlength="50"
        show-word-limit
      ></el-input>
      <div class="create-button-submit">
        <el-button type="primary" icon="el-icon-plus" v-on:click="confirmCreateChat">Create chat</el-button>
      </div>
    </el-dialog>
  </main>
</template>

<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator";
import { debounce, has } from "lodash";
import ChatList from "./../components/chatlist/chatlist.vue";

interface IChat {
  createdAt: number;
  id: string;
  lastUpdatedAt: number;
  timestamp: number;
  name: string;
  totalMessages: number;
}

@Component({
  components: {
    ChatList
  }
})
export default class Home extends Vue {
  error = "";
  loading = false;
  chats = [];
  search = "";
  dialogVisible = false;
  newChatName = "";

  created() {
    this.debouncedFetch = debounce(this.debouncedFetch, 500, { leading: true });
    this.fetchData();
  }

  @Watch("search")
  onSearchChange(val: string, oldVal: string) {
    this.debouncedFetch();
  }

  debouncedFetch() {
    this.fetchData();
  }

  fetchData(): void {
    this.error = "";
    this.loading = true;
    this.chats = [];

    fetch("/chat-api/chats", {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ search: this.search })
    })
      .then(response => response.json())
      .then(data => {
        this.chats = data.chats;
        this.loading = false;
      })
      .catch(error => {
        console.error(error);
        this.loading = false;
        this.error = "Something went wrong when fetching chats";
      });
  }

  triggerModal() {
    this.dialogVisible = true;
  }

  hideModal() {
    this.dialogVisible = false;
    this.newChatName = "";
  }

  confirmCreateChat() {
    fetch(`/chat-api/chat/`, {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name: this.newChatName })
    })
      .then(response => response.json())
      .then((data: IChat) => {
        if (has(data, "createdAt")) {
          this.dialogVisible = false;
          const id = data.id;
          this.$router.push({ path: `/chat/${id}` });
        }
      })
      .catch(error => {
        console.error(error);
        this.$message({
          message: "Error Creating chat",
          type: "error"
        });
        this.dialogVisible = false;
      });
  }
}
</script>

<style scoped>
main {
  max-height: calc(100% - 78px);
  overflow: auto;
}
.loading {
  margin-top: 15px;
  text-align: center;
}
.search-container {
  margin: 30px 0px;
  display: flex;
  justify-content: space-between;
}
.container {
  flex: 1;
  max-width: 900px;
}
.search-box {
  position: relative;
  width: 80%;
}
.search-input {
  width: 100%;
  padding: 10px 5px;
  font-size: 1.2rem;
  border: 0;
  color: #4d4d4d;
  background-color: #feffff;
}
.search-input:focus {
  outline: 0;
}
.search-input ~ span:before {
  content: "";
  position: absolute;
  left: 0;
  right: 100%;
  bottom: -2px;
  background: #4d4d4d;
  height: 2px;
  -webkit-transition-property: right;
  transition-property: right;
  -webkit-transition-duration: 0.25s;
  transition-duration: 0.25s;
  -webkit-transition-timing-function: ease-out;
  transition-timing-function: ease-out;
}
.search-input:hover ~ span:before,
.search-input:focus ~ span:before {
  right: 0;
}
.create-button-submit {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}
@media screen and (max-width: 600px) {
  .create-button {
    position: absolute;
    top: -50px;
    right: 10px;
  }
  .search-box {
    width: 100%;
  }
}
</style>
