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
        width: 1400,
        height: 900
      }
    }
  }
}
</script>

<style>
body {
  margin: 0px;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
