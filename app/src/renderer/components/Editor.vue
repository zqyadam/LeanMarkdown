<template>
  <div class="main">
    <el-button-group id="toolbar">
      <el-tooltip v-for="tool in tools" effect="dark" :content="tool.tip" placement="bottom">
        <el-button :plain="true" :icon="tool.icon" size="small" @click="tool.callback"></el-button>
      </el-tooltip>
    </el-button-group>
    <div class="half">
      <section class="half-item" sty>
        <div class="fit">
          <textarea id="editor"></textarea>
        </div>
      </section>
      <section class="half-item">
        <div class="previewer-container">
          <div class="markdown-body" id="HTMLContent" v-html="HTMLContent"></div>
          <!-- paper -->
        </div>
      </section>
    </div>
  </div>
</template>
<script>
import {
  requestLogout
} from '../js/api.js'
import 'github-markdown-css/github-markdown.css'

import Toolbar from './Editor/Toolbar'

import CodeMirror from 'codemirror/lib/codemirror.js'
import 'codemirror/mode/markdown/markdown.js'
import 'codemirror/addon/selection/active-line.js'
import 'codemirror/addon/edit/closebrackets.js'
import 'codemirror/addon/edit/matchbrackets.js'
import 'codemirror/addon/edit/continuelist.js'
import 'codemirror/lib/codemirror.css'
import _ from 'lodash'

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

var renderer = new marked.Renderer();
renderer.code = function(code, language = 'javascript') {

  let time1 = new Date().getTime(); // start time

  let codeContent = hljs.highlightAuto(code, [language]).value;
  let lines = codeContent.split('\n').length;
  let nums = [];
  for (var i = 0; i < lines; i++) {
    nums.push('<li>' + (i + 1) + '</li>');
  }
  nums = '<ul class="pre-numbering">' + nums.join('');
  nums += '</ul>';
  codeContent = nums + codeContent;

  // let time2 = new Date().getTime(); // end time
  // renderTimeSum += (time2 - time1); // add time spent
  // renderCount++; // add count

  return '<pre><code class="lang-' + language + ' hljs has-numbering">' + codeContent + '</code></pre>';
}

marked.setOptions({
  // renderer: renderer,
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  // highlight: function(code, language) {
  //   return hljs.highlightAuto(code, [language]).value;
  // }
});


export default {
  components: {
    toolbar: Toolbar,
  },
  data() {
    return {
      MdContent: '',
      cm: null,
      tools: [{
        name: 'undo',
        icon: 'z-undo',
        tip: '撤销',
        callback: this.undo
      }, {
        name: 'redo',
        icon: 'z-redo',
        tip: '重做',
        callback: this.redo
      }, { //
        name: 'fontLarge',
        icon: 'z-fangda',
        tip: '放大字体',
        callback: function() {}
      }, { //
        name: 'fontSmall',
        icon: 'z-iconfontsuoxiao', //el-icon-z-iconfontsuoxiao
        tip: '缩小字体',
        callback: function() {}
      }, {
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
      }, {
        name: 'h1',
        icon: 'z-h',
        tip: '标题1',
        callback: this.h1
      }, {
        name: 'h2',
        icon: 'z-h1',
        tip: '标题2',
        callback: function() {}
      }, {
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
        callback: function() {}
      }, {
        name: 'ul',
        icon: 'z-wuxuliebiao1',
        tip: '无序列表',
        callback: function() {}
      }, {
        name: 'ol',
        icon: 'z-youxuliebiao',
        tip: '有序列表',
        callback: function() {}
      }, {
        name: 'hr',
        icon: 'z-hengxian',
        tip: '横线',
        callback: function() {}
      }, {
        name: 'link',
        icon: 'z-module-link',
        tip: '链接',
        callback: function() {}
      }, {
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
      }]
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
      return Content;
    },
  },
  methods: {
    setMdContent: function(cm, changeObj) {
      // let time1 = new Date().getTime();
      this.MdContent = cm.getValue();
      // let time2 = new Date().getTime();
      // console.log('getValue time :' + (time2 - time1));
    },
    undo: function() {
      console.log('undo');
      this.cm.undo();
    },
    redo: function() {
      this.cm.redo()
    },
    bold: function() {
      let aroundLabel = '**'
      let pos = this.cm.getCursor('from');
      if (this.cm.somethingSelected()) { // 存在选中文本
        let selection = this.cm.getSelection();
        let replaceContent = aroundLabel + selection + aroundLabel
        this.cm.replaceSelection(replaceContent)
      } else { // 没有选中文本
        this.cm.replaceSelection(aroundLabel + aroundLabel, 'start')
        this.cm.setCursor(pos.line, pos.ch + aroundLabel.length)
      }
    },
    italic: function() {
      let aroundLabel = '*'
      let pos = this.cm.getCursor('from');
      if (this.cm.somethingSelected()) {
        let selection = this.cm.getSelection();
        let replaceContent = aroundLabel + selection + aroundLabel
        this.cm.replaceSelection(replaceContent)
      } else {
        this.cm.replaceSelection(aroundLabel + aroundLabel, 'start')
        this.cm.setCursor(pos.line, pos.ch + aroundLabel.length)
      }
    },
    quote: function() {
      let cm = this.cm;
      let pos = cm.getCursor('from');
      let currentLineContent = cm.getLine(pos.line);
      if (currentLineContent.trim().length === 0) { // 当前行没有内容
        cm.replaceRange('\n> \n', {
          line: pos.line,
          ch: 0
        }, {
          line: pos.line,
          ch: currentLineContent.length
        })
        cm.setCursor({
          line: pos.line + 1,
          ch: 2
        })
      } else {
        cm.replaceRange('\n\n> \n', {
          line: pos.line,
          ch: currentLineContent.length
        })
        cm.setCursor({
          line: pos.line + 2,
          ch: 2
        })
      }
    },
    h1: function() {
      let titleLabel = '#'
      let cm = this.cm;
      let pos = cm.getCursor();
      let currentLineContent = cm.getLine(pos.line);
      if (currentLineContent[0] === '#') {
        cm.replaceRange(titleLabel, {
          line: pos.line,
          ch: 0
        })
      } else {
        cm.replaceRange(titleLabel+' ' + currentLineContent.trim(), {
          line: pos.line,
          ch: 0
        }, {
          line: pos.line,
          ch: currentLineContent.length
        })
      }
    },
    h2:function() {
      let titleLabel = '##'
      let cm = this.cm;
      let pos = cm.getCursor();
      let currentLineContent = cm.getLine(pos.line);
      if (currentLineContent[0] === '#') {
        cm.replaceRange(titleLabel, {
          line: pos.line,
          ch: 0
        })
      } else {
        cm.replaceRange(titleLabel+' ' + currentLineContent.trim(), {
          line: pos.line,
          ch: 0
        }, {
          line: pos.line,
          ch: currentLineContent.length
        })
      }
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
    let editorDOM = document.getElementById('editor');
    let _this = this;
    this.cm = CodeMirror.fromTextArea(editorDOM, {
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

    this.cm.on('change', _.debounce(_this.setMdContent, 500, {
      'leading': true,
      'trailing': true
    }))
    console.log(this.$methods);

    this.cm.setOption('extraKeys', {
      'Ctrl-B': this.bold,
      'Ctrl-I': this.italic,
      'Ctrl-Q': this.quote,
      'Ctrl-1': this.h1,
      'Ctrl-2': this.h2,
      'Shift-Ctrl-1': this.unh1
    })


    let defaultContent = `# Todo
- [x] 增加快捷键（新建、打开、保存）
- [x] 增加“保存成功”提示(采用Nprogress进度条实现)
- [ ] 增加图片上传功能（与七牛云相结合）
- [ ] 增加剪切板图片读取及上传功能
- [x] fix:全局快捷键冲突问题（利用Editor.md快捷键实现）

    `;
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
  background-color: #fff;
  box-shadow: rgba(0, 0, 0, 0.117647) 0px 1px 6px, rgba(0, 0, 0, 0.117647) 0px 1px 4px;
  border-radius: 2px;
  height: 100%;
  padding: 20px;
  margin: 0 5px;
  overflow-y: scroll;
  word-break: break-all;
}

.previewer-container {
  height: 100%;
  width: 100%;
  margin: 0px;
  /*overflow: hidden;*/
  overflow-y: scroll;
}


/* github-markdown.css */

.markdown-body {
  box-sizing: border-box;
  /*min-width: 200px;*/
  /*max-width: 980px;*/
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
