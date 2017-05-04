import { requestImageUploadFromLocal, createNewPost } from './api.js'
import NProgress from 'nprogress/nprogress.js'


const fs = require('fs');
const {
  dialog
} = require('electron').remote;

export const toolbar = ['newFile', 'openFile', 'saveFile', 'split', 'undo', 'redo', 'bold', 'del', 'italic', 'quote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'hr', 'link', 'image', 'table', 'inlineCode', 'blockCode', 'split', 'previewMode', 'editMode', 'readMode', 'exchange', 'help'];

export const toolbarIconsClass = {
  'newFile': 'z-file-o',
  'openFile': 'z-folder-open-o',
  'saveFile': 'z-save1',
  'undo': 'z-undo',
  'redo': 'z-redo',
  'bold': 'z-bold',
  'del': 'z-shanchuxian',
  'italic': 'z-italic',
  'quote': 'z-yinyong',
  'h1': 'z-h',
  'h2': 'z-h1',
  'h3': 'z-h3',
  'h4': 'z-h2',
  'h5': 'z-h5',
  'h6': 'z-h4',
  'ul': 'z-wuxuliebiao1',
  'ol': 'z-youxuliebiao',
  'hr': 'z-hengxian',
  'link': 'z-module-link',
  'image': 'z-tupian',
  'table': 'z-table',
  'inlineCode': 'z-ai-code',
  'blockCode': 'z-daimakuai',
  'previewMode': 'z-shuanglan',
  'editMode': 'z-bianji',
  'readMode': 'z-computer',
  'exchange': 'z-exchange',
  'help': 'z-help'
}

export const toolbarIconTips = {
  'newFile': '新建网络文章',
  'openFile': '打开文章',
  'saveFile': '保存文章',
  'undo': '撤销(Ctrl+Z)',
  'redo': '重做',
  'bold': '加粗(Ctrl+B)',
  'del': '删除线',
  'italic': '斜体(Ctrl+I)',
  'quote': '引用(Ctrl+Q)',
  'h1': '标题1(Ctrl+1)',
  'h2': '标题2(Ctrl+2)',
  'h3': '标题3(Ctrl+3)',
  'h4': '标题4(Ctrl+4)',
  'h5': '标题5(Ctrl+5)',
  'h6': '标题6(Ctrl+6)',
  'ul': '无序列表(Ctrl+Shift+U)',
  'ol': '有序列表(Ctrl+Shift+O)',
  'hr': '横线(Ctrl+H)',
  'link': '链接(Ctrl+L或Ctrl+Shift+L)',
  'image': '图像(Ctrl+Shift+P)',
  'table': '表格',
  'inlineCode': '行内代码(Ctrl+K)',
  'blockCode': '代码块(Ctrl+Shift+K)',
  'previewMode': '实时预览',
  'editMode': '编辑模式',
  'readMode': '阅读模式',
  'exchange': '左右交换',
  'help': '使用帮助'
}
export const toolbarHandlers = {
  newFile: function(_this) {
    askSave(_this, function() {
      _this.cm.setValue('');
      _this.cm.clearHistory();
      _this.cm.markClean();
      let pos = _this.cm.getCursor();
      _this.cm.replaceSelection('# \n\n');
      _this.cm.setCursor({ line: pos.line, ch: pos.ch + 2 });
      _this.cm.focus();
      _this.webPost = {};
      _this.currentFileInfo.filepath = '';
      _this.setTitle();
    })
  },
  openFile: function(_this) {
    askSave(_this, function() {
      console.log('显示打开文件对话框');
      _this.currentDialog = 'openPostDialog'
      _this.showDialog = true;
    })
  },
  saveFile: function(_this) {
    console.log(_this.currentFileInfo.localMode);
    if (!_this.currentFileInfo.localMode) {
      // 网络模式
      if (_this.webPost.id) {
        // 网上已存在
        savePost(_this);
      } else {
        // 网上不存在
        _this.$confirm('请选择保存位置', '保存文件', {
          confirmButtonText: '保存到网络',
          cancelButtonText: '保存到本地',
          showClose: false,
          type: 'info'
        }).then(() => {
          savePost(_this);
        }).catch(() => {
          saveLocalFile(_this)
        })
      }
    } else {
      // 本地模式
      saveLocalFile(_this)
    }
  },
  undo: function(_this) {
    _this.cm.undo();
  },
  redo: function(_this) {
    _this.cm.redo()
  },
  bold: function(_this) {
    Common.setWrapLabel(_this.cm, '**');
    _this.cm.focus();
  },
  del: function(_this) {
    Common.setWrapLabel(_this.cm, '~~');
    _this.cm.focus();
  },
  italic: function(_this) {
    Common.setWrapLabel(_this.cm, '*')
    _this.cm.focus();
  },
  quote: function(_this) {
    Common.setStartLabel(_this.cm, '> ')
    _this.cm.focus();
  },
  h1: function(_this) {
    Common.setStartLabel(_this.cm, '# ')
    _this.cm.focus();
  },
  h2: function(_this) {
    Common.setStartLabel(_this.cm, '## ')
    _this.cm.focus();
  },
  h3: function(_this) {
    Common.setStartLabel(_this.cm, '### ')
    _this.cm.focus();
  },
  h4: function(_this) {
    Common.setStartLabel(_this.cm, '#### ')
    _this.cm.focus();
  },
  h5: function(_this) {
    Common.setStartLabel(_this.cm, '##### ')
    _this.cm.focus();
  },
  h6: function(_this) {
    Common.setStartLabel(_this.cm, '###### ')
    _this.cm.focus();
  },
  ul: function(_this) {
    Common.setStartLabel(_this.cm, '- ')
    _this.cm.focus();
  },
  ol: function(_this) {
    Common.setStartLabel(_this.cm, '1. ')
    _this.cm.focus();
  },
  hr: function(_this) {
    Common.insertLabel(_this.cm, '\n\n------\n\n')
    _this.cm.focus();
  },
  link: function(_this) {
    _this.currentDialog = 'linkDialog'
    _this.showDialog = true;
  },
  image: function(_this) {
    _this.currentDialog = 'imageDialog';
    _this.showDialog = true;
  },
  table: function(_this) {
    _this.currentDialog = 'tableDialog'
    _this.showDialog = true;
  },
  inlineCode: function(_this) {
    Common.setWrapLabel(_this.cm, '\`');
    _this.cm.focus();
  },
  blockCode: function(_this) {
    let defaultLang = 'javascript'
    if (_this.cm.somethingSelected()) {
      let pos = _this.cm.getCursor('from');
      Common.setWrapLabel(_this.cm, '\`\`\`' + defaultLang + '\n', '\n\`\`\`');
      _this.cm.setSelection({ line: pos.line, ch: 3 }, { line: pos.line, ch: 3 + defaultLang.length })
    } else {
      let pos = _this.cm.getCursor('start');
      let lineContent = _this.cm.getLine(pos.line);
      if (lineContent.trim()) { // 如果当前行有内容
        _this.cm.setCursor({ line: pos.line + 1, ch: 0 }); // 鼠标设置到下一行头
        Common.setWrapLabel(_this.cm, '\`\`\`' + defaultLang + '\n', '\n\`\`\`\n'); //插入标签
        _this.cm.setSelection({ line: pos.line + 1, ch: 3 }, { line: pos.line + 1, ch: 3 + defaultLang.length })
      } else { //当前行无内容
        Common.setWrapLabel(_this.cm, '\`\`\`' + defaultLang + '\n', '\n\`\`\`\n');
        _this.cm.setSelection({ line: pos.line, ch: 3 }, { line: pos.line, ch: 3 + defaultLang.length })
      }
    }
    _this.cm.focus();
  },
  previewMode: function(_this) {
    _this.readShow = true;
    _this.readWidth = 50;
    _this.editShow = true;
    _this.editWidth = 50;
  },
  editMode: function(_this) {
    _this.editShow = true;
    _this.readShow = false;
    _this.editWidth = 100;
  },
  readMode: function(_this) {
    _this.readShow = true;
    _this.editShow = false;
    _this.readWidth = 100;
  },
  exchange: function(_this) {
    _this.layoutDirection = !_this.layoutDirection;
    _this.cm.focus();
  },
  settings: function(_this) {
    _this.currentDialog = 'settingDialog';
    _this.showDialog = true;
  },
  // 不显示在工具栏的命令，仅支持快捷键
  t: function(_this) { // Ctrl+T
    let pos = _this.cm.getCursor('from');
    let currentContent = _this.cm.getLine(pos.line);
    if (/^[#]{6}/.test(currentContent)) {
      return
    }

    if (currentContent.trim()[0] == '#') {
      Common.setStartLabel(_this.cm, '#')
    } else {
      Common.setStartLabel(_this.cm, '# ')
    }
    _this.cm.focus();
  },
  linkWithoutDialog: function(_this) { // Ctrl+Shift+L
    if (_this.cm.somethingSelected()) {
      let selection = _this.cm.getSelection();
      _this.cm.replaceSelection('[' + selection + ']()')
    } else {
      Common.insertLabel(_this.cm, '[]()');
    }
    let pos = _this.cm.getCursor();
    _this.cm.setCursor({
      line: pos.line,
      ch: pos.ch - 3
    })
    _this.cm.focus();
  },

  // 向后添加行
  addNewLineAppend: function(_this) { // Ctrl+Enter
    let pos = _this.cm.getCursor();
    _this.cm.setCursor({ line: pos.line + 1, ch: 0 });
    _this.cm.replaceSelection('\n', 'start');
    _this.cm.setCursor({ line: pos.line + 1, ch: 0 });
  },
  // 向前添加行
  addNewLinePrepend: function(_this) { // Ctrl+Shift+Enter
    let pos = _this.cm.getCursor();
    _this.cm.setCursor({ line: pos.line, ch: 0 });
    _this.cm.replaceSelection('\n', 'start');
  }
}



let Common = (function() {
  /* 设置包围标签 */
  function setWrapLabel(cm, startLabel, endLabel = undefined) {
    if (!endLabel) {
      endLabel = startLabel;
    }
    let pos = cm.getCursor('from');
    if (cm.somethingSelected()) { // 存在选中文本
      let selection = cm.getSelection();
      let replaceContent = startLabel + selection + endLabel
      cm.replaceSelection(replaceContent)
    } else { // 没有选中文本
      cm.replaceSelection(startLabel + endLabel, 'start')
      cm.setCursor(pos.line, pos.ch + startLabel.length)
    }
  }
  /* 设置标题 */
  function setStartLabel(cm, startLabel) {
    let pos = cm.getCursor('from');
    cm.replaceRange(startLabel, {
      line: pos.line,
      ch: 0
    })
  }
  /* 设置标题 */
  function insertLabel(cm, label) {
    let pos = cm.getCursor('from');
    cm.replaceRange(label, pos)
    return pos;
  }

  // 返回模块
  return {
    setWrapLabel: setWrapLabel,
    setStartLabel: setStartLabel,
    insertLabel: insertLabel
  }
})()


/**
 * _this: Editor实例
 * cb: 询问后执行的回调函数
 */
export function askSave(_this, cb) {
  if (_this.cm.getValue().trim() !== '' && (!_this.cm.isClean() || !_this.webPost.id)) {
    console.log('询问是否保存当前文件！');
    _this.$confirm('是否保存当前文件？', '保存文件', {
      confirmButtonText: '保存',
      cancelButtonText: '不保存',
      type: 'warning',
      showClose: false,
      callback: function(action, instance) {
        // 保存
        if (action === 'confirm') {
          savePost(_this, cb)
        }
        // 不保存
        if (action === 'cancel') {
          cb()
        }
      }
    })
  } else {
    // 文件没有内容或者没有过修改
    console.log('文件没有内容或者没有过修改');
    if (cb) { cb() }
  }

}

// 保存文章，在新建网络文章时会显示"保存文章对话框"
function savePost(_this, cb) {
  if (_this.savingPost) {
    _this.$message({
      message: '正在保存，请稍后重试',
      type: 'warning',
      showClose: true
    })
    return
  }
  let postTitle = '未命名'; // 默认名称
  let postContent = _this.cm.getValue();
  if (_this.tocTree.length !== 0) {
    postTitle = _this.tocTree[0].text
  }
  if (!_this.currentFileInfo.localMode) {
    // 网络模式
    if (_this.webPost.id) {
      // 网上存在，直接保存
      let post = _this.webPost;
      post.set('title', postTitle)
      post.set('content', postContent)
        // _this.currentDialog = 'savePostDialog'
        // _this.showDialog = true;
      post.save({ fetchWhenSave: true }).then(function(post) {
        // _this.showDialog = false;
        _this.webPost = post;
        _this.cm.markClean();
        _this.$message({
          message: '文章保存到网络成功！',
          type: 'success',
          showClose: true
        });
        cb();
      }, function(err) {
        _this.$message({
          message: '文章保存到网络失败！',
          type: 'error',
          showClose: true
        })
        _this.showDialog = false;
      })
    } else {
      // 新建文章并保存
      _this.afterSaveCallback = cb
      _this.currentDialog = 'savePostDialog'
      _this.showDialog = true;
    }
  } else {
    // 本地模式
    saveLocalFile(_this);
    cb();
  }

}

// 保存文件
function saveLocalFile(_this) {

  if (!_this.currentFileInfo.filepath) {
    let saveFilePath = dialog.showSaveDialog({
      title: '保存到本地',
      filters: [{
        name: 'Makrdown',
        extensions: ['md', 'txt'],
      }, {
        name: '所有文件',
        extensions: ['*']
      }]
    })
    _this.currentFileInfo.filepath = saveFilePath ? saveFilePath : '';
  }
  if (_this.currentFileInfo.filepath) {
    console.log('saving local file');
    NProgress.start()
    NProgress.set(0.2)
    NProgress.set(0.4)
    let fileContent = _this.cm.getValue();
    NProgress.set(0.6)
    fs.writeFileSync(_this.currentFileInfo.filepath, fileContent, 'utf8');
    NProgress.done();
    _this.$message({
      message: '文章保存到本地成功！',
      type: 'success',
      showClose: true
    });
  }
}
