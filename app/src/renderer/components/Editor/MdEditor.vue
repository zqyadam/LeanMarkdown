<template>
  <div class="fit">
    <textarea id="editor"></textarea>
  </div>
</template>
<script>
import CodeMirror from 'codemirror/lib/codemirror.js'
// import 'codemirror/mode/meta.js'
// console.log(CodeMirror.modeInfo);

// CodeMirror.modeInfo.forEach((item)=>{
// 	console.log(item.mode);
// 	if (!item.mode || item.mode === 'null') {return }
// 	require('codemirror/mode/'+item.mode+'/'+item.mode+'.js')
// })

import 'codemirror/mode/markdown/markdown.js'
import 'codemirror/addon/selection/active-line.js'
import 'codemirror/addon/edit/closebrackets.js'
import 'codemirror/addon/edit/matchbrackets.js'
import 'codemirror/addon/edit/continuelist.js'
import 'codemirror/lib/codemirror.css'

import {ipcRenderer } from 'electron'
// console.log(ipcRenderer);

export default {
  data() {
      return {
        // editor:null
        editor: null
      }
    },
    mounted: function() {
      let editorDOM = document.getElementById('editor');
      let _this = this;
      this.editor = CodeMirror.fromTextArea(editorDOM, {
        mode: 'text/x-markdown',
        lineNumbers: true,
        lineWrapping: true,
        tabSize: 2,
        autofocus: true,
        matchBrackets: true,
        styleActiveLine: true,
        autoCloseBrackets: true,

      });

      // console.log(this.editor);

      this.editor.on('change', function(cm, changeObj) {
        // console.log(cm);
        // console.log(changeObj);
        // _this.$emit('input',cm.getValue())
        ipcRenderer.send('requestRenderMarkdown', cm.getValue());
          // _this.$store.dispatch('updateContent', cm.getValue())
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
  margin: 0 5px;
  font-size: 18px;
}
</style>
