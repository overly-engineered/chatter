import Vue from "vue";
import HelloComponent from "./sections/header/header.vue";

const v = new Vue({
  el: "#app",
  template: `
    <div>
        Name: <input v-model="name" type="text">
        <hello-component :name="name" :initialEnthusiasm="5" />
        Hello
    </div>
    `,
  data: { name: "World" },
  components: {
    HelloComponent
  }
});
