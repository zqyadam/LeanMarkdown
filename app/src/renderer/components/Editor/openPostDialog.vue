<template>
  <el-dialog @close="close" v-model="showDialog" @open="open" :close-on-press-escape="true" :modal="false" :close-on-click-modal="false" size="large">
    <span slot="title"><i class="el-icon-z-folder-open-o"></i><span style="margin-left:5px;">打开文件</span></span>
    <el-collapse accordion v-model="activePanel">
      <el-collapse-item title="打开网络文件" name="1">
        <el-table style="width: 100%;" :data="tableData" :border="true" empty-text="暂无文章" v-loading="loading" element-loading-text="拼命加载中" height="442" @filter-change="filterCategory">
          <el-table-column property="attributes.title" label="文件名"></el-table-column>
          <el-table-column property="attributes.category.attributes.label" label="分类" width="150" :filters="categoryArr" column-key="category" :filter-multiple="false"></el-table-column>
          <el-table-column label="最近更新" width="180" :formatter="renderupdatedAtRow">
          </el-table-column>
          <el-table-column property="postOperate" label="操作" align="center" width="80">
            <template scope="scope">
              <el-button type="primary" size="small" @click="openWebPost(scope.row)">
                打开
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage" :page-sizes="[10, 20, 50, 100]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="filterdArr.length">
        </el-pagination>
      </el-collapse-item>
      <el-collapse-item title="打开本地文件" name="2">
        <el-upload class="avatar-uploader" action="" :show-file-list="false" :before-upload="openLocalFile">
          <i class="el-icon-plus avatar-uploader-icon"></i>
          <div slot="tip" class="el-upload__tip">选择本地文件进行打开</div>
        </el-upload>
      </el-collapse-item>
    </el-collapse>
  </el-dialog>
</template>
<script>
import {
  getAllPosts
} from '../../js/api'

import moment from 'moment/moment.js'

export default {
  data() {
      return {
        activePanel: '1',
        postArr: [],
        categoryArr: [],
        loading: false,
        pageSize: 10,
        currentPage: 1,
        filterdArr: []
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
        required: true
      }
    },
    methods: {
      open: function() {
        let _this = this;

        if (!_this.$parent.currentFileInfo.localMode) {
          // 网络模式
          _this.activePanel = '1'
          _this.loading = true;
          getAllPosts().then(function(posts) {
            console.log(posts);
            _this.filterdArr = _this.postArr = posts;
            // 获取分类数组
            let categoryArr = [];
            posts.forEach(function(post) {
              if (!categoryArr.includes(post.get('category').get('label'))) {
                categoryArr.push(post.get('category').get('label'))
              }
            })
            _this.categoryArr = Array.from(categoryArr, function(item) {
              return {
                text: item,
                value: item
              }
            })
            _this.loading = false;
          }, function(err) {
            this.$message({
              message: '获取文件列表失败！',
              type: 'error',
              showClose: true
            })
            console.log(err);
            _this.loading = false;
          })
          // _this.loading = false;
        } else {
          // 本地模式
          _this.activePanel = '2'
        }
      },
      close: function() {
        console.log('closing showDialog');
        this.postArr = [];
        this.$parent.showDialog = false;
        this.$parent.setTitle();
      },
      openWebPost: function(row) {
        console.log('打开网络文件:');
        this.$parent.webPost = row;
        this.$parent.cm.clearHistory();
        this.$parent.cm.setValue(row.attributes.content)
        this.$parent.cm.markClean();

        this.$message({
          message: '打开文章成功！',
          type: 'success',
          showClose: true
        })
        this.$parent.showDialog = false;
      },
      openLocalFile: function(file) {
        if (/\.(md|txt)$/i.test(file.name)) {
          // 打开本地文件
          console.log('打开本地文件');
          this.$parent.openLocalFile(file);
        }
        this.$parent.showDialog = false;
        // 禁止上传
        return false;
      },
      renderupdatedAtRow: function(post) {
        return moment(post.updatedAt).format("YYYY-MM-DD  H:mm:ss");
      },
      handleSizeChange: function(val) {
        this.pageSize = val;
      },
      handleCurrentChange(val) {
        this.currentPage = val;
      },
      filterCategory: function(filters) {
        console.log('filterChange');
        console.log(filters);
        let _this = this;

        let categoryArr;
        if (filters['category'].length == 0) {
          categoryArr = Array.from(this.categoryArr, function(item) {
            return item.value
          })
        } else {
          categoryArr = filters['category']
        }
        console.log(categoryArr);
        this.filterdArr = [];
        this.postArr.forEach(function(post) {
          if (categoryArr.includes(post.get('category').get('label'))) {
            _this.filterdArr.push(post);
          }
        })
      }
    }
}
</script>
<style scoped>
.avatar-uploader {
  text-align: center;
  margin-bottom: 5px;
}

.avatar-uploader-icon {
  cursor: pointer;
  position: relative;
  overflow: hidden;
  font-size: 38px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
}

.avatar-uploader-icon:hover {
  border-color: #20a0ff;
}
</style>
