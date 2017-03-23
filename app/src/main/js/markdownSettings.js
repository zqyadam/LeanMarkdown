import marked from 'marked'
import hljs from 'highlight.js'


// console.log(hljs.listLanguages());
hljs.configure({
  tabReplace: '  ' // 2 spaces
})

var renderer = new marked.Renderer();

renderer.code = function(code, language='javascript') {
  let time1 = new Date().getTime();
  let codeContent = hljs.highlightAuto(code, [language]).value;
  let lines = codeContent.split('\n').length;
  let nums = [];
  for (var i = 0; i < lines; i++) {
    nums.push('<li>' + (i + 1) + '</li>');
  }
  nums = '<ul class="pre-numbering">' + nums.join('');
  nums += '</ul>';
  codeContent = nums + codeContent;
  let time2 = new Date().getTime();
  // console.log('code render use time:' + (time2 - time1));
  return '<pre><code class="lang-' + language + ' hljs has-numbering">' + codeContent + '</code></pre>';
}

marked.setOptions({
  renderer: renderer,
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  
});

export default marked
