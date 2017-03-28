<template>
  <div class="main">
    <el-button-group id="toolbar" class="dark">
      <el-tooltip v-for="tool in toolbarIcons" effect="light" :content="toolbarIconTips[tool]?toolbarIconTips[tool]:tool" placement="bottom">
        <el-button :plain="true" :icon="toolbarIconsClass[tool]" size="small" @click="execuateCallback(tool)" class="dark"></el-button>
      </el-tooltip>
    </el-button-group>
    <div class="half" v-loading="loading" :element-loading-text="loadingText">
      <section class="half-item">
        <div class="fit">
          <textarea id="editor"></textarea>
        </div>
      </section>
      <section class="half-item">
        <div class="previewer-container" id="previewer">
          <div class="markdown-body" id="HTMLContent" v-html="HTMLContent"></div>
        </div>
      </section>
    </div>
    <!-- a very complex dialog -_-!!  -->
    <el-dialog v-model="dialogInfo.show" :title="dialogInfo.title" :close-on-click-modal="false" :show-close="dialogInfo.showClose">
      <template v-for="(element,index) in dialogInfo.formElements">
        <template v-if="element.type === 'file'">
          <el-upload class="avatar-uploader" :before-upload="element.handler" action="" :show-file-list="false" select :accept="element.accept">
            <i class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </template>
        <el-form v-else label-width="80px" label-position="right">
          <el-form-item :label="element.label">
            <el-input v-if="element.type === 'input'" v-model="element.value"></el-input>
            <el-select v-if="element.type === 'select'" v-model="element.value">
              <el-option v-for="option in element.options" :label="option.label" :value="option.value"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </template>
      <div slot="footer" class="dialog-footer">
        <el-button v-for="button in dialogInfo.formButtons" :type="button.type" v-text="button.text" @click="button.handler"></el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
/* fake data */
import fakeData from '../fake/data.js'
// fake data end 


import {
  requestLogout,
  requestImageUploadFromStream,
  requestImageUploadFromLocal
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
        loading: false,
        loadingText: '',
        dialogInfo: {
          show: false,
          title: '',
          formElements: []
        },
        MdContent: '',
        cm: null,
        rendering: false,
        scrolling: false,
        toolbarIcons: toolbarIcons,
        toolbarIconsClass: toolbarIconsClass,
        toolbarIconTips: toolbarIconTips,
        toolbarHandlers: toolbarHandlers,
        tools: [{ //
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
      showDialog: function(dialog) {
        console.log(dialog);
        for (let key in dialog) {
          if (dialog[key]) {
            this.dialogInfo[key] = dialog[key];
          }
        }
        return
        this.dialogInfo.formElements = dialog.formElements;
        this.dialogInfo.formButtons = dialog.formButtons;
        this.dialogInfo.show = true;
      },
      hideDialog: function() {
        this.dialogInfo.show = false;
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

      // drag and drop pictures
      this.cm.on('drop', function(cm, e) {
        e.preventDefault()

        let file = e.dataTransfer.files[0];
        let imageType = ['image/jpeg', 'image/png', 'image/bmp', 'image/gif']

        console.log(imageType.indexOf(file.type));
        if (imageType.indexOf(file.type) !== -1) {
          _this.loading = true;
          // let pos = cm.getCursor('start');
          _this.loadingText = '准备开始上传...';
          let filePromise = requestImageUploadFromLocal(file);
          filePromise.save({
            onprogress: function(e) {
              // change progress
              if (parseInt(e.percent) === 100) {
                _this.loadingText = '即将上传完成... \\(^o^)/';
              } else {
                _this.loadingText = '拼命上传中，已上传' + parseInt(e.percent) + '%';
              }
            }
          }).then(function(file) {
            let url = file.url();

            if (cm.somethingSelected()) {
              let selection = cm.getSelection();
              let mdImage = '![' + selection + '](' + url + ')';
              cm.replaceSelection(mdImage);

            } else {
              let mdImage = '![](' + url + ')';
              let pos = cm.getCursor('start');
              cm.replaceRange(mdImage, pos);
              cm.setCursor({
                line: pos.line,
                ch: pos.ch + 2
              });
              cm.replaceSelection('图像描述', 'around');
            }

            _this.loading = false;
          }, function(err) {
            _this.loading = false;
          })
        }
      })


      // 粘贴截图
      this.cm.on('paste', function(cm, changeObject) {
        console.log(changeObject.clipboardData);
        let items = changeObject.clipboardData.items;
        console.log(items);
        console.log(changeObject.clipboardData.types);
        let clipboardData = changeObject.clipboardData;
        if (clipboardData) {
          let items = clipboardData.items;
          if (!items) {
            return
          }

          let item = items[0];
          let types = clipboardData.types || [];
          for (let i = 0; i < types.length; i++) {
            if (types[i] === 'Files') {
              item = items[i];
              break;
            }
          }

          if (item && item.kind == 'file' && item.type.match(/^image\//i)) {
            console.log(item.getAsFile());
            let imgFile = item.getAsFile();
            let fileType = item.type.replace(/^image\/(.*)/i, '$1')
            let guid = new Date().getTime();
            // let guid = [time.getFullYear(),(time.getMonth()+1),time.getDate(),time.getHours(),time.getMinutes(),time.getSeconds()].join('_')
            console.log(guid);
            let fileName = 'ScreenShot' + guid + '.' + fileType;
            let reader = new FileReader();
            reader.readAsDataURL(imgFile);
            reader.onload = function(e) {
              _this.loading = true;
              _this.loadingText = '准备开始上传...';
              let imgPromise = requestImageUploadFromStream(fileName, this.result);
              imgPromise.save({
                onprogress: function(e) {
                  // { loaded: 1234, total: 2468, percent: 50 }
                  if (parseInt(e.percent) === 100) {
                    _this.loadingText = '即将上传完成... \\(^o^)/';
                  } else {
                    _this.loadingText = '拼命上传中，已上传' + parseInt(e.percent) + '%';
                  }
                }
              }).then(function(file) {
                let url = file.url();

                if (cm.somethingSelected()) {
                  let selection = cm.getSelection();
                  let mdImage = '![' + selection + '](' + url + ')';
                  cm.replaceSelection(mdImage);

                } else {
                  let mdImage = '![](' + url + ')';
                  let pos = cm.getCursor('start');
                  cm.replaceRange(mdImage, pos);
                  cm.setCursor({
                    line: pos.line,
                    ch: pos.ch + 2
                  });
                  cm.replaceSelection('图像描述', 'around');
                }
                _this.$message({
                  message: '图像上传成功',
                  type: 'success'
                })
                _this.loading = false;
                _
              }, function(err) {
                _this.$message.error('图像上传失败！')
                _this.loading = false;
              })

            }

          }
        }
      })

      //  滚动监听
      this.cm.on('scroll', function(cm) {

        if (!_this.scrolling) {
          setTimeout(function() {
            let scrollObj = cm.getScrollInfo();
            let persent = scrollObj.top / scrollObj.height;
            let previewer = document.getElementById('previewer');
            previewer.scrollTop = persent * previewer.scrollHeight;


            let line = cm.lineAtHeight(scrollObj.top);
            console.log('line num:'+line);
            _this.scrolling = false
          }, 30)
          _this.scrolling = true;
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
        'Shift-Ctrl-L': () => {
          this.execuateCallback('linkWithoutDialog')
        },
        'Ctrl-T': () => {
          this.execuateCallback('t')
        },
        'Ctrl-P': () => {
          this.execuateCallback('image')
        },
        'Shift-Ctrl-1': this.unh1,
      })


      let defaultContent = fakeData
      this.cm.setValue(defaultContent)



      // let lineH = lingHandle.height();

      let mode = this.cm.getMode();
      console.log(mode);
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
  width: 50%;
}

.b {
  border: 1px solid blue;
}


/* toolbar css */

.dark {
  background-color: rgb(68, 68, 68);
  color: #EFF2F7;
  border: none;
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
  background-color: rgb(249, 249, 245);
}


/* github-markdown.css */

.markdown-body {
  box-sizing: border-box;
  margin: 5px;
  padding: 15px;
  border: 3px dashed #ccc;
  font-size: 18px;
  font-family: 'Consolas', '微软雅黑';
}
</style>
<style>
.CodeMirror {
  height: 100%;
  margin: 0 5px;
  font-size: 18px;
  background-color: rgb(249, 249, 245);
  font-family: 'Consolas', '微软雅黑';
}

.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader .el-upload:hover {
  border-color: #20a0ff;
}

.avatar-uploader {
  text-align: center;
  margin-bottom: 5px;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
</style>
