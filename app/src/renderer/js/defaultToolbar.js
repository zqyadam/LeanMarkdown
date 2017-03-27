import { requestImageUploadFromLocal } from './api.js'

export const toolbarIcons = ['undo', 'redo', 'bold', 'italic', 'quote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'hr', 'link', 'image'];

export const toolbarIconsClass = {
  'undo': 'z-undo',
  'redo': 'z-redo',
  'bold': 'z-bold',
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
  'image': 'z-tupian'
}

export const toolbarIconTips = {
  'undo': '撤销(Ctrl+Z)',
  'redo': '重做',
  'bold': '加粗',
  'italic': '斜体',
  'quote': '引用',
  'h1': '标题1',
  'h2': '标题2',
  'h3': '标题3',
  'h4': '标题4',
  'h5': '标题5',
  'h6': '标题6',
  'ul': '无序列表',
  'ol': '有序列表',
  'hr': '横线',
  'link': '链接',
  'image': '图片'
}
export const toolbarHandlers = {
  undo: function(cm) {
    cm.undo();
  },
  redo: function(cm) {
    cm.redo()
  },
  bold: function(cm) {
    Common.setWrapLabel(cm, '**')
  },
  italic: function(cm) {
    Common.setWrapLabel(cm, '*')
  },
  quote: function(cm) {
    Common.setStartLabel(cm, '> ')
  },
  h1: function(cm) {
    Common.setStartLabel(cm, '# ')
  },
  h2: function(cm) {
    Common.setStartLabel(cm, '## ')
  },
  h3: function(cm) {
    Common.setStartLabel(cm, '### ')
  },
  h4: function(cm) {
    Common.setStartLabel(cm, '#### ')
  },
  h5: function(cm) {
    Common.setStartLabel(cm, '##### ')
  },
  h6: function(cm) {
    Common.setStartLabel(cm, '###### ')
  },
  ul: function(cm) {
    Common.setStartLabel(cm, '- ')
  },
  ol: function(cm) {
    Common.setStartLabel(cm, '1. ')
  },
  hr: function(cm) {
    Common.insertLabel(cm, '\n\n------\n\n')
  },
  link: function(cm, _this) {
    let defaultText = ''
    if (cm.somethingSelected()) {
      defaultText = cm.getSelection();
      // cm.replaceSelection('[' + selection + ']()')
    }
    // Common.insertLabel(cm, '[]()');
    let dialog = {
      show: true,
      title: '插入链接',
      formElements: [{
        //Input、Select、Checkbox、Radio、Switch
        label: '链接地址:',
        type: 'input',
        value: 'http://'
      }, {
        label: '链接内容',
        type: 'input',
        value: defaultText
      }],
      formButtons: [{
        text: '取消',
        type: 'text',
        handler: function() {
          _this.hideDialog();
        }
      }, {
        text: '确定',
        type: 'primary',
        handler: function() {
          let url = dialog.formElements[0].value;
          let urlText = dialog.formElements[1].value;
          let link = '[' + urlText + '](' + url + ')';
          cm.replaceSelection(link)
          _this.hideDialog();
        }
      }]
    }
    _this.showDialog(dialog);
  },
  image: function(cm, _this) {
    let dialog = {
      show: true,
      title: '上传图片',
      showClose: false,
      formElements: [{
        type: 'file',
        accept: 'image/jpeg, image/jpg, image/png, image/bmp',
        handler: function(file) {
          console.log('image this');
          console.log(file);
          let filePromise = requestImageUploadFromLocal(file);
          // add progress 
          // _this.$set(_this.dialogInfo, 'progress', 0)
          _this.loading = true;
          _this.loadingText = '准备开始上传...';
          filePromise.save({
            onprogress: function(e) {
              // change progress
              // _this.dialogInfo.progress = parseInt(e.percent);
              if (parseInt(e.percent) === 100) {
                _this.loadingText = '即将上传完成... \\(^o^)/';
              } else {
                _this.loadingText = '拼命上传中，已上传' + parseInt(e.percent) + '%';
              }
            }
          }).then(function(file) {
            console.log('uploaded file info');
            console.log(file);

            let url = file.url();

            if (cm.somethingSelected()) {
              let selection = cm.getSelection();
              let mdImage = '![' + selection + '](' + url + ')';
              cm.replaceSelection(mdImage);
            } else {
              let mdImage = '![](' + url + ')';
              let pos = cm.getCursor('from');
              cm.replaceRange(mdImage, pos);
              cm.setCursor({
                line: pos.line,
                ch: pos.ch + 2
              });
              cm.replaceSelection('图像描述', 'around');
            }

            // when success, delete progress
            // delete _this.dialogInfo.progress;
            _this.hideDialog();
            _this.loading = false;
          }, function(err) {
            _this.hideDialog();
            _this.loading = false;
            console.log(err);
          })
          return false;
          // return new Promise(function() {},function() {});
        }
      }]
    }
    _this.showDialog(dialog);
    // console.log(dialog);
    // let file = dialog.showOpenDialog({
    //   title: '选择图片',
    //   filters: [{ name: '图片', extensions: ['jpg', 'png', 'gif', 'bmp'] }],
    //   properties: ['openFile']
    // })
    // console.log(file[0]);

  },
  // 不显示在工具栏的命令，仅支持快捷键
  t: function(cm) { // Ctrl+T
    let pos = cm.getCursor('from');
    let currentContent = cm.getLine(pos.line);
    if (currentContent.trim()[0] == '#') {
      Common.setStartLabel(cm, '#')
    } else {
      Common.setStartLabel(cm, '# ')
    }
  },
  linkWithoutDialog: function(cm) { // Ctrl+Shift+L
    if (cm.somethingSelected()) {
      let selection = cm.getSelection();
      cm.replaceSelection('[' + selection + ']()')
    } else {
      Common.insertLabel(cm, '[]()');
    }
    let pos = cm.getCursor();
    cm.setCursor({
      line: pos.line,
      ch: pos.ch - 1
    })
  }
}



let Common = (function() {
  /* 设置包围标签 */
  function setWrapLabel(cm, wrapLabel) {
    let pos = cm.getCursor('from');
    if (cm.somethingSelected()) { // 存在选中文本
      let selection = cm.getSelection();
      let replaceContent = wrapLabel + selection + wrapLabel
      cm.replaceSelection(replaceContent)
    } else { // 没有选中文本
      cm.replaceSelection(wrapLabel + wrapLabel, 'start')
      cm.setCursor(pos.line, pos.ch + wrapLabel.length)
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


/*

dialog format
a full dialog 
{
  show: true,
  title: '插入链接',
  formElements: [{
      //Input、Select、Checkbox、Radio、Switch
      label: '链接地址:',
      type: 'input',
      value: 'http://'
    }, {
      label: '链接内容',
      type: 'input',
      value: defaultText
    },
    {
      type: 'select',
      value: '',
      label: '选择地址:',
      options: [{
        label: 'label 1',
        value: 'shanghai'
      }, {
        label: 'label 2',
        value: 'beijing'
      }]
    }
  ],
  formButtons: [{
    text: '取消',
    type: 'text',
    handler: function() {
      console.log('btn cancel clicked');
      _this.hideDialog();
    }
  }, {
    text: '确定',
    type: 'primary',
    handler: function() {
      console.log('btn confirm clicked');
      console.log(defaultText);
      console.log('url:' + dialog.formElements[0].value);
      console.log('url text:' + dialog.formElements[1].value);
      let url = dialog.formElements[0].value;
      let urlText = dialog.formElements[1].value;
      let link = '[' + urlText + '](' + url + ')';
      cm.replaceSelection(link)
      _this.hideDialog();

    }
  }]
}




*/
