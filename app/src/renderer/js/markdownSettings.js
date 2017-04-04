import marked from 'marked'
import hljs from 'highlight.js'


// console.log(hljs.listLanguages());
hljs.configure({
  tabReplace: '  ' // 2 spaces
})

let renderer = new marked.Renderer();

marked.toc = [];
renderer.listitem = function(text) {
  if (/^\s*\[[x ]\]\s*/.test(text)) {
    text = text.replace(/^\s*\[\s\]\s*/, "<input type=\"checkbox\" class=\"task-list-item-checkbox\" /> ")
      .replace(/^\s*\[x\]\s*/, "<input type=\"checkbox\" class=\"task-list-item-checkbox\" checked disabled /> ");
    return '<li style="list-style: none">' + text + '</li>';
  } else {
    return '<li>' + text + '</li>';
  }
};
renderer.heading = function(text, level) {
  var isChinese = /[\u4e00-\u9fa5]+$/.test(text);
  var id = (isChinese) ? escape(text).replace(/\%/g, "") : text.toLowerCase().replace(/[^\w]+/g, "-");

  marked.toc.push({
    level: level,
    id: id,
    text: text
  });
  return '<h' + level + ' id="' + id + '">' + text + '</h' + level + '>\n';
};

renderer.paragraph = function(text) {
  if (text.trim().match(/^\[toc\]$/i)) {
    return '<p class="markdown-toc"></p>'
  } else {
    return '<p>' + text + '</p>';
  }
}

renderer.link = function(href, title, text) {

  return '<a class="link" href="'+href+'"'+ (title?'title="'+title+'"': '') + '>'+text+'</a>'
}

// renderer.code = function(code, language) {
//   let time1 = new Date().getTime();
//   let codeContent = hljs.highlightAuto(code).value;
//   let lines = codeContent.split('\n').length;
//   let nums = [];
//   for (var i = 0; i < lines; i++) {
//     nums.push('<li>' + (i + 1) + '</li>');
//   }
//   nums = '<ul class="pre-numbering">' + nums.join('');
//   nums += '</ul>';
//   codeContent = nums + codeContent;
//   let time2 = new Date().getTime();
//   // console.log('code render use time:' + (time2 - time1));
//   return '<pre><code class="lang-' + language + ' hljs has-numbering">' + codeContent + '</code></pre>';
// }
marked.setOptions({
  renderer: renderer,
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

export default marked
