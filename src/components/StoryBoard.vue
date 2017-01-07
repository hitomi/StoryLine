<template>
  <div id="story-board"
    :class="{moving: isMoving}"
    >
    <svg id="line-background"></svg>
    <div 
      id="draw-area"
      @scroll="onscroll">
      <button @click="addnew()">+</button>
      <text-card
        v-for="story in stories"
        :story="story"
        @mouseenter="mouseenter"
        @mousedown="mousedown"
        @mouseleave="mouseleave"
        @portline="portline"
        @portlineend="portlineend">
        {{msg}}
      </text-card>
    </div>
  </div>
</template>
<style scoped>
  #story-board {
    background: url(../assets/grid.png);
    overflow: hidden;
    position: relative;
    -webkit-user-drag: none; 
    user-select: none;
  }
  #story-board.moving {
    cursor: move;
  }
  #draw-area {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: scroll;
  }
  h1 {
    position: absolute;
  }
</style>
<script>
  import TextCard from './cards/TextCard.vue'
  import SVG from 'svgjs'
  import $ from 'jquery'

  export default {
    data () {
      return {
        msg: 'hello vue',
        log: '',
        h1style: {
          left: 0,
          top: 0,
          transition: 'initial'
        },
        h1offset: {
          x: 0,
          y: 0,
          tempX: 0,
          tempY: 0
        },
        isMoving: false,
        mouseEv: null,
        svgCanvas: null,
        tempLine: null,
        drawing: false,
        startPos: null,
        mouseTarget: null,
        idinc: 1003,
        stories: [{
          id: 1001,
          type: 'text',
          ports: {
            in: {
              default: []
            },
            out: {
              default: []
            }
          },
          layout: {
            left: 100 + 'px',
            top: 100 + 'px'
          },
          param: {
            text: '真是风和日丽的一天。'
          }
        }, {
          id: 1002,
          type: 'text',
          ports: {
            in: {
              default: []
            },
            out: {
              default: []
            }
          },
          layout: {
            left: 200 + 'px',
            top: 400 + 'px'
          },
          param: {
            text: '今天天气不错。'
          }
        }]
      }
    },
    components: {
      TextCard
    },
    mounted () {
      window.addEventListener('mouseup', this.mouseup)
      window.addEventListener('mousemove', this.mousemove)
      this.svgCanvas = SVG('line-background').size('100%', '100%')
      this.svgCanvas.rect(2000, 100).attr({
        fill: this.svgCanvas.gradient('linear', function (stop) {
          stop.at(0, '#333')
          stop.at(1, '#fff')
        })
      })
    },
    beforeDestoryed () {
      console.log('beforeDestoryed')
    },
    methods: {
      mouseenter (ev) {
        this.isMoving = true
      },
      mouseleave (ev) {
        this.isMoving = false
      },
      addnew () {
        this.stories.push({
          id: this.idinc++,
          type: 'text',
          ports: {
            in: {
              default: []
            },
            out: {
              default: []
            }
          },
          layout: {
            left: (Math.ceil(Math.random() * 1000)) + 'px',
            top: (Math.ceil(Math.random() * 600)) + 'px'
          },
          param: {
            text: '今天天气不错。'
          }
        })
      },
      portline (ev, vtarget) {
        let $target = $(ev.target)
        let startPosition = $target.offset()
        this.startPos = [startPosition.left, startPosition.top]
        this.tempLine = this.svgCanvas.polyline([this.startPos]).fill('none').stroke({ color: '#0099af', width: 8, linejoin: 'bevel' })
        // console.log(startPosition, this.startPos)
        this.drawing = true
      },
      onscroll (ev) {
        let target = ev.target
        let scrollLeft = target.scrollLeft
        let scrollTop = target.scrollTop
        this.svgCanvas.viewbox({ x: scrollLeft, y: scrollTop, width: 1000, height: 600 })
      },
      mousedown (ev, vtarget) {
        this.mouseEv = ev
        this.mouseTarget = vtarget
        this.h1offset.x = parseInt(vtarget.layout.left.replace('px', ''))
        this.h1offset.y = parseInt(vtarget.layout.top.replace('px', ''))
        this.h1style.transition = 'initial'
        console.log('mousedown')
      },
      mouseup (ev) {
        if (this.h1offset.tempX < 0) {
          this.h1offset.tempX = 0
          this.h1style.left = this.h1offset.tempX + 'px'
        }
        if (this.h1offset.tempY < 0) {
          this.h1offset.tempY = 0
          this.h1style.top = this.h1offset.tempY + 'px'
        }
        this.h1style.transition = 'left .5s ease, top .5s ease'
        this.h1offset.x = this.h1offset.tempX
        this.h1offset.y = this.h1offset.tempY
        this.mouseEv = null
        this.drawing = false
        if (this.tempLine != null) {
          this.tempLine.remove()
          this.tempLine = null
        }
        console.log('up', ev)
      },
      portlineend (ev, vtarget) {
        // 123
        console.log('upout', ev)
        this.drawing = false
        if (this.tempLine != null) {
          this.tempLine = null
        }
        ev.stopPropagation()
      },
      mousemove (ev) {
        if (this.drawing && this.tempLine != null) {
          let scrollX = $('#draw-area').prop('scrollLeft')
          let scrollY = $('#draw-area').prop('scrollTop')
          let x1 = scrollX + this.startPos[0] + 40
          let y1 = scrollY + this.startPos[1]
          let x2 = ev.clientX - 40
          let y2 = ev.clientY
          let xDiff = y1 - y2
          let yDiff = x1 - x2
          let xHalf = xDiff / 2
          let yHalf = yDiff / 2
          let len = Math.min(Math.abs(xHalf), Math.abs(yHalf))
          let yAxis = xDiff > 0 ? -1 : 1
          let xAxis = yDiff > 0 ? -1 : 1
          this.tempLine.plot([
            [x1 - 40, y1],
            [x1, y1],
            [x1 + (len * xAxis), y1 + (len * yAxis)],
            [x2 + (len * -xAxis), y2 + (len * -yAxis)],
            [x2, y2],
            [x2 + 40, y2]
          ])
        }
        if (this.mouseEv == null) return
        let originX = this.mouseEv.clientX
        let originY = this.mouseEv.clientY
        let moveX = ev.clientX - originX
        let moveY = ev.clientY - originY
        this.h1offset.tempX = this.h1offset.x + moveX
        this.h1offset.tempY = this.h1offset.y + moveY
        this.mouseTarget.layout.left = this.h1offset.tempX + 'px'
        this.mouseTarget.layout.top = this.h1offset.tempY + 'px'
        // if (this.mouseFlag)
        // console.log('move', ev)
      }
    }
  }

</script>
