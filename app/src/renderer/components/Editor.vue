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
        <el-tooltip effect="dark" content="选择管理项目" placement="bottom">
          <el-dropdown class="btn-manage" trigger="click" @command="execuateCallback">
            <el-button class="dark" icon="z-guanli" size="small">
              管理<i class="el-icon-caret-bottom el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown" class="dark">
              <el-dropdown-item command="postManage">文章管理</el-dropdown-item>
              <el-dropdown-item command="imageManage">图片管理</el-dropdown-item>
              <el-dropdown-item command="categoryManage">分类管理</el-dropdown-item>
              <el-dropdown-item command="settings">基本设置</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-tooltip>
        <!--  <el-tooltip effect="dark" content="退出当前用户" placement="bottom">
          <el-button v-if="isLoggedIn" :plain="true" icon="el-icon-z-logout" size="small" @click="logout" class="dark"></el-button>
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
    <component :is="currentDialog" :show="showDialog"></component>
  </div>
</template>
<script>
import {
  requestLogin,
  isLoggedIn,
  getCurrentUser,
  requestImageUploadFromStream,
  requestImageUploadFromLocal,
  imageExists,
  initAV,
  addCategory,
  categoryExists
} from '../js/api.js'

import hasha from 'hasha'

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


import 'github-markdown-css/github-markdown.css';


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
import postManagementDialog from './Editor/postManagementDialog'
import imageManagementDialog from './Editor/imageManagementDialog'
import categoryManagementDialog from './Editor/categoryManagementDialog'


export default {
  data() {
      return {
        MdContent: '',
        HTMLContent: '',
        tocTree: [],
        cm: {},
        rendering: false,
        allPosts: [],
        allCategories: [],
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
        savingPost: false,
        afterSaveCallback: null,
        // upload image
        uploadingImage: false,
        uploadingImageText: ''
      }
    },
    components: {
      'linkDialog': linkDialog,
      'imageDialog': imageDialog,
      'tableDialog': tableDialog,
      'openPostDialog': openPostDialog,
      'savePostDialog': savePostDialog,
      'settingDialog': settingDialog,
      'postManagementDialog': postManagementDialog,
      'imageManagementDialog': imageManagementDialog,
      'categoryManagementDialog': categoryManagementDialog
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
      execuateCallback: function(name, ...args) {
        if (this.toolbarHandlers[name]) {
          this.toolbarHandlers[name](this, args)
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
          _this.currentFileInfo.localMode = true;
          _this.currentFileInfo.filepath = file.path;
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
          console.log(file);
          let url = file.url();
          _this.execuateCallback('insertImageLabel', url);
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
      setTitle: function() {
        if (this.currentFileInfo.localMode) { // 本地模式
          document.title = 'LeanMarkdown [本地模式] ' + this.currentFileInfo.filepath
        } else { // 网络模式
          let user = getCurrentUser();
          let username = user ? ' 当前用户：' + user.getUsername() : '';
          document.title = 'LeanMarkdown [网络模式] ' + (this.webPost.id ? this.webPost.get('title') : '') + username;
        }
      },
      logout: function() {
        requestLogout();
        this.$router.push({
          name: 'login'
        })
      },
    },
    props: {
      mode: {
        type: Boolean
      }
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
        this.setTitle();

      },
      'currentFileInfo.filepath': function(val) {
        this.setTitle();
      },
      'webPost': function(post) {
        if (!post.id) {
          return
        }

        document.title = 'LeanMarkdown [网络模式] ' + (post.id ? post.get('title') : '')
      },
      mode: function(val) {
        this.localMode = val;
      }
    },
    created: function() {
      console.log('editor created');
      console.log(this);
    },
    mounted: function() {
      console.log('editor mounted');
      let _this = this;

      // 初始化CodeMirror
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
        let file = e.dataTransfer.files[0];
        if (file == undefined) {
          return ;
        }
        /* read text file */
        if (/\.(md|txt)$/i.test(file.name)) {
          // 询问是否保存当前文件
          askSave(_this, function() {
            _this.openLocalFile(file)
          })
        } else if (/^image\//i.test(file.type)) {
          e.preventDefault();
          // get file md5 
          let fileMd5 = hasha.fromFileSync(file.path, {
            algorithm: 'md5'
          });
          console.log(fileMd5);
          imageExists(fileMd5).then((results) => {
            console.log(results.length);
            if (results.length != 0) {
              console.log('image exist');
              // image exist
              let url = results[0].get('url');

              _this.execuateCallback('insertImageLabel', url);
            } else {
              // image not exist
              // read and upload image
              _this.loading = true;
              _this.loadingText = '准备开始上传...';
              let filePromise = requestImageUploadFromLocal(file, _this.webPost);

              _this.uploadingImageFile(filePromise);
            }
          }, (err) => {
            console.error('checking image exists error');
          })
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
                // get file md5 
                let fileMd5 = hasha(this.result, {
                  algorithm: 'md5'
                });
                console.log(fileMd5);
                imageExists(fileMd5).then((results) => {
                  console.log(results.length);
                  if (results.length != 0) {
                    console.log('image exist');
                    // image exist
                    let url = results[0].get('url');

                    _this.execuateCallback('insertImageLabel', url);
                  } else {
                    // image not exist
                    // read and upload image
                    _this.loading = true;
                    _this.loadingText = '准备开始上传...';

                    let filePromise = requestImageUploadFromStream(fileName, this.result, _this.webPost);
                    _this.uploadingImageFile(filePromise);

                  }
                }, (err) => {
                  console.error('checking image exists error');
                })

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
        console.log(this.settings);

        requestLogin(settings.usernamem, settings.password).then(()=>{
          // login success
          addCategory('未分类');
        },(error)=>{
          // login fail
          this.currentDialog = 'settingDialog';
          this.showDialog = true;
        })
        this.currentFileInfo.localMode = false;
      }
      // 更改标题
      this.setTitle();

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
