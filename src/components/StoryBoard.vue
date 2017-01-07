<template lang="pug">
  #story-board(:class="{moving: layout.isMoving}", :style="{width: width + 'px', height: height + 'px'}")
    svg#line-background
    #draw-area(@scroll="onscroll")
      button(@click="addnew()") +
      text-card(
        v-for="story in stories",
        :story="story",
        @startLink="portline",
        @titleMouseEnter="titleMouseEnter",
        @titleMouseLeave="titleMouseLeave",
        @enterLink="enterLink",
        @leaveLink="leaveLink"
      ) {{story.msg}}
</template>
<script>
  import TextCard from './cards/TextCard.vue'
  import SVG from 'svgjs'
  import $ from 'jquery'

  export default {
    props: ['width', 'height'],
    components: {
      TextCard
    },
    data () {
      return {
        // Temporary
        layout: {
          isMoving: false,
          // Moving
          movingObject: {
            // Moving flag
            status: 0,
            // Temporary position
            pos: {
              x: 0,
              y: 0
            },
            // Element reference
            elRef: null,
            // Vue reference
            vRef: null
          }
        },
        // Drawing
        background: {
          // Drawing flag
          isDrawing: false,
          // SVG Canvas
          svgCanvas: null,
          temp: {
            drawing: false,
            group: null,
            line: null,
            startSquare: null,
            endSquare: null
          }
        },
        idinc: 1003,
        tempLine: null,
        drawing: false,
        tempRect: null,
        offset: null,
        startPos: [],
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
            left: 1000 + 'px',
            top: 400 + 'px'
          },
          param: {
            text: '今天天气不错。'
          }
        }]
      }
    },
    watch: {
      width (val) {
        console.log(val)
      },
      height (val) {
        console.log(val)
      }
    },
    mounted () {
      // Register Global Mouse Event
      window.addEventListener('mouseup', this.mouseup)
      window.addEventListener('mousemove', this.onMouseMove)
      // Create SVG Canvas
      this.background.svgCanvas = SVG('line-background').size('100%', '100%')
    },
    methods: {
      titleMouseEnter (ev, vRef) {
        this.layout.isMoving = true
      },
      titleMouseLeave (ev, vRef) {
        this.layout.isMoving = false
      },
      enterLink (ev, vRef, type) {
        this.layout.isMoving = true
      },
      leaveLink (ev, vRef, type) {
        if (!this.drawing) this.layout.isMoving = false
      },
      startLink (ev, vRef, type) {
        // Start Link Object
      },
      portline (ev, vtarget) {
        let $target = $(ev.target)
        this.offset = $('#draw-area').offset()
        let startPosition = $target.offset()
        let scrollX = $('#draw-area').prop('scrollLeft')
        let scrollY = $('#draw-area').prop('scrollTop')
        this.startPos = [scrollX + startPosition.left - this.offset.left + 8, scrollY + startPosition.top - this.offset.top + 8]
        this.tempLine = this.background.svgCanvas.polyline([this.startPos]).fill('none').stroke({ color: '#0099af', width: 8, linejoin: 'bevel' })
        this.background.svgCanvas.rect(16, 16).cx(this.startPos[0]).cy(this.startPos[1]).radius(4).fill('#0099af')
        this.tempRect = this.background.svgCanvas.rect(16, 16).cx(this.startPos[0]).cy(this.startPos[1]).radius(4).fill('#0099af')
        this.drawing = true
      },
      onscroll (ev) {
        console.log(ev)
        let target = ev.target
        let scrollLeft = target.scrollLeft
        let scrollTop = target.scrollTop
        this.background.svgCanvas.viewbox({ x: scrollLeft, y: scrollTop, width: this.width, height: this.height })
      },
      onMouseMove (ev) {
        // Return if moving flag is false
        // if (!this.layout.isMoving) return
        if (this.drawing && this.tempLine != null) {
          let scrollX = $('#draw-area').prop('scrollLeft')
          let scrollY = $('#draw-area').prop('scrollTop')
          let xOffset = this.offset.left
          let yOffset = this.offset.top
          let x1 = this.startPos[0]
          let y1 = this.startPos[1]
          let x2 = scrollX + ev.clientX - xOffset
          let y2 = scrollY + ev.clientY - yOffset
          console.log(x1, y1)
          this.tempLine.plot(this.calcuPolyline(x1, y1, x2, y2, 'off'))
          this.tempRect.cx(x2).cy(y2)
        }
      },
      calcuPolyline (x1, y1, x2, y2, type) {
        // Direction
        let linePrefix = 40
        let fix = type === 'in' ? -1 : 1
        x1 += fix * linePrefix
        x2 += -fix * linePrefix
        // Calcu difference
        let xDiff = x1 - x2
        let yDiff = y1 - y2
        // Calcu line length
        let xHalf = xDiff / 2
        let yHalf = yDiff / 2
        let len = Math.min(Math.abs(xHalf), Math.abs(yHalf))
        // Mark axis
        let yAxis = yDiff > 0 ? -1 : 1
        let xAxis = xDiff > 0 ? -1 : 1
        // Return positions
        return [
          [x1 + -fix * linePrefix, y1],
          [x1, y1],
          [x1 + (len * xAxis), y1 + (len * yAxis)],
          [x2 + (len * -xAxis), y2 + (len * -yAxis)],
          [x2, y2],
          [x2 + fix * linePrefix, y2]
        ]
      }
    }
  }

</script>
<style scoped>
  #story-board {
    background: url(../assets/grid.png);
    overflow: hidden;
    position: relative;
  }
  #story-board.moving {
    cursor: move;
    -webkit-user-drag: none; 
    user-select: none;
  }
  #draw-area {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0.8;
    overflow: scroll;
  }
  h1 {
    position: absolute;
  }
</style>
