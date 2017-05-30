<template>
  <el-dialog v-model="showDialog" :close-on-press-escape="true" :modal="false" :close-on-click-modal="false" size="full" @open="open" @close="close">
    <span slot="title"><i class="el-icon-z-iconfontcolor16"></i><span style="margin-left:5px;">图片管理</span></span>
    <el-table style="width: 100%;" :data="tableData" :border="true" empty-text="暂无分类数据" v-loading="loading" element-loading-text="拼命加载中" height="442">
      <el-table-column label="图片URL" property="">
        <template scope="scope">
          <span v-text="scope.row.url()"></span>
          <el-popover placement="top-start" title="标题" width="200" trigger="hover" content="这是一段内容,这是一段内容,这是一段内容,这是一段内容。">
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column label="所属文章" property="attribute.referedPosts">
      </el-table-column>
      <el-table-column label="添加日期">
      </el-table-column>
      <el-table-column label="操作">
        <template scope="scope">
          <el-button size="small" @click="deleteImage(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-dialog>
</template>
<script>
import {
  getAllImages
} from '../../js/api'

export default {
  data() {
      return {
        loading: false,
        filterdArr: [],
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
        let imagePromise = getAllImages();
        // console.log(imagePromise);
        imagePromise.then((images) => {
          console.log(images);
        })
      },
      close: function() {

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
