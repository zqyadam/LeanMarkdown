<template>
  <el-dialog v-model="showDialog" :close-on-press-escape="true" :modal="false" :close-on-click-modal="false" size="full" @open="open" @close="close">
    <span slot="title"><i class="el-icon-z-iconfontcolor16"></i><span style="margin-left:5px;">图片管理</span></span>
    <el-table style="width: 100%;" :data="tableData" :border="true" empty-text="暂无图片数据" v-loading="loading" element-loading-text="拼命加载中" height="442">
      <el-table-column label="图片URL" property="imageURL">
        <template scope="scope">
          <el-popover placement="top-start" trigger="hover">
            <span v-text="scope.row.get('url')" slot="reference"></span>
            <img :src="scope.row.get('url')" height="auto" width="150">
          </el-popover>
        </template>
      </el-table-column>
      <!-- <el-table-column label="所属文章(首次添加所在文章)" width="300" >
      	<template scope="scope">
      		<span v-text="scope.row.attributes.metaData.referedPost?scope.row.attributes.metaData.referedPost.title:''">
      		</span>
      	</template>
      </el-table-column> -->
      <el-table-column label="添加日期" :formatter="rendercreatedAtRow" width="170">
      </el-table-column>
      <el-table-column label="操作" width="80">
        <template scope="scope">
          <el-button size="small" @click="destroyImage(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage" :page-sizes="[10, 20, 50, 100]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="filterdArr.length">
    </el-pagination>
  </el-dialog>
</template>
<script>
import {
  getAllImages,
  destroyImage
} from '../../js/api'

import moment from 'moment/moment.js'

export default {
  data() {
      return {
        loading: false,
        filterdArr: [],
        imagesMap:null,
        // pagination
        pageSize: 10,
        currentPage: 1,
      }
    },
    computed: {
      showDialog: function() {
        return this.show;
      },
      tableData: function() {
        let data = this.filterdArr.slice(this.pageSize * (this.currentPage - 1), this.pageSize * this.currentPage);
        return data;
      },

    },
    props: {
      show: {
        type: Boolean,
        required: true
      }
    },
    methods: {
      open: function() {
        let imagePromise = getAllImages();
        // console.log(imagePromise);
        imagePromise.then((images) => {
          // console.log(images);
          this.imagesMap = new Map();
          images.forEach((image) =>{
            this.imagesMap.set(image.id, image)
          })
          this.filterdArr = [...this.imagesMap.values()];
        })
      },
      close: function() {
      	this.imagesMap = null;
      	this.filterdArr = [];
      	this.loading = false;
      	this.$parent.showDialog = false;
      },
      rendercreatedAtRow: function(image) {
        return moment(image.createdAt).format("YYYY-MM-DD  H:mm:ss");
      },
      handleSizeChange: function(val) {
        // console.log(`每页 ${val} 条`);
        this.pageSize = val;
      },
      handleCurrentChange(val) {
        this.currentPage = val;
        // console.log(`当前页: ${val}`);
      },
      destroyImage:function(image) {
      	// console.log(image);
        let _this = this;
        this.$confirm('此操作将永久删除该图片, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(function() {
          let imageId = image.id;
          destroyImage(image).then(function(success) {
            // console.log(success);
            _this.imagesMap.delete(imageId);
            _this.$message({
              message: '删除图片成功！',
              type: 'success',
              showClose: true
            })
            _this.filterdArr = [..._this.imagesMap.values()];
          }, function(error) {
            // console.log(error);
            _this.$message({
              message: '删除图片失败！',
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
</style>
<!-- 
url
所属文章（标题）
添加日期
操作（删除）
 -->
