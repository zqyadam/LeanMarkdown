<template>
  <el-dialog @open="open" @close="close" v-model="showDialog" size="tiny" :close-on-press-escape="true" :modal="false" :close-on-click-modal="false" ref="saveDialog">
    <span slot="title"><i class="el-icon-z-save1"></i><span style="margin-left:5px;">保存文件</span></span>
    <el-form label-width="80px" label-position="top" ref="saveForm" :model="saveDialog">
      <el-form-item label="填写文章标题" prop="postTitle" :rules="[{required:true, message:'文章标题不能为空！'}]">
        <el-input v-model.trim="saveDialog.postTitle" :autofocus="true"></el-input>
      </el-form-item>
      <el-form-item label="选择文章分类" prop="postCategory" :rules="[{required:true, message:'请选择文章分类或添加新的分类！'}]">
        <el-select v-model="saveDialog.postCategory" filterable allow-create clearable placeholder="请选择文章分类或添加新的分类" style="width:100%">
          <el-option v-for="item in categories" :key="item.id" :label="item.get('label')" :value="item">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item style="text-align:center">
        <el-button type="primary" @click="savePost">保存</el-button>
        <el-button @click="$parent.showDialog = false">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>
<script>
import {
  createNewPost,
  getCategories
} from '../../js/api'
export default {
  data() {
      return {
        saveDialog: {
          postTitle: '',
          postCategory: ''
        },
        categories: [],
        activePanel: '1'
      }
    },
    computed: {
      showDialog: function() {
        return this.show;
      }
    },
    props: {
      show: {
        type: Boolean,
        required: true
      }
    },
    methods: {
      open: function() {
        let _this = this;
        console.log('opening saveDialog');
        let tocTree = _this.$parent.tocTree;
        // 初始化标题
        if (tocTree.length !== 0) {
          _this.saveDialog.postTitle = tocTree[0].text
        }
        // 获取所有分类
        getCategories().then(function(results) {
          console.log(results);
          _this.categories = results;
        }, function(err) {
          _this.$message({
            message: '获取文章分类列表失败！',
            type: 'error'
          })
        })
      },
      close: function() {
        console.log('closing save dialog');
        this.saveDialog.postTitle = '';
        this.saveDialog.postCategory = '';
        this.categories = [];
        if (this.$parent.afterSaveCallback) {
          this.$parent.afterSaveCallback();
        }
        this.$parent.showDialog = false;
        this.$parent.setTitle();
      },
      savePost: function() {
        console.log('saving to leancloud, creating a new dream');
        let _this = this;
        if (_this.$parent.savingPost) {
          _this.$message({
            message: '正在保存，请稍后重试',
            type: 'warning',
            showClose: true
          })
          return
        }

        this.$refs.saveForm.validate((valid) => {
            console.log(valid);
            if (!valid) {
              return
            }

            let postPromise = createNewPost(_this.saveDialog.postTitle, _this.$parent.cm.getValue(), _this.saveDialog.postCategory);

            _this.$parent.savingPost = true;
            postPromise.then(function(post) {
              _this.$parent.savingPost = false;
              _this.$message({
                message: '文章保存到网络成功！',
                type: 'success',
                showClose: true
              });
              _this.$parent.cm.markClean();
              _this.$parent.webPost = post;
              _this.$parent.showDialog = false;
            }, function(err) {
              _this.$message({
                message: '文章保存到网络失败！',
                type: 'error',
                showClose: true
              })
              console.log(err);
              _this.$parent.showDialog = false;
              _this.$parent.savingPost = false;
            })


          })
          // if (_this.postTitle === '') {
          //   _this.$message({
          //     message: '文章标题不能为空！',
          //     type: 'error',
          //     showClose: true
          //   })
          //   return
          // }
          // if (_this.postCategory === '') {
          //   _this.$message({
          //     message: '请选择文章分类！',
          //     type: 'error',
          //     showClose: true
          //   })
          //   return
          // }


      }
    }
}
</script>
