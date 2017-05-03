// import AV from 'leancloud-storage'
import { AV } from './av-min.js'
// import { APP_ID, APP_KEY } from './AVConfig.js'
// in AVConfig.js
/* template
export let APP_ID = 'your_app_id';
export let APP_KEY = 'your_app_key';

*/


let Post = AV.Object.extend('Post');
let Category = AV.Object.extend('Category');

export const initAV = function(settings) {
  AV.init({
    appId: settings.appId,
    appKey: settings.appKey
  });
  // addCategory('未分类');
}

export let requestLogin = function(username, password) {
  console.log(username);
  console.log(password);
  if (!username || !password) {
    return null
  }
  return AV.User.logIn(username, password);
}

export let requestLogout = function() {
  AV.User.logOut();
}

export let isLoggedIn = function() {
  return AV.User.current() ? true : false;
}

export let createNewUser = function(username, password) {
  console.log('api: createNewUser');
  var user = new AV.User();
  // 设置用户名
  user.setUsername(username);
  // 设置密码
  user.setPassword(password);
  return user.signUp();
}



export let requestImageUploadFromLocal = function(fileObj) {
  console.log('uploading image');
  let file = new AV.File(fileObj.name, fileObj);
  // let acl = new AV.ACL();
  // acl.setPublicReadAccess(true);
  // acl.setWriteAccess(AV.User.current(), true);
  // file.setACL(acl)
  return file;
}


export let requestImageUploadFromStream = function(fileName, fileStream) {
  console.log('uploading image from stream');
  let data = { base64: fileStream };
  let file = new AV.File(fileName, data);
  // let acl = new AV.ACL();
  // acl.setPublicReadAccess(true);
  // acl.setWriteAccess(AV.User.current(), true);
  // file.setACL(acl)
  return file
}


export let createNewPost = function(title, content = '', categoryID = '') {
  // 查询分类
  let category;
  // 分类ID
  category = new AV.Object.createWithoutData('Category', categoryID)
    // 创建文章
  let post = new Post();

  // 设置文章属性
  post.fetchWhenSave(true);
  post.set('title', title);
  post.set('category', category);
  post.set('content', content);
  // post.set('owner', AV.User.current())
  // 添加acl权限
  // let acl = new AV.ACL();
  // acl.setPublicReadAccess(true);
  // acl.setWriteAccess(AV.User.current(), true);
  // post.setACL(acl);
  console.log(post);
  return post.save();
}

export let savePostWithoutData = function(postId, postTitle, postContent) {
  let post = AV.Object.createWithoutData('Post', postId);
  post.fetchWhenSave(true);
  post.set('title', postTitle);
  post.set('content', postContent);
  return post.save();
}

export let savePost = function(post, postTitle, postContent) {
  post.fetchWhenSave(true);
  post.set('title', postTitle);
  post.set('content', postContent);
  return post.save();
}

export let getAllPosts = function() {
  let query = new AV.Query('Post');
  // query.equalTo('owner', AV.User.current());
  query.include(['category']);
  return query.find();
}

export let getCategories = function() {
  let query = new AV.Query('Category');
  // query.equalTo('owner', AV.User.current());
  return query.find();
}

export let categoryExists = function(categoryName) {
  let catQuery = new AV.Query('Category');
  // catQuery.matches('category',/[未分类]/);
  catQuery.matches('category', /[未分类]/);
  return catQuery.find().then(function(result) {
    console.log(result);
    return result.length !== 0;
  });
}


export let addCategory = function(categoryName) {
  let catQuery = new AV.Query('Category');
  // catQuery.matches('category',/[未分类]/);
  catQuery.matches('category', /[未分类]/);
  return catQuery.find().then(function(result) {
    console.log(result);
    if (result.length === 0) {
      let cat = new Category();
      cat.set('category', categoryName);
      return cat.save();
    }
  });

}
