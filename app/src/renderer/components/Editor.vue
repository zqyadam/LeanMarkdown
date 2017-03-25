<template>
  <div class="main">
    <el-button-group id="toolbar">
      <el-tooltip v-for="tool in toolbarIcons" effect="dark" :content="toolbarIconTips[tool]?toolbarIconTips[tool]:tool" placement="bottom">
        <el-button :plain="true" :icon="toolbarIconsClass[tool]" size="small" @click="execuateCallback(tool)"></el-button>
      </el-tooltip>
    </el-button-group>
    <div class="half">
      <section class="half-item">
        <div class="fit">
          <textarea id="editor"></textarea>
        </div>
      </section>
      <section class="half-item">
        <div class="previewer-container">
          <div class="markdown-body" id="HTMLContent" v-html="HTMLContent"></div>
        </div>
      </section>
    </div>
    <el-dialog title="a dialog" v-model="dialogVisible" >
    {{dialogContent}}
    </el-dialog>
  </div>
</template>
<script>
/* fake data */
import fakeData from '../fake/data.js'
// fake data end 

import {
  requestLogout
} from '../js/api.js'
import 'github-markdown-css/github-markdown.css'
import 'highlight.js/styles/monokai-sublime.css'

// import Toolbar from './Editor/Toolbar'
import {
  toolbarIcons,
  toolbarIconsClass,
  toolbarIconTips,
  toolbarHandlers
} from '../js/defaultToolbar.js'

import CodeMirror from 'codemirror/lib/codemirror.js'
import 'codemirror/addon/selection/active-line.js'
import 'codemirror/addon/edit/closebrackets.js'
import 'codemirror/addon/edit/matchbrackets.js'
import 'codemirror/addon/edit/continuelist.js'
import 'codemirror/addon/dialog/dialog.css'
import 'codemirror/addon/dialog/dialog.js'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/markdown/markdown.js'
// import _ from 'lodash'

console.log(CodeMirror.commands.newlineAndIndentContinueMarkdownList);

// import marked from '../js/markdownSettings.js'
import marked from 'marked'
import hljs from 'highlight.js'

/* debug define rendering time varaible */
// var renderTimeSum = 0;
// var renderCount = 0;
/* debug define rendering time varaible end */
hljs.configure({
  tabReplace: '  ' // 2 spaces
})

// var renderer = new marked.Renderer();
// // code renderer
// renderer.code = function(code, language = 'javascript') {

//   let time1 = new Date().getTime(); // start time

//   let codeContent = hljs.highlightAuto(code, [language]).value;
//   let lines = codeContent.split('\n').length;
//   let nums = [];
//   for (var i = 0; i < lines; i++) {
//     nums.push('<li>' + (i + 1) + '</li>');
//   }
//   nums = '<ul class="pre-numbering">' + nums.join('');
//   nums += '</ul>';
//   codeContent = nums + codeContent;

//   // let time2 = new Date().getTime(); // end time
//   // renderTimeSum += (time2 - time1); // add time spent
//   // renderCount++; // add count

//   return '<pre><code class="lang-' + language + ' hljs has-numbering">' + codeContent + '</code></pre>';
// }




export default {
  data() {
      return {
        dialogContent:'',
        dialogVisible:true,
        MdContent: '',
        cm: null,
        rendering: false,
        toolbarIcons: toolbarIcons,
        toolbarIconsClass: toolbarIconsClass,
        toolbarIconTips: toolbarIconTips,
        toolbarHandlers: toolbarHandlers,
        tools: [
          // {
          //   name: 'undo',
          //   icon: 'z-undo',
          //   tip: '撤销',
          //   callback: this.undo
          // }, {
          //   name: 'redo',
          //   icon: 'z-redo',
          //   tip: '重做',
          //   callback: this.redo
          // },
          { //
            name: 'fontLarge',
            icon: 'z-fangda',
            tip: '放大字体',
            callback: function() {}
          }, { //
            name: 'fontSmall',
            icon: 'z-iconfontsuoxiao', //el-icon-z-iconfontsuoxiao
            tip: '缩小字体',
            callback: function() {}
          },
          /*{
            name: 'bold',
            icon: 'z-bold',
            tip: '加粗',
            callback: this.bold
          }, {
            name: 'italic',
            icon: 'z-italic',
            tip: '斜体',
            callback: this.italic
          }, {
            name: 'quote',
            icon: 'z-yinyong',
            tip: '引用',
            callback: this.quote
          }, 
          {
            name: 'h1',
            icon: 'z-h',
            tip: '标题1',
            callback: this.h1
          }, 
          {
            name: 'h2',
            icon: 'z-h1',
            tip: '标题2',
            callback: function() {}
          },
          {
            name: 'h3',
            icon: 'z-h3',
            tip: '标题3',
            callback: function() {}
          }, {
            name: 'h4',
            icon: 'z-h2',
            tip: '标题4',
            callback: function() {}
          }, {
            name: 'h5',
            icon: 'z-h5',
            tip: '标题5',
            callback: function() {}
          }, {
            name: 'h6',
            icon: 'z-h4',
            tip: '标题6',
            callback: function(cm) {
              console.log(cm);
            }
          },  
          {
            name: 'ul',
            icon: 'z-wuxuliebiao1',
            tip: '无序列表',
            callback: function() {}
          }, {
            name: 'ol',
            icon: 'z-youxuliebiao',
            tip: '有序列表',
            callback: function() {}
          }, 
          {
            name: 'hr',
            icon: 'z-hengxian',
            tip: '横线',
            callback: function() {}
          }, {
            name: 'link',
            icon: 'z-module-link',
            tip: '链接',
            callback: function() {}
          },*/
          {
            name: 'image',
            icon: 'z-tupian',
            tip: '图片',
            callback: function() {}
          }, {
            name: 'inlineCode',
            icon: 'z-ai-code',
            tip: '行内代码',
            callback: function() {}
          }, {
            name: 'blockCode',
            icon: 'z-daimakuai',
            tip: '代码块',
            callback: function() {}
          }, {
            name: 'logout',
            icon: 'z-logout',
            tip: '退出',
            callback: function() {
              requestLogout()
              console.log(this);
            }
          }
        ]
      }
    },
    computed: {
      HTMLContent: function() {
        let Content = marked(this.MdContent);
        /* debug calculating rendering time */
        // let average = renderTimeSum / renderCount;
        // console.log('average code render time :' + average);
        // renderTimeSum = 0;
        // renderCount = 0
        /* debug calculating rendering time end */
        // console.log(Content);
        return Content;
      },
    },
    methods: {
      execuateCallback: function(name) {
        if (this.toolbarHandlers[name]) {
          this.toolbarHandlers[name](this.cm, this)
        }
      },
      showDialog: function(dialogContent, options) {
        console.log(dialogContent);
        this.dialogContent = dialogContent;
        this.dialogVisible = true;
      },
      unh1: function() {
        let cm = this.cm;
        let pos = cm.getCursor();
        let currentLineContent = cm.getLine(pos.line);
        let currentLineContentTrim = currentLineContent.trim();
        if (currentLineContentTrim[0] === '#' && currentLineContentTrim[1] !== '#') {
          let contentArr = currentLineContentTrim.split('');
          contentArr.shift(0);
          let newContent = contentArr.join('').trim();
          cm.replaceRange(newContent, {
            line: pos.line,
            ch: 0
          }, {
            line: pos.line,
            ch: currentLineContent.length
          })

        }
      }
    },
    mounted: function() {
      hljs.configure({
        tabReplace: '  ' // 2 spaces
      })

      marked.setOptions({
        // renderer: renderer,
        gfm: true,
        tables: true,
        breaks: true,
        pedantic: false,
        sanitize: false,
        smartLists: true,
        smartypants: false,
        highlight: function(code, language) {
          return hljs.highlightAuto(code, [language]).value;
        }
      });

      let editorDOM = document.getElementById('editor');
      let _this = this;
      this.cm = CodeMirror.fromTextArea(editorDOM, {
        mode: 'markdown',
        lineNumbers: true,
        lineWrapping: true,
        foldGutter: true,
        tabSize: 2,
        autofocus: true,
        theme: "default",
        showCursorWhenSelecting: true,
        matchBrackets: true,
        styleActiveLine: true,
        autoCloseBrackets: true,
      });

      // console.log(this.editor);
      this.cm.on('change', (cm, changeObj) => {
        if (!_this.rendering) {
          setTimeout(function() {
            _this.MdContent = cm.getValue();
            _this.rendering = false
          }, 300)
          _this.rendering = true;
        }

      })

      this.cm.setOption('extraKeys', {
        'Enter': "newlineAndIndentContinueMarkdownList",
        'Ctrl-B': () => {
          this.execuateCallback('bold')
        },
        'Ctrl-I': () => {
          this.execuateCallback('italic')
        },
        'Ctrl-Q': () => {
          this.execuateCallback('quote')
        },
        'Ctrl-1': () => {
          this.execuateCallback('h1')
        },
        'Ctrl-2': () => {
          this.execuateCallback('h2')
        },
        'Ctrl-3': () => {
          this.execuateCallback('h3')
        },
        'Ctrl-4': () => {
          this.execuateCallback('h4')
        },
        'Ctrl-5': () => {
          this.execuateCallback('h5')
        },
        'Ctrl-6': () => {
          this.execuateCallback('h6')
        },
        'Ctrl-L': () => {
          this.execuateCallback('link')
        },
        'Ctrl-T': () => {
          this.execuateCallback('t')
        },
        'Shift-Ctrl-1': this.unh1,
      })


      let defaultContent = fakeData
      this.cm.setValue(defaultContent)
    }
}
</script>
<style scoped>
.main {
  margin: 0px;
  border: none;
  display: flex;
  flex-direction: column;
}

.half {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  justify-content: center;
  height: 100%;
}

.half-item {
  /*flex-grow: 1;*/
  /*flex-shrink:1;*/
  width: 50%;
}

.b {
  border: 1px solid blue;
}


/* editor css */

.fit {
  width: 100%;
  height: 100%;
  overflow-y: none;
}

#editor {
  width: 100%;
  height: 100%;
}


/* previewer css */

.paper {
  transition: all .45s cubic-bezier(0.23, 1, 0.32, 1);
  color: rgba(0, 0, 0, 0.87);
  background-color: #fcfcfc;
  box-shadow: rgba(0, 0, 0, 0.117647) 0px 1px 6px, rgba(0, 0, 0, 0.117647) 0px 1px 4px;
  border-radius: 2px;
  height: 100%;
  padding: 20px;
  margin: 0 5px;
  word-break: break-all;
}

.previewer-container {
  height: 100%;
  width: 100%;
  margin: 0px;
  overflow-y: auto;
}


/* github-markdown.css */

.markdown-body {
  box-sizing: border-box;
  margin: 0 auto;
  padding: 45px;
}
</style>
<style>
.CodeMirror {
  height: 100%;
  margin: 0 5px;
  font-size: 18px;
}
</style>
