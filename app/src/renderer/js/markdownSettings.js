import marked from 'marked'
import hljs from 'highlight.js'


console.log(hljs.listLanguages());
hljs.configure({
  tabReplace: '  ' // 4 spaces
})

var renderer = new marked.Renderer();

renderer.code = function(code, language) {
  let codeContent = hljs.highlightAuto(code).value;
  let lines = codeContent.split('\n').length;
  let nums = [];
  for (var i = 0; i< lines; i++) {
    // nums += '<li>'+(i+1)+'</li>';
    nums.push('<li>'+(i+1)+'</li>');
  }
  nums = '<ul class="pre-numbering">' + nums.join('');
  nums += '</ul>';
  codeContent = nums + codeContent;

  return'<pre><code class="lang-'+language+' hljs has-numbering">'+codeContent+'</code></pre>';
}

marked.setOptions({
  renderer: renderer,
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  // highlight: function(code) {
  //   // console.log(code);
  //   return hljs.highlightAuto(code).value;
  // }

});

export default marked
