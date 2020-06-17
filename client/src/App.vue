<template>
  <div>
    <Header />
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import Header from "./sections/header.vue";
@Component({
  components: {
    Header
  }
})
export default class APP extends Vue {}
</script>

<style scoped>
section {
  display: flex;
  justify-content: center;
  flex-direction: column;
}
.loading {
  margin-top: 15px;
  text-align: center;
}
section,
.search-container {
  margin: 30px 15px 0;
  position: relative;
}
.container {
  flex: 1;
  max-width: 900px;
}
.search-container input {
  width: 100%;
  padding: 10px 5px;
  font-size: 1.2rem;
  border: 0;
  color: #4d4d4d;
  background-color: #feffff;
}
.search-container input:focus {
  outline: 0;
}
.search-container span:before,
.search-container span:before {
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
.search-container input:hover ~ span:before,
.search-container input:focus ~ span:before {
  right: 0;
}
</style>
