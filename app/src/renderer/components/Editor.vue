<template>
  <div class="main" v-loading.fullscreen.lock="uploadingImage" :element-loading-text="uploadingImageText">
    <!-- toolbar  -->
    <div id="toolbar" class="dark">
      <el-button-group class="toolbar-left">
        <template v-for="tool in toolbar">
          <el-tooltip v-if="tool != 'split'" effect="dark" :content="toolbarIconTips[tool]?toolbarIconTips[tool]:tool" placement="bottom">
            <el-button :plain="true" :icon="toolbarIconsClass[tool]" size="small" @click="execuateCallback(tool)" class="dark"></el-button>
          </el-tooltip>
          <span class="split" v-else></span>
        </template>
      </el-button-group>
      <el-button-group class="toolbar-right">
        <el-tooltip effect="dark" content="" placement="bottom">
          <el-dropdown class="btn-manage" trigger="click" @command="execuateCallback">
            <el-button class="dark" icon="z-guanli" size="small">
              管理<i class="el-icon-caret-bottom el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown" class="dark">
              <el-dropdown-item>文章管理</el-dropdown-item>
              <el-dropdown-item>图片管理</el-dropdown-item>
              <el-dropdown-item>分类管理</el-dropdown-item>
              <el-dropdown-item command="settings">应用设置</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-tooltip>
        <!-- <el-tooltip effect="dark" content="退出" placement="bottom">
          <el-button icon="z-logout" size="small" class="dark" @click="logout">退出</el-button>
        </el-tooltip> -->
      </el-button-group>
    </div>
    <!-- main -->
    <div class="half" :class="layoutDirection?'direction':'reverse'">
      <section :style="{width:editWidth+'%'}" v-show="editShow">
        <div class="fit">
          <textarea id="editor"></textarea>
        </div>
      </section>
      <section :style="{width:readWidth+'%'}" style="max-width:1200px" v-show="readShow">
        <div class="previewer-container" id="previewer">
          <div class="markdown-body" id="HTMLContent" v-html="HTMLContent">
          </div>
        </div>
      </section>
    </div>
    <!-- hidden dialogs -_-!!  -->
    <!-- <keep-alive> -->
    <component :is="currentDialog" :show="showDialog">
    </component>
    <!-- </keep-alive> -->
    <!-- <linkDialog :options="{cm:cm, show:linkDialog}"></linkDialog> -->
    <!-- <imageDialog :options="{cm:cm, show: imageDialog}" @uploadingImageFile="uploadingImageFile"></imageDialog> -->
    <!--  <tableDialog :options="{cm:cm, show:tableDialog}"></tableDialog> -->
    <!-- <openPostDialog :options="{cm:cm, show:openPostDialog}"></openPostDialog> -->
    <!-- <savePostDialog :options="{cm:cm, show:savePostDialog}"></savePostDialog> -->
    <!-- <settingDialog :show="settingDialog"></settingDialog> -->
  </div>
</template>
<script>
import {
  requestImageUploadFromStream,
  requestImageUploadFromLocal,
  initAV,
  addCategory,
  categoryExists
} from '../js/api.js'

import {
  toolbar,
  toolbarIconsClass,
  toolbarIconTips,
  toolbarHandlers,
  askSave
} from '../js/defaultToolbar.js'

import CodeMirror from 'codemirror/lib/codemirror.js'
import 'codemirror/addon/selection/active-line.js'
import 'codemirror/addon/edit/closebrackets.js'
import 'codemirror/addon/edit/matchbrackets.js'
import 'codemirror/addon/edit/continuelist.js'
import 'codemirror/mode/markdown/markdown.js'
import 'codemirror/lib/codemirror.css'
import '../css/myCodeMirror.css'

import marked from '../js/markdownSettings.js'

// import marked from 'marked'
import 'github-markdown-css/github-markdown.css';


// import fakeData from '../fake/data.js'


// hightlilght
import Prism from 'prismjs/prism.js'
import 'prismjs/plugins/line-numbers/prism-line-numbers.min.js'
import 'prismjs/plugins/highlight-keywords/prism-highlight-keywords.min.js'
import 'prismjs/plugins/toolbar/prism-toolbar.min.js'
import 'prismjs/plugins/show-language/prism-show-language.min.js'
import 'prismjs/plugins/copy-to-clipboard/prism-copy-to-clipboard.min.js'

import 'prismjs/themes/prism-solarizedlight.css'
import 'prismjs/plugins/line-numbers/prism-line-numbers.css'
import 'prismjs/plugins/toolbar/prism-toolbar.css'

// dialog components
import linkDialog from './Editor/linkDialog'
import imageDialog from './Editor/imageDialog'
import tableDialog from './Editor/tableDialog'
import openPostDialog from './Editor/openPostDialog'
import savePostDialog from './Editor/savePostDialog'
import settingDialog from './Editor/settingDialog'
import categoryDialog from './Editor/categoryDialog'


export default {
  data() {
      return {
        MdContent: '',
        HTMLContent: '',
        tocTree: [],
        cm: {},
        rendering: false,
        webPost: {},
        currentFileInfo: {
          filepath: '',
          localMode: false
        },
        // layout options
        layoutDirection: true,
        editWidth: 50,
        readWidth: 50,
        editShow: true,
        readShow: true,
        // syncScroll options
        enableSyncScroll: true,
        editorScrolling: false,
        previewerScrolling: false,
        // toolbar options
        toolbar: toolbar,
        toolbarIconsClass: toolbarIconsClass,
        toolbarIconTips: toolbarIconTips,
        toolbarHandlers: toolbarHandlers,
        // dialog options
        currentDialog: '',
        showDialog: false,
        // linkDialog: false,
        imageDialog: false,
        // tableDialog: false,
        // newPostDialog: false,
        // openPostDialog: false,
        // savePostDialog: false,
        // settingDialog: false,
        savingPost: false,
        afterSaveCallback: null,
        // upload image
        uploadingImage: false,
        uploadingImageText: '',
        // for test
        time1: 0,
        time2: 0
      }
    },
    components: {
      'linkDialog': linkDialog,
      'imageDialog': imageDialog,
      'tableDialog': tableDialog,
      'openPostDialog': openPostDialog,
      'savePostDialog': savePostDialog,
      'settingDialog': settingDialog,
      'categoryDialog': categoryDialog
    },
    methods: {
      editor: function() {
        return this;
      },
      tocTreeToHtml: function(tree) {
        let startLabel = "<ul>";
        let endLabel = "</ul>";
        let html = "";
        for (let item of tree) {
          if (item.children) {
            html += '<li><a href="#' + item.id + '">' + item.text + '<a>' + this.tocTreeToHtml(item.children) + '</li>\n';
          } else {
            html += '<li><a href="#' + item.id + '">' + item.text + '<a></li>\n'
          }
        }
        return startLabel + html + endLabel;
      },
      execuateCallback: function(name) {
        if (this.toolbarHandlers[name]) {
          this.toolbarHandlers[name](this.cm, this)
        }
      },
      openLocalFile: function(file) {
        let _this = this;
        let reader = new FileReader();
        reader.readAsText(file);
        reader.onload = function(e) {
          _this.cm.clearHistory();
          _this.cm.setValue(this.result)
          _this.cm.markClean()
          _this.webPost = {};
          _this.currentFileInfo.filepath = file.path;
          _this.currentFileInfo.localMode = true;
        }
      },
      editorScroll: function(cm, e) {
        let _this = this;
        if (this.enableSyncScroll) {
          if (this.editorScrolling) {
            this.editorScrolling = false;
            return
          }
          this.previewerScrolling = true;
          let scrollObj = _this.cm.getScrollInfo();
          let percent = scrollObj.top / scrollObj.height;
          let previewer = document.getElementById('previewer');
          previewer.scrollTop = percent * previewer.scrollHeight;
        }
      },
      previewerScroll: function(e) {
        let _this = this;
        if (this.enableSyncScroll) {
          if (this.previewerScrolling) {
            this.previewerScrolling = false;
            return;
          }
          this.editorScrolling = true;
          let previewer1 = e.target;
          let percent = previewer1.scrollTop / previewer1.scrollHeight;
          let scrollObj = _this.cm.getScrollInfo();
          let editorTop = percent * scrollObj.height;
          _this.cm.scrollTo(null, editorTop)
        }
      },
      uploadingImageFile: function(filePromise) {
        let _this = this;
        _this.cm.setOption('readOnly', true)

        _this.uploadingImage = true;
        _this.uploadingImageText = '准备开始上传...';
        filePromise.save({
          onprogress: function(e) {
            if (parseInt(e.percent) === 100) {
              _this.uploadingImageText = '即将上传完成... \\(^o^)/';
            } else {
              _this.uploadingImageText = '拼命上传中，已上传' + parseInt(e.percent) + '%';
            }
          }
        }).then(function(file) {

          let url = file.url();

          if (_this.cm.somethingSelected()) {
            let selection = _this.cm.getSelection();
            let mdImage = '![' + selection + '](' + url + ')';
            _this.cm.replaceSelection(mdImage);
          } else {
            let mdImage = '![](' + url + ')';
            let pos = _this.cm.getCursor('from');
            _this.cm.replaceRange(mdImage, pos);
            _this.cm.setCursor({
              line: pos.line,
              ch: pos.ch + 2
            });
            _this.cm.replaceSelection('图片描述', 'around');
          }
          _this.uploadingImage = false;
          _this.$message({
            message: '图片上传成功！',
            type: 'success'
          })

          _this.cm.setOption('readOnly', false)
        }, function(err) {
          _this.uploadingImage = false;
          console.log(err);
          _this.$message({
            message: '图片上传失败！',
            type: 'error'
          })
          _this.cm.setOption('readOnly', false)
        })
      },
      logout: function() {
        requestLogout();
        this.$router.push({
          name: 'login'
        })
      },
    },
    watch: {
      MdContent: function(newValue) {
        let Content = marked(newValue);
        this.tocTree = marked.tocToTree();
        let html = Content.replace(/<p class="markdown-toc">(.*)<\/p>/gi, this.tocTreeToHtml(this.tocTree))
        this.$nextTick(function() {
          // DOM 更新了
          Prism.highlightAll()
        })
        this.HTMLContent = html;
      },
      'currentFileInfo.localMode': function(val) {
        console.log(val);
        if (val) { // 本地模式
          document.title = 'LeanMarkdown [本地模式]'
        } else { // 网络模式
          document.title = 'LeanMarkdown [网络模式]'
        }
      }
    },
    created: function() {
      console.log('editor created');
      console.log(this);
    },
    mounted: function() {
      console.log('editor mounted');
      let _this = this;

      this.cm = CodeMirror.fromTextArea(document.getElementById('editor'), {
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
      //  同步滚动监听
      //  编辑区滚动
      this.cm.on('scroll', this.editorScroll)
        // 预览区滚动
      document.getElementById('previewer').addEventListener('scroll', _this.previewerScroll)

      // 内容变化监听
      this.cm.on('change', (cm) => {
        if (!_this.rendering) {
          setTimeout(function() {
            _this.MdContent = cm.getValue();
            _this.rendering = false
          }, 300)
          _this.rendering = true;
        }
      })

      // 拖拽打开文件或上传图片
      this.cm.on('drop', function(cm, e) {
        e.preventDefault();

        let file = e.dataTransfer.files[0];

        /* read text file */
        if (/\.(md|txt)$/i.test(file.name)) {
          // 询问是否保存当前文件
          askSave(_this, function() {
            _this.openLocalFile(file)
          })
        } else if (/^image\//i.test(file.type)) {
          // read and upload image
          _this.loading = true;
          _this.loadingText = '准备开始上传...';
          let filePromise = requestImageUploadFromLocal(file);

          _this.uploadingImageFile(filePromise);

        }
      })

      // 图片粘贴上传功能
      this.cm.on('paste', function(cm, event) {
        let clipboardData = event.clipboardData;

        if (clipboardData && clipboardData.items) {
          for (let item of clipboardData.items) {
            // 判断图片格式
            if (item && item.kind == 'file' && item.type.match(/^image\//i)) {

              let imgFile = item.getAsFile();
              let fileType = item.type.replace(/^image\/(.*)/i, '$1')
              let guid = new Date().getTime();
              let fileName = 'ScreenShot' + guid + '.' + fileType;

              let reader = new FileReader();
              reader.readAsDataURL(imgFile);
              reader.onload = function(e) {
                let filePromise = requestImageUploadFromStream(fileName, this.result);
                _this.uploadingImageFile(filePromise);
              }

              break;
            }
          }

        }
      })


      // 添加快捷键
      this.cm.setOption('extraKeys', {
          'Enter': "newlineAndIndentContinueMarkdownList",
          'Ctrl-N': () => {
            this.execuateCallback('newFile');
          },
          'Ctrl-O': () => {
            this.execuateCallback('openFile');
          },
          'Ctrl-S': () => {
            this.execuateCallback('saveFile');
          },
          'Ctrl-B': () => {
            this.execuateCallback('bold');
          },
          'Ctrl-I': () => {
            this.execuateCallback('italic');
          },
          'Ctrl-Q': () => {
            this.execuateCallback('quote');
          },
          'Ctrl-1': () => {
            this.execuateCallback('h1');
          },
          'Ctrl-2': () => {
            this.execuateCallback('h2');
          },
          'Ctrl-3': () => {
            this.execuateCallback('h3');
          },
          'Ctrl-4': () => {
            this.execuateCallback('h4');
          },
          'Ctrl-5': () => {
            this.execuateCallback('h5');
          },
          'Ctrl-6': () => {
            this.execuateCallback('h6');
          },
          'Shift-Ctrl-U': () => {
            this.execuateCallback('ul');
          },
          'Shift-Ctrl-O': () => {
            this.execuateCallback('ol');
          },
          'Ctrl-H': () => {
            this.execuateCallback('hr');
          },
          'Ctrl-L': () => {
            this.execuateCallback('link');
          },
          'Shift-Ctrl-L': () => {
            this.execuateCallback('linkWithoutDialog');
          },
          'Ctrl-Alt-T': () => {
            this.execuateCallback('t');
          },
          'Shift-Ctrl-P': () => {
            this.execuateCallback('image');
          },
          'Ctrl-K': () => {
            this.execuateCallback('inlineCode');
          },
          'Shift-Ctrl-K': () => {
            this.execuateCallback('blockCode');
          },
          'Ctrl-Enter': () => {
            this.execuateCallback('addNewLineAppend');
          },
          'Shift-Ctrl-Enter': () => {
            this.execuateCallback('addNewLinePrepend');
          }
        })
        // this.cm.setValue(fakeData)

      // 初始化网络设置
      let settings = localStorage.getItem('settings')
      console.log('loading settings');
      console.log(settings);
      if (!settings) {
        // 本地模式
        this.currentDialog = 'settingDialog';
        this.showDialog = true;
        this.currentFileInfo.localMode = true;
      } else {
        // 网络模式
        this.settings = JSON.parse(settings);
        initAV(this.settings);
        this.currentFileInfo.localMode = false;
      }
      // 更改标题
      if (this.currentFileInfo.localMode) { // 本地模式
        document.title = 'LeanMarkdown [本地模式]'
      } else { // 网络模式
        document.title = 'LeanMarkdown [网络模式]'
      }

      // categoryExists('未分类').then(function(exist) {
      //   console.log(exist);
      //   if (!exist) {
      //     addCategory('未分类')
      //   }
      // })
     
    }
}
</script>
<style scoped>
.main {
  margin: 0px;
  border: none;
  display: flex;
  flex-direction: column;
  background-color: rgb(242, 242, 242);
  /*overflow-x: hidden;*/
}

.half {
  display: flex;
  align-items: stretch;
  justify-content: center;
  height: 100%;
  /*  width: 100%;*/
  overflow-x: none;
}

.direction {
  flex-direction: row;
}

.reverse {
  flex-direction: row-reverse;
}

.half-item {
  width: 50%;
}

.b {
  border: 1px solid blue;
}


/* toolbar css */

#toolbar {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  height: 40px;
  align-items: center;
  font-family: 'Consolas', '微软雅黑';
}

.toolbar-left {
  display: flex;
  justify-content: flex-start;
}

.toolbar-right {
  display: flex;
  justify-content: flex-end;
}

.dark {
  background-color: rgb(68, 68, 68);
  color: #EFF2F7;
  border: none;
}

.split {
  border: 1.5px solid #fff;
  margin: 3px 0px;
  padding: 0;
}


/* editor css */

.fit {
  width: 100%;
  height: 100%;
  overflow-y: none;
}


/*previewer css */

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
  border: 2px dashed rgb(187, 187, 187);
  font-size: 18px;
  font-family: 'Consolas', '微软雅黑';
}
</style>
<style>
</style>
