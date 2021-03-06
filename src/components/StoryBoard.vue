<template lang="pug">
  #story-board(:class="{moving: layout.isMoving}", :style="{width: width + 'px', height: height + 'px'}")
    svg#line-background
    #draw-area(@scroll="onscroll")
      .toolbar
        button(@click="addNewStory()") +
        button(@click="runStory()") Play
        button(@click="saveStory()") Save
        button(@click="loadStory()") Load
        button(@click="exportStories()") Export
        button(@click="togglePanel()") Hide Output: {{ hideOutputPanel }}
        textarea.output(v-model='output', :class='{ hide: hideOutputPanel }')
      text-card(
        v-for="story in stories",
        :story="story",
        :story-id="story.id"
        @enterLink="enterLink",
        @leaveLink="leaveLink",
        @startLink="startLink",
        @endLink="endLink",
        @titleMouseEnter="titleMouseEnter",
        @titleMouseLeave="titleMouseLeave",
        @titleMouseDown="titleMouseDown"
      ) {{story.msg}}
      .padding-canvas(:style="{height: layout.padding.height + 'px', width: layout.padding.width + 'px', pointerEvents: 'none'}")
</template>
<script>
  import TextCard from './cards/TextCard.vue'
  import SVG from 'svg.js'
  import $ from 'jquery'
  import _ from 'lodash'
  import Interpreter from '../interpreter'
  import localforage from 'localforage'

  export default {
    props: ['width', 'height'],
    components: {
      TextCard
    },
    data () {
      return {
        output: '',
        hideOutputPanel: true,
        // Temporary
        layout: {
          isMoving: false,
          // Moving
          movingObject: {
            // Moving flag
            status: 0,
            // Temporary position
            pos: {
              tempX: 0,
              tempY: 0,
              x: 0,
              y: 0
            },
            // Element reference
            evRef: null,
            // Vue reference
            vRef: null
          },
          // Padding
          padding: {
            width: this.width,
            height: this.height
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
            endSquare: null,
            startPos: null,
            offset: null,
            linemode: null,
            port: null,
            evRef: null,
            vRef: null
          }
        },
        idinc: 2,
        stories: [{
          id: 0,
          type: 'base.main',
          alias: '开始',
          layout: {
            left: 100 + 'px',
            top: 100 + 'px',
            width: 80 + 'px'
          },
          ports: {
            in: {},
            out: {
              content: {
                name: 'content',
                alias: 'out',
                select: 'random',
                links: []
              }
            }
          },
          params: {
            'text': '【开始】'
          }
        }, {
          id: 1,
          type: 'base.log',
          alias: '结束',
          layout: {
            left: 500 + 'px',
            top: 100 + 'px',
            width: 80 + 'px'
          },
          ports: {
            in: {
              content: {
                name: 'content',
                alias: 'in',
                select: 'random',
                links: []
              }
            },
            out: {}
          },
          params: {
            text: '【结束】'
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
      this.drawLines()
    },
    methods: {
      titleMouseEnter (ev, vRef) {
        this.layout.isMoving = true
      },
      titleMouseLeave (ev, vRef) {
        if (this.layout.movingObject.status === 0 && this.background.temp.drawing === false) this.layout.isMoving = false
      },
      titleMouseDown (ev, vRef) {
        this.layout.movingObject.evRef = ev
        this.layout.movingObject.vRef = vRef
        this.layout.movingObject.pos.x = parseInt(vRef.layout.left.replace('px', ''))
        this.layout.movingObject.pos.y = parseInt(vRef.layout.top.replace('px', ''))
        this.layout.movingObject.vRef.layout.transition = 'initial'
        this.layout.movingObject.vRef.layout.boxShadow = '0 0 12px 1px #9ad6ba'
        this.layout.movingObject.status = 1
      },
      enterLink (ev, vRef, type) {
        this.layout.isMoving = true
      },
      leaveLink (ev, vRef, type) {
        if (this.layout.movingObject.status === 0 && this.background.temp.drawing === false) this.layout.isMoving = false
      },
      startLink (ev, vRef, type) {
        // Start Link Object
        let $target = $(ev.target)
        // $target.addClass('active')
        this.background.temp.offset = $('#draw-area').offset()
        let startPosition = $target.offset()
        let scrollX = $('#draw-area').prop('scrollLeft')
        let scrollY = $('#draw-area').prop('scrollTop')
        this.background.temp.startPos = {
          x: scrollX + startPosition.left - this.background.temp.offset.left + 8,
          y: scrollY + startPosition.top - this.background.temp.offset.top + 8
        }
        $target.addClass('active')
        this.background.temp.linemode = type
        this.background.temp.port = $target.attr('story-name')
        this.background.temp.vRef = vRef
        this.background.temp.evRef = ev
        this.background.temp.group = this.background.svgCanvas.group().stroke({ color: '#0099af', width: 8, linejoin: 'bevel' }).fill('#0099af')
        // let tempGroup = this.background.temp.group
        // tempGroup.dblclick((ev) => {
        //   tempGroup.stroke({ color: '#af0e00' }).fill('#af0e00')
        // })
        this.background.temp.line = this.background.temp.group.polyline([[this.background.temp.startPos.x, this.background.temp.startPos.y]]).fill('none')
        this.background.temp.startSquare = this.background.temp.group.rect(16, 16).cx(this.background.temp.startPos.x).cy(this.background.temp.startPos.y).radius(4).stroke({ width: 0 })
        this.background.temp.endSquare = this.background.temp.group.rect(16, 16).cx(this.background.temp.startPos.x).cy(this.background.temp.startPos.y).radius(4).stroke({ width: 0 })
        this.background.temp.drawing = true
      },
      endLink (ev, vRef, type) {
        if (type !== this.background.temp.linemode && vRef !== this.background.temp.vRef) {
          ev.stopPropagation()
          let $target = $(ev.target)
          let endPosition = $target.offset()
          let scrollX = $('#draw-area').prop('scrollLeft')
          let scrollY = $('#draw-area').prop('scrollTop')
          let xOffset = this.background.temp.offset.left
          let yOffset = this.background.temp.offset.top
          let x1 = this.background.temp.startPos.x
          let y1 = this.background.temp.startPos.y
          let x2 = scrollX + endPosition.left - xOffset + 8
          let y2 = scrollY + endPosition.top - yOffset + 8
          this.background.temp.line.plot(this.calcuPolyline(x1, y1, x2, y2, this.background.temp.linemode))
          this.background.temp.endSquare.cx(x2).cy(y2)
          this.background.temp.drawing = false
          this.layout.isMoving = false
          // Add to data
          let startPort = this.background.temp.port
          let originVRef = this.background.temp.vRef
          if (_.findIndex(originVRef.ports.out[startPort].links, o => o.id === vRef.id) > -1) {
            this.cleanTempLine()
            return
          }
          let outObj = { id: vRef.id, port: $(this.background.temp.evRef.target).attr('story-name'), _line: {} }
          let inObj = { id: originVRef.id, port: startPort, _line: {} }
          inObj._line.group = outObj._line.group = this.background.temp.group
          inObj._line.line = outObj._line.line = this.background.temp.line
          inObj._line.startSquare = outObj._line.startSquare = this.background.temp.startSquare
          inObj._line.endSquare = outObj._line.endSquare = this.background.temp.endSquare
          originVRef.ports.out[startPort].links.push(outObj)
          vRef.ports.in[$(this.background.temp.evRef.target).attr('story-name')].links.push(inObj)
          // copy to in

          // set null
          this.background.temp.group = null
          this.background.temp.line = null
          this.background.temp.startSquare = null
          this.background.temp.endSquare = null
          // -- END
        }
      },
      onscroll (ev) {
        let target = ev.target
        let scrollLeft = target.scrollLeft
        let scrollTop = target.scrollTop
        this.background.svgCanvas.viewbox({ x: scrollLeft, y: scrollTop, width: this.width, height: this.height })
      },
      lineMove () {
        let vRef = this.layout.movingObject.vRef
        let scrollX = $('#draw-area').prop('scrollLeft')
        let scrollY = $('#draw-area').prop('scrollTop')
        _.each(vRef.ports.out, (v, k) => {
          let links = v.links
          if (!_.isArray(links)) return
          let selfEl = $(`[story-id="${vRef.id}"] .out [story-name="${k}"]`)
          _.each(links, (link) => {
            let targetEl = $(`[story-id="${link.id}"] .in [story-name="${link.port}"]`)
            let posFrom = selfEl.offset()
            let posTo = targetEl.offset()
            // map
            let x1 = scrollX + posFrom.left + 8
            let y1 = scrollY + posFrom.top + 8
            let x2 = scrollX + posTo.left + 8
            let y2 = scrollY + posTo.top + 8
            // draw
            link._line.line.plot([this.calcuPolyline(x1, y1, x2, y2, 'out')])
            link._line.startSquare.cx(x1).cy(y1)
            link._line.endSquare.cx(x2).cy(y2)
          })
        })
        _.each(vRef.ports.in, (v, k) => {
          let links = v.links
          if (!_.isArray(links)) return
          let selfEl = $(`[story-id="${vRef.id}"] .in [story-name="${k}"]`)
          _.each(links, (link) => {
            let targetEl = $(`[story-id="${link.id}"] .out [story-name="${link.port}"]`)
            let posFrom = selfEl.offset()
            let posTo = targetEl.offset()
            // map
            let x1 = scrollX + posFrom.left + 8
            let y1 = scrollY + posFrom.top + 8
            let x2 = scrollX + posTo.left + 8
            let y2 = scrollY + posTo.top + 8
            // draw
            link._line.line.plot([this.calcuPolyline(x2, y2, x1, y1, 'out')])
            link._line.startSquare.cx(x2).cy(y2)
            link._line.endSquare.cx(x1).cy(y1)
          })
        })
      },
      onMouseMove (ev) {
        // Return if moving flag is false
        if (this.layout.movingObject.status > 0) {
          let evRef = this.layout.movingObject.evRef
          let originX = evRef.clientX
          let originY = evRef.clientY
          let moveX = ev.clientX - originX
          let moveY = ev.clientY - originY
          this.layout.movingObject.pos.tempX = this.layout.movingObject.pos.x + moveX
          this.layout.movingObject.pos.tempY = this.layout.movingObject.pos.y + moveY
          this.layout.movingObject.vRef.layout.left = this.layout.movingObject.pos.tempX + 'px'
          this.layout.movingObject.vRef.layout.top = this.layout.movingObject.pos.tempY + 'px'
          if (ev.clientX + 50 > this.width) {
            this.layout.padding.width += 10
            $('#draw-area').prop('scrollLeft', $('#draw-area').prop('scrollLeft') + 10)
          }
          if (ev.clientY + 50 > this.width) {
            this.layout.padding.width += 10
            $('#draw-area').prop('scrollTop', $('#draw-area').prop('scrollTop') + 10)
          }
          // Move Lines
          this.lineMove()
        }
        if (this.background.temp.drawing) {
          let scrollX = $('#draw-area').prop('scrollLeft')
          let scrollY = $('#draw-area').prop('scrollTop')
          let xOffset = this.background.temp.offset.left
          let yOffset = this.background.temp.offset.top
          let x1 = this.background.temp.startPos.x
          let y1 = this.background.temp.startPos.y
          let x2 = scrollX + ev.clientX - xOffset
          let y2 = scrollY + ev.clientY - yOffset
          this.background.temp.line.plot(this.calcuPolyline(x1, y1, x2, y2, this.background.temp.linemode))
          this.background.temp.endSquare.cx(x2).cy(y2)
        }
      },
      mouseup (ev) {
        if (this.layout.movingObject.status > 0) {
          if (this.layout.movingObject.pos.tempX < 0) {
            this.layout.movingObject.pos.tempX = 0
            this.layout.movingObject.vRef.layout.left = this.layout.movingObject.pos.tempX + 'px'
          }
          if (this.layout.movingObject.pos.tempY < 0) {
            this.layout.movingObject.pos.tempY = 0
            this.layout.movingObject.vRef.layout.top = this.layout.movingObject.pos.tempY + 'px'
          }
          this.layout.movingObject.vRef.layout.transition = 'left .5s ease, top .5s ease'
          this.layout.movingObject.pos.x = this.layout.movingObject.pos.tempX
          this.layout.movingObject.pos.y = this.layout.movingObject.pos.tempY
          this.lineMove()
          this.layout.movingObject.vRef.layout.boxShadow = 'none'
          this.layout.movingObject.evRef = null
          this.layout.movingObject.vRef = null
          this.layout.isMoving = false
          this.layout.movingObject.status = 0
        }
        // line mode
        if (this.background.temp.drawing) {
          this.cleanTempLine()
          let $originTarget = $(this.background.temp.evRef.target)
          $originTarget.removeClass('active')
          this.background.temp.drawing = false
          this.layout.isMoving = false
        }
      },
      addNewStory () {
        let scrollX = $('#draw-area').prop('scrollLeft')
        let scrollY = $('#draw-area').prop('scrollTop')
        let story = {
          id: this.idinc++,
          type: 'base.text',
          layout: {
            left: scrollX + (this.width / 4) + Math.floor(Math.random() * this.width / 2) + 'px',
            top: scrollY + (this.height / 4) + Math.floor(Math.random() * this.height / 2) + 'px'
          },
          ports: {
            in: {
              content: {
                name: 'content',
                alias: 'in',
                select: 'random',
                links: []
              }
            },
            out: {
              content: {
                name: 'content',
                alias: 'out',
                select: 'random',
                links: []
              }
            }
          },
          params: {
            text: '双击内容进入编辑模式。'
          }
        }
        this.stories.push(story)
      },
      cleanTempLine () {
        this.background.temp.group.remove()
        this.background.temp.group = null
        this.background.temp.line = null
        this.background.temp.startSquare = null
        this.background.temp.endSquare = null
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
      },
      drawLines () {
        if (this.background.svgCanvas !== null) this.background.svgCanvas.clear()
        this.background.svgCanvas = SVG('line-background').size('100%', '100%')
        // Draw Lines
        _.each(this.stories, (story) => {
          _.each(story.ports.out, (v, k) => {
            let links = v.links
            if (!_.isArray(links)) return
            let selfEl = $(`[story-id="${story.id}"] .out [story-name="${k}"]`)
            _.each(links, (link) => {
              let targetEl = $(`[story-id="${link.id}"] .in [story-name="${link.port}"]`)
              let posFrom = selfEl.offset()
              let posTo = targetEl.offset()
              // map
              let x1 = posFrom.left + 8
              let y1 = posFrom.top + 8
              let x2 = posTo.left + 8
              let y2 = posTo.top + 8
              // draw
              link._line = {}
              link._line.group = this.background.svgCanvas.group().stroke({ color: '#0099af', width: 8, linejoin: 'bevel' }).fill('#0099af')
              link._line.line = link._line.group.polyline([this.calcuPolyline(x1, y1, x2, y2, 'out')]).fill('none')
              link._line.startSquare = link._line.group.rect(16, 16).cx(x1).cy(y1).radius(4).fill('#0099af').stroke({ width: 0 })
              link._line.endSquare = link._line.group.rect(16, 16).cx(x2).cy(y2).radius(4).fill('#0099af').stroke({ width: 0 })
              // copy to in port
              let inCard = this.stories[_.findIndex(this.stories, (o) => o.id === link.id)]
              let inLinks = inCard.ports.in[link.port].links
              let inLink = inLinks[_.findIndex(inLinks, (o) => o.id === story.id)]
              inLink._line = {}
              inLink._line.group = link._line.group
              inLink._line.line = link._line.line
              inLink._line.startSquare = link._line.startSquare
              inLink._line.endSquare = link._line.endSquare
            })
          })
        })
      },
      runStory () {
        let story = new Interpreter(this.stories)
        this.output = story.run()
        this.hideOutputPanel = false
      },
      togglePanel () {
        this.hideOutputPanel = !this.hideOutputPanel
      },
      doExport () {
        let exportData = {
          idinc: this.idinc,
          stories: []
        }
        _.each(this.stories, (story) => {
          let obj = _.pick(story, ['id', 'type', 'alias'])
          obj.layout = _.pick(story.layout, ['left', 'top', 'width'])
          obj.ports = { in: {}, out: {} }
          _.each(story.ports.in, (v, k) => {
            obj.ports.in[k] = _.pick(v, ['name', 'alias', 'select'])
            obj.ports.in[k].links = []
            _.each(story.ports.in[k].links, (link) => {
              obj.ports.in[k].links.push(_.pick(link, ['id', 'port']))
            })
          })
          _.each(story.ports.out, (v, k) => {
            obj.ports.out[k] = _.pick(v, ['name', 'alias', 'select'])
            obj.ports.out[k].links = []
            _.each(story.ports.out[k].links, (link) => {
              obj.ports.out[k].links.push(_.pick(link, ['id', 'port']))
            })
          })
          obj.params = _.pick(story.params, ['text'])
          exportData.stories.push(obj)
        })
        return JSON.stringify(exportData)
      },
      exportStories () {
        this.output = this.doExport()
        this.hideOutputPanel = false
      },
      saveStory () {
        // s
        let key = window.prompt('key', 'demo')
        if (key !== null) {
          localforage.setItem(key, this.doExport()).then(() => window.alert('Saved!')).catch(err => console.log(err))
        }
      },
      loadStory () {
        // l
        let key = window.prompt('key', 'demo')
        if (key !== null) {
          localforage.getItem(key).then((v) => {
            if (v !== null) {
              let saved = JSON.parse(v)
              if (_.isObject(saved)) {
                this.idinc = saved.idinc
                this.stories = []
                this.$nextTick(() => {
                  this.stories = saved.stories
                  this.needReload = true
                })
              }
            }
          }).catch(err => console.log(err))
        }
      }
    },
    updated () {
      if (this.needReload) {
        this.drawLines()
        this.needReload = false
      }
    }
  }

</script>
<style scoped>
  #story-board {
    background: url(../assets/grid.png);
    overflow: hidden;
    -webkit-user-drag: none; 
    user-select: none;
    position: relative;
  }

  #story-board ::-webkit-scrollbar {
	  width: 16px;
  }

  #story-board ::-webkit-scrollbar-thumb {
    border: 4px #fff solid;
    -webkit-border-radius: 13px;
    background-color: #ccc;
  }

  #story-board ::-webkit-scrollbar-thumb:hover {
    background-color: #7e7e7e;
  }

  #story-board ::-webkit-scrollbar-track-piece {
    background-color: #fff;
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
    opacity: 0.8;
    overflow: scroll;
  }

  .toolbar {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 100;
  }

  .output {
    position: fixed;
    display: block;
    left: 0px;
    top: 24px;
    bottom: 20px;
    width: 242px;
    box-sizing: border-box;
    overflow-x: scroll;
    background: #fff;
    opacity: 0.8;
    border: 1px #aaa solid;
  }

  .hide {
    display: none;
  }

  h1 {
    position: absolute;
  }
</style>
