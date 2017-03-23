<template>
  <el-button-group id="toolbar">
  <el-tooltip v-for="tool in tools" effect="dark" :content="tool.tip" placement="bottom">
    <el-button  :plain="true" :icon="tool.icon" size="small" @click="tool.callback"></el-button>
    </el-tooltip>
  </el-button-group>
</template>
<script>
import { requestLogout } from '../../js/api.js'

export default {
  data() {
      return {}
    },
    props: {
      tools: {
        type: Array,
        default () {
          return [{
            name: 'undo',
            icon: 'z-undo',
            tip:'撤销',
            callback: function() {
              console.log('z-undo');
            }
          }, {
            name: 'redo',
            icon: 'z-redo',
            tip:'重做',
            callback: function() {}
          }, { //
            name: 'fontLarge',
            icon: 'z-fangda',
            tip:'放大字体',
            callback: function() {}
          }, { //
            name: 'fontSmall',
            icon: 'z-iconfontsuoxiao', //el-icon-z-iconfontsuoxiao
            tip:'缩小字体',
            callback: function() {}
          }, {
            name: 'bold',
            icon: 'z-bold',
            tip:'加粗',
            callback: function() {}
          }, {
            name: 'italic',
            icon: 'z-italic',
            tip:'斜体',
            callback: function() {}
          }, {
            name: 'quote',
            icon: 'z-yinyong',
            tip:'引用',
            callback: function() {}
          }, {
            name: 'h1',
            icon: 'z-h',
            tip:'标题1',
            callback: function() {}
          }, {
            name: 'h2',
            icon: 'z-h1',
            tip:'标题2',
            callback: function() {}
          }, {
            name: 'h3',
            icon: 'z-h3',
            tip:'标题3',
            callback: function() {}
          }, {
            name: 'h4',
            icon: 'z-h2',
            tip:'标题4',
            callback: function() {}
          }, {
            name: 'h5',
            icon: 'z-h5',
            tip:'标题5',
            callback: function() {}
          }, {
            name: 'h6',
            icon: 'z-h4',
            tip:'标题6',
            callback: function() {}
          }, {
            name: 'ul',
            icon: 'z-wuxuliebiao1',
            tip:'无序列表',
            callback: function() {}
          }, {
            name: 'ol',
            icon: 'z-youxuliebiao',
            tip:'有序列表',
            callback: function() {}
          }, {
            name: 'hr',
            icon: 'z-hengxian',
            tip:'横线',
            callback: function() {}
          }, {
            name: 'link',
            icon: 'z-module-link',
            tip:'链接',
            callback: function() {}
          }, {
            name: 'image',
            icon: 'z-tupian',
            tip:'图片',
            callback: function() {}
          }, {
            name: 'inlineCode',
            icon: 'z-ai-code',
            tip:'行内代码',
            callback: function() {}
          }, {
            name: 'blockCode',
            icon: 'z-daimakuai',
            tip:'代码块',
            callback: function() {}
          }, {
            name: 'logout',
            icon: 'z-logout',
            tip:'退出',
            callback: function() {
              requestLogout()
              console.log(this);
            }
          }]
        }
      }
    }
}
</script>
<style scoped>
.b {
  border: 1px solid blue;
}

#toolbar {
  text-align: left;
  height: auto;
}
</style>
