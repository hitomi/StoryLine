<template>
  <div id="app">
    <story-board :width="storyBoard.width" :height="storyBoard.height"></story-board>
    <button @click="storyBoard.height += 50">Size</button>
  </div>
</template>

<script>
import StoryBoard from './components/StoryBoard'

export default {
  name: 'app',
  components: {
    StoryBoard
  },
  data () {
    return {
      storyBoard: {
        width: 1000,
        height: 600
      }
    }
  }
}
</script>

<style>
body {
  margin: 40px;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
