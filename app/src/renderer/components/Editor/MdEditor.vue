<template>
  <div class="fit">
    <textarea id="editor"></textarea>
  </div>
</template>
<script>
import CodeMirror from 'codemirror/lib/codemirror.js'
import 'codemirror/mode/markdown/markdown.js'
import 'codemirror/lib/codemirror.css'
export default {
  data() {
      return {
        // editor:null
        editor:null
      }
    },
    mounted: function() {
      let editorDOM = document.getElementById('editor');
      let _this = this;
      this.editor = CodeMirror.fromTextArea(editorDOM, {
        mode: 'text/x-markdown',
        lineNumbers: true,
        lineWrapping:true,
        tabSize:2,
        autofocus:true
      });
      this.editor.on('change',function(cm, changeObj) {
      	// console.log(cm);
      	// console.log(changeObj);
      	// _this.$emit('input',cm.getValue())
      	_this.$store.dispatch('updateContent',cm.getValue())
      })
    }
}
</script>
<style scoped>
.fit {
  width: 100%;
  height: 100%;
}

#editor {
  width: 100%;
  height: 100%;
}

.b {
  border: 1px solid red;
}
</style>
<style>
.CodeMirror {
  height: 100%;
  margin:0 5px;
}
</style>
