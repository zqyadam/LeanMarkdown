<template>
    <el-button-group id="toolbar">
      <el-button v-for="tool in tools" :plain="true" :icon="tool.icon" size="small" @click="tool.callback"></el-button>
    </el-button-group>
</template>
<script>
export default {
  data() {
      return {}
    },
    props: {
      tools: {
        type: Array,
        default () {
          return [{
            icon: 'z-undo',
            callback: function() {
              console.log('z-undo');
            }
          }, {
            icon: 'z-redo',
            callback: function() {}
          }, {
            icon: 'z-bold',
            callback: function() {}
          }, {
            icon: 'z-italic',
            callback: function() {}
          }, {
            icon: 'z-yinyong',
            callback: function() {}
          }, {
            icon: 'z-h',
            callback: function() {}
          }, {
            icon: 'z-h1',
            callback: function() {}
          }, {
            icon: 'z-h3',
            callback: function() {}
          }, {
            icon: 'z-h2',
            callback: function() {}
          }, {
            icon: 'z-h5',
            callback: function() {}
          }, {
            icon: 'z-h4',
            callback: function() {}
          }, {
            icon: 'z-wuxuliebiao1',
            callback: function() {}
          }, {
            icon: 'z-youxuliebiao',
            callback: function() {}
          }, {
            icon: 'z-hengxian',
            callback: function() {}
          }, {
            icon: 'z-module-link',
            callback: function() {}
          }, {
            icon: 'z-tupian',
            callback: function() {}
          }, {
            icon: 'z-ai-code',
            callback: function() {}
          }, {
            icon: 'z-daimakuai',
            callback: function() {}
          }]
        }
      }
    }
}
</script>
<style scoped>

.b{
  border: 1px solid blue;
}
#toolbar{
  text-align: left;
  height:auto;
}
</style>
