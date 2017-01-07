<template>
  <div class="text-card"
    :style="layout"
    >
    <div class="title" 
    @mousedown="mousedown"
    @mouseenter="mouseenter"
    @mouseleave="mouseleave"
    > 文本 </div>
    <div class="ports">
      <ul class="in">
        <li v-for="inp in ports.in"><span class="port" @mousedown="portline" @mouseup="portlineend"></span> in</li>
      </ul>
      <ul class="out">
        <li v-for="outp in ports.out"><span class="port" @mousedown="portline" @mouseup="portlineend"></span> out</li>
      </ul>
    </div>
    <div class="params">
      <p>{{param.text}}</p>
    </div>
  </div>
</template>
<script>
  export default {
    props: ['story'],
    data () {
      return this.story
    },
    methods: {
      mouseenter (ev) {
        this.$emit('mouseenter', ev)
      },
      portline (ev) {
        this.$emit('portline', ev, this)
      },
      portlineend (ev) {
        this.$emit('portlineend', ev, this)
      },
      mouseleave (ev) {
        this.$emit('mouseleave', ev)
      },
      mousedown (ev) {
        this.$emit('mousedown', ev, this)
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
        margin-top: 5px;
        float: left;
        width: 16px;
        height: 16px;
        border-radius: 4px;
        background: #eee;
        border: 1px #aaa solid;
        margin-right: 8px;
      }

      .out .port {
        float: right;
        margin-right: 0;
        margin-left: 8px;
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
      > p {
        line-height: 1.5;
        margin: 0;
      }
    }
  }

</style>
