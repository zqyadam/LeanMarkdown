<template>
  <el-dialog v-model="showDialog" :close-on-press-escape="true" :modal="false" :close-on-click-modal="false" size="full" @open="open" @close="close">
    <span slot="title"><i class="el-icon-z-category"></i><span style="margin-left:5px;">分类管理</span></span>
    <el-table style="width: 100%;" :data="tableData" :border="true" empty-text="暂无分类数据" v-loading="loading" element-loading-text="拼命加载中" height="442">
      <el-table-column label="分类名称">
        <template scope="scope">
          <el-input v-model="scope.row.attributes.label" :readonly="scope.row.attributes.label === '未分类'" @change="setNewLabel(scope.row)"></el-input>
        </template>
      </el-table-column>
      <el-table-column property="attributes.posts.length" label="文章数量" width="100" align="center">
      </el-table-column>
      <el-table-column label="最近更新" width="180" :formatter="renderupdatedAtRow">
      </el-table-column>
      <el-table-column label="创建日期" width="180" :formatter="rendercreatedAtRow">
      </el-table-column>
      <el-table-column label="操作" width="140">
        <template scope="scope">
          <template v-if="scope.row.attributes.label !== '未分类'">
            <el-button size="small" @click="saveCategory(scope.row)">保存</el-button>
            <!-- @click="handleEdit(scope.$index, scope.row)" -->
            <el-button size="small" type="danger" @click="destroyCategory(scope.row)" v-if="scope.row.attributes.label !== '未分类'">删除</el-button>
            <!-- @click="handleDelete(scope.$index, scope.row)" -->
          </template>
          <template v-else>
            <el-button size="small" style="width:100px;" type="primary" @click="addCategory">添加分类</el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>
    <!-- 添加分类对话框 -->
    <el-dialog v-model="addCategoryDialogShow" :close-on-press-escape="true" :modal="false" :close-on-click-modal="false" @close="addCategoryDialogClose">
      <span slot="title"><i class="el-icon-plus"></i><span style="margin-left:5px;">添加分类</span></span>
      <el-form label-width="100px">
        <el-form-item label="分类名称：">
          <el-input v-model.trim="newCategoryInfo.categoryName" placeholder="请输入分类名称" autofocus></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="addCategoryDialogConfirm">添加</el-button>
          <el-button @click="addCategoryDialogCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </el-dialog>
</template>
<script>
import {
  savePosts,
  addCategory,
  saveCategory,
  destroyCategory,
  getCategories,
  getCategoryPosts
} from '../../js/api'

import moment from 'moment/moment.js'

export default {
  data() {
      return {
        loading: false,
        filterdArr: [],
        categoryMap: null,
        defaultCategory: '',
        // pagination
        pageSize: 10,
        currentPage: 1,
        // add category dialog
        addCategoryDialogShow: false,
        newCategoryInfo: {
          categoryName: ''
        }
      }
    },
    computed: {
      showDialog: function() {
        return this.show;
      },
      tableData: function() {
        let data = this.filterdArr.slice(this.pageSize * (this.currentPage - 1), this.pageSize * this.currentPage);
        return data;
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
        this.loading = true;
        let categoryPromise = getCategories();
        // 获取所有分类
        getCategories().then((categories) => {
          console.log('requesting categories success');
          let postsPromise = [];
          // 构建Promise数组
          categories.forEach((category) => {
              postsPromise.push(getCategoryPosts(category))
            })
            // 发送Promise请求
          Promise.all(postsPromise).then((values) => {
            console.log('requesting Posts success');
            _this.categoryMap = new Map();
            // 初始化categoryMap
            categories.forEach((category, index) => {
              category.attributes.posts = values[index];
              _this.categoryMap.set(category.id, category);
              // 设置默认分类
              if (category.get('label') === '未分类') {
                _this.defaultCategory = category.id;
              }
            })
            _this.filterdArr = [..._this.categoryMap.values()]
            _this.loading = false;
          }).catch((err) => {
            console.log('requesting Posts fail');
            console.log(err);
            _this.loading = false;
          })
        }, (err) => {
          console.log('requesting categories fail');
          console.log(err);
          _this.loading = false;
        })
      },
      close: function() {
        this.$parent.showDialog = false;
      },
      refreshTable: function() {
        this.filterdArr = [...this.categoryMap.values()];
      },
      rendercreatedAtRow: function(post) {
        return moment(post.createdAt).format("YYYY-MM-DD  H:mm:ss");
      },
      renderupdatedAtRow: function(post) {
        return moment(post.updatedAt).format("YYYY-MM-DD  H:mm:ss");
      },
      setNewLabel: function(row) {
        console.log(row);
        row.set('label', row.get('label'))
      },
      addCategory: function() {
        this.addCategoryDialogShow = true;
      },
      saveCategory: function(row) {
        console.log(row);
        let posts = row.attributes.posts;
        saveCategory(row).then((returnedCategory) => {
          row.attributes.posts = posts;
          this.$message({
            message: '修改分类成功！',
            type: 'success',
            showClose: true
          })
        }, (err) => {
          console.log(err);
          this.$message({
            message: '修改分类失败！',
            type: 'error',
            showClose: true
          })
        })
      },
      destroyCategory: function(row) {
        let _this = this;

        this.$confirm('此操作将永久删除该分类，该分类下的所有文章将被移动到“未分类”下, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let posts = row.attributes.posts;
          let categoryID = row.id;
          destroyCategory(row).then((success) => {
            console.log(success);
            let defaultCategory = this.categoryMap.get(this.defaultCategory);
            posts.forEach((post) => {
              post.set('category', defaultCategory)
            })
            savePosts(posts).then((savedPosts) => {
              defaultCategory.attributes.posts = [...defaultCategory.attributes.posts, ...posts]
            })
            this.categoryMap.delete(categoryID);
            this.refreshTable();
            this.$message({
              message: '删除分类成功！',
              type: 'success',
              showClose: true
            })
          }, (err) => {
            console.log(err);
            this.$message({
              message: '删除分类失败！',
              type: 'error',
              showClose: true
            })
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '取消删除'
          });
        })
      },
      // 添加分类对话框的handlers
      // @close
      addCategoryDialogClose: function() {
        this.newCategoryInfo.categoryName = '';
      },
      // confirm
      addCategoryDialogConfirm: function() {
        // 分类名称不能为空
        if (this.newCategoryInfo.categoryName === '') {
          return
        }
        // 检查分类名称是否已存在
        for (let category of this.categoryMap.values()) {
          if (this.newCategoryInfo.categoryName === category.get('label')) {
            this.$message({
              message: '分类已存在，请换个名称重试！',
              type: 'warning',
              showClose: true
            });
            this.newCategoryInfo.categoryName = '';
            return;
          }
        }
        // 添加新的分类
        addCategory(this.newCategoryInfo.categoryName).then((newCategory) => {
          console.log(newCategory);
          newCategory.attributes.posts = [];
          this.categoryMap.set(newCategory.id, newCategory)
          this.refreshTable();
          this.$message({
            message: '添加分类成功！',
            type: 'success',
            showClose: true
          });
          this.addCategoryDialogShow = false;
        }, (err) => {
          console.log(err);
          this.$message({
            message: '添加分类失败！',
            type: 'error',
            showClose: true
          });
          this.addCategoryDialogShow = false;
        })
      },
      // cancel
      addCategoryDialogCancel: function() {
        this.addCategoryDialogShow = false;
      }

    }
}
</script>
<style scoped>
</style>
<!-- 
分类列表
增加分类
删除分类
修改分类名称
该分类下文章数量
 -->
