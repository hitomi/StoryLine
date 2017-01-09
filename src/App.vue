<template>
  <div id="app">
    <story-board :width="storyBoard.width" :height="storyBoard.height"></story-board>
  </div>
</template>

<script>
import StoryBoard from './components/StoryBoard'
import $ from 'jquery'

export default {
  name: 'app',
  components: {
    StoryBoard
  },
  mounted () {
    window.addEventListener('resize', this.onResize)
    this.storyBoard.width = $(window).width()
    this.storyBoard.height = $(window).height()
  },
  data () {
    return {
      storyBoard: {
        width: 1400,
        height: 900
      }
    }
  },
  methods: {
    onResize (ev) {
      this.storyBoard.width = $(window).width()
      this.storyBoard.height = $(window).height()
    }
  }
}
</script>

<style>
body {
  margin: 0px;
  overflow: hidden;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
