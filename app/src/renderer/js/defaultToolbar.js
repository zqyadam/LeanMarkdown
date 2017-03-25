export const toolbarIcons = ['undo', 'redo', 'bold', 'italic', 'quote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'hr', 'link'];

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
  'link': 'z-module-link'
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
    // <div class="el-dialog el-dialog--small" style="border:1px solid red;">
    let HTMLContent = `
`

/*<div class="el-dialog__wrapper">
  <div class="el-dialog el-dialog--small" style="top: 15%;">
    <div class="el-dialog__header"><span class="el-dialog__title">a dialog</span>
    </div>
    <div class="el-dialog__body">
      <div>
        链接地址:
        <input type="text" value="http://" id="link"/>
      </div>
      <div>
        链接文本:
        <input type="text" value="" />
      </div>
      <button id="btnClose">close</button>
    </div>
  </div>
</div>*/
   let closeFun =  cm.openDialog(HTMLContent, function() {

    }, {
      closeOnBlur: false
    })
   document.getElementById('btnClose').onclick = function() {
   	Common.insertLabel(cm, '[]()');
    let pos = cm.getCursor('from');
    cm.setCursor({
      line: pos.line,
      ch: pos.ch - 1
    })
   	closeFun()
   }

    return
    
  },
  // 非现实命令
  t: function(cm) {
    let pos = cm.getCursor('from');
    let currentContent = cm.getLine(pos.line);
    if (currentContent.trim()[0] == '#') {
      Common.setStartLabel(cm, '#')
    } else {
      Common.setStartLabel(cm, '# ')
    }
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
