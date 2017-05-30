// import AV from 'leancloud-storage'
import { AV } from './av-min.js'
import hasha from 'hasha'
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

export let getCurrentUser = function() {
  return AV.User.current();
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



export let createNewPost = function(title, content = '', category) {
  // console.log(categoryID instanceof Category);
  // 查询分类
  console.log(category);
  console.log(!(category instanceof Category));
  if (!(category instanceof Category)) {
    return addCategory(category).then(function(cat) {
      console.log(cat);
      return addPost(cat)
    }, function(err) {
      console.log('createNewPost: add category failed');
      console.log(err);
    });
  } else {
    console.log(category);
    return addPost(category);
  }

  // 创建文章
  function addPost(category) {
    let post = new Post();

    // 设置文章属性
    post.set('title', title);
    post.set('category', category);
    post.set('content', content);
    post.set('owner', AV.User.current())
      // 添加acl权限
    let acl = new AV.ACL();
    acl.setPublicReadAccess(true);
    acl.setWriteAccess(AV.User.current(), true);
    post.setACL(acl);
    console.log(post);
    return post.save();
  }
}

export let savePostWithoutData = function(postId, postTitle, postContent) {
  let post = AV.Object.createWithoutData('Post', postId);
  post.set('title', postTitle);
  post.set('content', postContent);

  return post.save();
}

export let savePost = function(post, postTitle, postContent) {
  post.set('title', postTitle);
  post.set('content', postContent);
  return post.save();
}

export let destoryPost = function(post) {
  return post.destroy();
}

export let savePosts = function(postArray) {
  return AV.Object.saveAll(postArray);
}

export let getCategoryPosts = function(category) {
  let query = new AV.Query('Post');
  query.equalTo('category', category);
  query.equalTo('owner', AV.User.current());
  return query.find();
}

export let getAllPosts = function() {
  let query = new AV.Query('Post');
  query.equalTo('owner', AV.User.current());
  query.include(['category']);
  query.descending('updatedAt');
  return query.find();
}

export let getCategories = function() {
  let query = new AV.Query('Category');
  query.equalTo('owner', AV.User.current());
  return query.find();
}


export let saveCategory = function(category) {
  return category.save();
}

export let destroyCategory = function(category) {
  return category.destroy();
}

// export let categoryExists = function(categoryName) {
//   let catQuery = new AV.Query('Category');
//   catQuery.matches('label', /[未分类]/);
//   return catQuery.find().then(function(result) {
//     return result.length !== 0;
//   });
// }


export let addCategory = function(categoryName) {
  let catQuery = new AV.Query('Category');
  let categoryNamePattern = new RegExp('^' + categoryName + '$');
  catQuery.matches('label', categoryNamePattern);
  catQuery.equalTo('owner', AV.User.current());
  return catQuery.find().then(function(result) {
    console.log(result);
    if (result.length === 0) {
      // category 不存在
      let cat = new Category();
      cat.set('label', categoryName);
      cat.set('owner', AV.User.current())
        // 添加acl权限
      let acl = new AV.ACL();
      acl.setPublicReadAccess(true);
      acl.setWriteAccess(AV.User.current(), true);
      cat.setACL(acl);
      console.log('created a new Category');
      return cat.save();
    } else {
      return result[0];
    }
  },(err)=>{
    // category 不存在
      let cat = new Category();
      cat.set('label', categoryName);
      cat.set('owner', AV.User.current())
        // 添加acl权限
      let acl = new AV.ACL();
      acl.setPublicReadAccess(true);
      acl.setWriteAccess(AV.User.current(), true);
      cat.setACL(acl);
      console.log('created a new Category');
      return cat.save();
  });

}

/**
 * 图片相关
 */

export let getAllImages = function() {
  let query = new AV.Query('_File');
  query.matches('metaData.owner', AV.User.current().id)
  return query.find();
}

/**
 * 检测服务器端图片是否已存在
 * @param  {String} md5Token md5标识
 * @return {Promise}          [description]
 */
export let imageExists = function(md5Token) {
  console.log(md5Token);
  let query = new AV.Query('_File');
  query.matches('metaData.owner', AV.User.current().id);
  query.matches('metaData.md5', md5Token);
  return query.find()
}



export let requestImageUploadFromLocal = function(fileObj, postObj = null) {
  let fileMd5 = hasha.fromFileSync(fileObj.path, {
    algorithm: 'md5'
  });

  console.log('uploading image');
  console.log(fileMd5);
  let file = new AV.File(fileObj.name, fileObj);
  file.set('md5', fileMd5)
  if (postObj !== null && postObj.id) {
    file.set('referedPost', postObj);
  } else {
    file.set('referedPost', null);
  }
  let acl = new AV.ACL();
  acl.setPublicReadAccess(true);
  acl.setWriteAccess(AV.User.current(), true);
  file.setACL(acl)
  return file;
}


export let requestImageUploadFromStream = function(filename, fileStream, postObj = null) {
  console.log('uploading image from stream');
  let fileMd5 = hasha(fileStream, {
    algorithm: 'md5'
  });
  console.log(fileMd5);
  let data = { base64: fileStream };
  let file = new AV.File(filename, data);
  file.set('md5', fileMd5)
  if (postObj !== null && postObj.id) {
    file.set('referedPost', postObj);
  } else {
    file.set('referedPost', null);
  }
  let acl = new AV.ACL();
  acl.setPublicReadAccess(true);
  acl.setWriteAccess(AV.User.current(), true);
  file.setACL(acl)
  return file
}


export let destroyImage = function(image) {
  return image.destroy();
}