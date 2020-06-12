import Vue from "vue";
import VueRouter from "vue-router";
Vue.use(VueRouter)

import Header from "./sections/header.vue";


import Home from "./pages/home.vue";
import Chat from "./pages/chat.vue"
const routes = [
  { path: '/', component: Home },
  { path: "/chat/:chatId", component: Chat }
]


const router = new VueRouter({
  routes,
  mode: "history"
})

const v = new Vue({
  el: "#app",
  template: `<div>
    <Header></Header>
    <router-view></router-view>
  </div>`,
  components: { Header },
  router
});
