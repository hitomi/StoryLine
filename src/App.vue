<template>
  <div id="app">
    <story-board style="width: 1000px; height: 600px;"></story-board>
  </div>
</template>

<script>
import StoryBoard from './components/StoryBoard'

export default {
  name: 'app',
  components: {
    StoryBoard
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
