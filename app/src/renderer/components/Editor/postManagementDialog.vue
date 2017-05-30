<template>
  <el-dialog v-model="showDialog" size="full" @open="open" @close="close" :close-on-press-escape="false">
    <span slot="title"><i class="el-icon-z-posts"></i><span style="margin-left:5px;">文章管理</span></span>
    <el-table :data="tableData" empty-text="暂无文章" v-loading="loading" element-loading-text="拼命加载中" border class="fit" @row-click="changeRow" @filter-change="filterCategory" :row-class-name="hightlightCurrentPost">
      <el-table-column label="序号" width="80" align="center">
        <template scope="scope">
          <span>{{ pageSize*(currentPage-1)+scope.$index+1}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="attributes.title" label="文件名" width="300">
      </el-table-column>
      <el-table-column prop="postCategory" label="所属分类" width="180" :filters="categoryArr" column-key="category" :filter-multiple="false">
        <template scope="scope">
          <el-select :placeholder="scope.row.get('category').get('label')" style="width:100%" @change="changePostCategory" v-model="scope.row.attributes.category">
            <!--  -->
            <el-option v-for="item in categories" :key="item.id" :label="item.get('label')" :value="item">
            </el-option>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="创建日期" width="180" :formatter="rendercreatedAtRow">
      </el-table-column>
      <el-table-column label="上次更新" width="180" :formatter="renderupdatedAtRow">
      </el-table-column>
      <el-table-column prop="attributes.content" label="文章内容" :show-overflow-tooltip="true">
      </el-table-column>
      <el-table-column label="操作" width="140">
        <template scope="scope">
          <el-button size="small" @click="editPost(scope.row)">编辑</el-button>
          <!-- @click="handleEdit(scope.$index, scope.row)" -->
          <el-button size="small" type="danger" @click="destroyPost(scope.row)">删除</el-button>
          <!-- @click="handleDelete(scope.$index, scope.row)" -->
        </template>
      </el-table-column>
    </el-table>
    <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage" :page-sizes="[10, 20, 50, 100]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="filterdArr.length">
    </el-pagination>
  </el-dialog>
</template>
<script>
import {
  getAllPosts,
  getCategories,
  savePosts,
  destoryPost
} from '../../js/api'

import {
  askSave
} from '../../js/defaultToolbar'

import moment from 'moment/moment.js'

export default {
  data() {
      return {
        loading: false,
        categories: [],
        filterdArr: [],
        postsMap: null,
        categoryArr: [],
        currentSelectedRow: {},
        changedPosts: new Set(),
        filterConditionArr: [],
        // pagination
        pageSize: 10,
        currentPage: 1
      }
    },
    computed: {
      showDialog: function() {
        return this.show;
      },
      tableData: function() {;
        let data = this.filterdArr.slice(this.pageSize * (this.currentPage - 1), this.pageSize * this.currentPage);
        return data;
      }
    },
    props: {
      show: {
        type: Boolean,
        default: false
      }
    },
    methods: {
      open: function() {
        let _this = this;

        // if (_this.$parent.allCategories.length == 0) {
        this.loading = true;
        let categoryPromise = getCategories();
        let postsPromise = getAllPosts();
        Promise.all([postsPromise, categoryPromise]).then(function(values) {
          // console.log(values);
          // 所有文章
          _this.postsMap = new Map();
          values[0].forEach(function(post) {
            _this.postsMap.set(post.id, post)
          })
          _this.filterdArr = [..._this.postsMap.values()];
          // 所有分类
          _this.categories = values[1];
          _this.categoryArr = Array.from(values[1], function(item) {
            let label = item.get('label');
            _this.filterConditionArr.push(label)
            return {
              text: label,
              value: label
            }
          })
          _this.loading = false;
        }, function(reasons) {
          // console.log(reasons);
          _this.$message({
            message: '获取文章或分类列表失败！',
            type: 'error',
            showClose: true
          })
          _this.$parent.showDialog = false;
          _this.loading = false;
        })
      },
      close: function() {
        let _this = this;
        this.loading = false;
        this.$parent.showDialog = false;
        let changedPosts = [];
        this.changedPosts.forEach((post) => {
          if (this.postsMap.has(post.id)) {
            changedPosts.push(post)
          }
        })
        // console.log(changedPosts);
        if (changedPosts.length > 0) {
          savePosts(changedPosts).then(function(savedPosts) {
            // console.log(savedPosts);
            // console.log('save posts success');
            _this.$message({
              message: '保存更改成功！',
              type: 'success',
              showClose: true
            })
          }, function(err) {
            // console.log('save posts fail');
            _this.$message({
              message: '保存更改失败！',
              type: 'error',
              showClose: true
            })
          })
        }
        this.changedPosts = new Set();
        this.postsMap = null;
        this.filterConditionArr = [];
        this.categoryArr = [];
        this.currentSelectedRow = {};
        this.loading = false;
        this.filterdArr = [];
        this.currentSelectedRow = null;
        this.categories = [];
      },
      refreshTable: function() {
        this.filterdArr = [];
        this.postsMap.forEach((post) => {
            if (this.filterConditionArr.includes(post.get('category').get('label'))) {
              this.filterdArr.push(post);
            }
          })
          // this.currentPage = 1
      },
      hightlightCurrentPost: function(row, index) {
        let currentPost = this.$parent.webPost;
        // console.log(currentPost.id == row.id);
        return (currentPost.id === row.id) ? 'currentPost' : '';
      },
      getCategoriesFromPosts: function(posts) {
        let categories = [];
        posts.forEach(function(post) {
          if (!categories.includes(post.get('category').get('label'))) {
            categories.push(post.get('category').get('label'))
          }
        })
        return categories;
      },
      rendercreatedAtRow: function(post) {
        return moment(post.createdAt).format("YYYY-MM-DD  H:mm:ss");
      },
      renderupdatedAtRow: function(post) {
        return moment(post.updatedAt).format("YYYY-MM-DD  H:mm:ss");
      },
      handleSizeChange: function(val) {
        // console.log(`每页 ${val} 条`);
        this.pageSize = val;
      },
      handleCurrentChange(val) {
        this.currentPage = val;
        // console.log(`当前页: ${val}`);
      },
      changePostCategory: function(value) {
        if (this.loading || !this.currentSelectedRow.id) {
          // console.log('refuse change cagetory');
          return
        }
        // console.log('change post category ID：' + this.currentSelectedRow.id);
        this.currentSelectedRow.set('category', this.currentSelectedRow.attributes.category);
        this.changedPosts.add(this.currentSelectedRow);
      },
      changeRow: function(row, event, column) {
        this.currentSelectedRow = row;
      },
      filterCategory: function(filters) {
        // console.log('filterChange');
        let _this = this;
        let categoryArr;
        // console.log(filters);
        if (filters['category'].length == 0) {
          categoryArr = Array.from(this.categoryArr, function(item) {
            return item.value
          })
        } else {
          categoryArr = filters['category']
        }
        // console.log(categoryArr);
        this.filterConditionArr = categoryArr;
        this.refreshTable();
      },
      editPost: function(post) {
        let currentPost = this.$parent.webPost;
        if (currentPost.id === post.id) {
          this.$parent.showDialog = false;
          return;
        }
        let _this = this.$parent;
        askSave(_this, function() {
          _this.webPost = post;
          // console.log('setting new post content');
          _this.cm.clearHistory();
          _this.cm.markClean();
          // console.log(post.get('content'));
          _this.cm.setValue(post.get('content'))
          _this.cm.focus();
          _this.currentFileInfo.filepath = '';
          _this.showDialog = false;
        })
      },
      destroyPost: function(post) {
        // console.log(post);
        let _this = this;
        this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(function() {
          let postId = post.id;
          destoryPost(post).then(function(success) {
            // console.log(success);
            _this.postsMap.delete(postId);
            _this.$message({
              message: '删除文章成功！',
              type: 'success',
              showClose: true
            })
            _this.refreshTable();
          }, function(error) {
            // console.log(error);
            _this.$message({
              message: '删除文章失败！',
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
      }
    }
}
</script>
<style scoped>
.fit {
  width: 100%;
  height: 100%;
}
</style>
<style>
.el-table .currentPost {
  background: #D3DCE6;
}
</style>
