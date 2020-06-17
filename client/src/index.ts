import Vue from "vue";
import VueRouter from "vue-router";
Vue.use(VueRouter)

import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(Element);

import App from "./App.vue";
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
  </div>`,
  router,
  render: h => h(App)
});
