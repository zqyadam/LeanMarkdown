<template>
  <div id="#app">
    <router-view></router-view>
  </div>
</template>
<script>
// import store from 'renderer/vuex/store'
export default {
  // store
}
</script>
<style>
@import url(https://fonts.googleapis.com/css?family=Lato:300);
* {
  margin: 0;
  padding: 0;
}

html,
body {
  height: 100%;
  width:100%;
}

body {
  align-items: center;
  background: radial-gradient( ellipse at center, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 1) 100%);  /*rgba(229, 229, 229, .85)*/
  background-position: center;
  display: flex;
  font-family: Lato, Helvetica, sans-serif;
  justify-content: center;
 
}
</style>
<style scoped>
div {
  width: 100%;
  height: 100%;
}
</style>
