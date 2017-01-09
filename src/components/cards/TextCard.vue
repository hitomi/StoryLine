<template lang="pug">
  .text-card(:style='layout')
    .title(@mousedown='titleMouseDown', @mouseenter='titleMouseEnter', @mouseleave='titleMouseLeave')  文本 
    .ports
      ul.in
        li(v-for='inp in ports.in')
          span.port(@mousedown='startLinkIn', @mouseup='endLinkIn', @mouseenter='enterLinkIn', @mouseleave='leaveLinkIn', :story-name='inp.name', :class="{active: inp.links && inp.links.length}")
          | {{ inp.name }}
      ul.out
        li(v-for='outp in ports.out')
          span.port(@mousedown='startLinkOut', @mouseup='endLinkOut', @mouseenter='enterLinkOut', @mouseleave='leaveLinkOut', :story-name='outp.name', :class="{active: outp.links && outp.links.length}")
          | {{ outp.name }}
    .params(:contenteditable='edit', :class='{edit: edit}', @dblclick="changeEditState") {{params.text}}
</template>
<script>
  import $ from 'jquery'

  export default {
    props: ['story'],
    data () {
      this.$set(this.story, 'edit', false)
      return this.story
    },
    methods: {
      changeEditState () {
        this.story.edit = !this.story.edit
        if (this.story.edit === false) {
          this.params.text = $('.params', this.$el).text()
        }
      },
      titleMouseEnter (ev) {
        this.$emit('titleMouseEnter', ev, this)
      },
      titleMouseLeave (ev) {
        this.$emit('titleMouseLeave', ev, this)
      },
      titleMouseDown (ev) {
        this.$emit('titleMouseDown', ev, this)
      },
      startLinkIn (ev) {
        this.$emit('startLink', ev, this, 'in')
      },
      endLinkIn (ev) {
        this.$emit('endLink', ev, this, 'in')
      },
      startLinkOut (ev) {
        this.$emit('startLink', ev, this, 'out')
      },
      endLinkOut (ev) {
        this.$emit('endLink', ev, this, 'out')
      },
      enterLinkIn (ev) {
        this.$emit('enterLink', ev, this, 'in')
      },
      leaveLinkIn (ev) {
        this.$emit('leaveLink', ev, this, 'in')
      },
      enterLinkOut (ev) {
        this.$emit('enterLink', ev, this, 'out')
      },
      leaveLinkOut (ev) {
        this.$emit('leaveLink', ev, this, 'out')
      }
    }
  }
</script>
<style lang="less" scoped>
  @color-text-card: #43af00;
  @color-border: #969696;
  @card-border: 1px @color-border solid;
  @card-border-radius: 8px 8px 0 0;

  .text-card {
    position: absolute;
    background-color: @color-text-card;
    width: 320px;
    border-radius: @card-border-radius;
    border: @card-border;

    ul, li {
      margin: 0;
      padding: 0;
      list-style: none;
    }

    > .title {
      height: 32px;
      line-height: 32px;
      padding-left: 16px;
      color: #fff;
      user-select:none;
      background-color: @color-text-card;
      border-radius: @card-border-radius;
      border-bottom: 1px #aaa solid;
    }

    > .ports {
      background: #fff;
      border-bottom: 1px #aaa solid;
      user-select:none;
      padding: 8px;

      li {
        height: 28px;
        line-height: 28px;
      }

      .port {
        box-sizing: border-box;
        margin-top: 5px;
        float: left;
        width: 16px;
        height: 16px;
        border-radius: 4px;
        background: #eee;
        border: 1px #aaa solid;
        margin-right: 8px;
        position: relative;
        
        &.active {

          border: none;
          background: #0099af;

          &:after {
            content: '　';
            display: block;
            position: absolute;
            height: 8px;
            width: 9px;
            top: 4px;
            right: 16px;
            background: #0099af;
          }
        }

      }

      .out .port {
        float: right;
        margin-right: 0;
        margin-left: 8px;

        &.active {
          &:after {
            left: 16px;
            right: auto;
          }
        }
      }

      > .in {
        width: 49%;
        float: left;
      }

      > .out {
        width: 49%;
        float: right;
        text-align: right;
      }

      &:after {
        content: '@';
        display:block;
        font-size: 0px;
        height: 0px;
        clear: both;
      }
    }

    > .params {
      padding: 8px;
      background: #f5f5f5;
      outline: none;
      line-height: 1.5;
      &.edit {
        background: #deffe9;
      }
      > p {
        margin: 0;
      }
    }
  }

</style>
