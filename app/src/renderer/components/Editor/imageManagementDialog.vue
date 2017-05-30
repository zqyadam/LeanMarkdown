<template>
  <el-dialog v-model="showDialog" :close-on-press-escape="true" :modal="false" :close-on-click-modal="false" size="full" @open="open" @close="close">
    <span slot="title"><i class="el-icon-z-iconfontcolor16"></i><span style="margin-left:5px;">图片管理</span></span>
    <el-table style="width: 100%;" :data="tableData" :border="true" empty-text="暂无分类数据" v-loading="loading" element-loading-text="拼命加载中" height="442">
      <el-table-column label="图片URL" property="imageURL">
        <template scope="scope">
          <el-popover placement="top-start" trigger="hover">
            <span v-text="scope.row.get('url')" slot="reference"></span>
            <img :src="scope.row.get('url')" height="auto" width="150">
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column label="所属文章" property="attributes.metaData.referedPosts">
      	<template scope="scope">
      		<div>
      			{{scope.row.attributes.metaData.referedPosts}}
      		</div>
      	</template>
      </el-table-column>
      <el-table-column label="添加日期" :formatter="rendercreatedAtRow" width="170">
      </el-table-column>
      <el-table-column label="操作" width="80">
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

import moment from 'moment/moment.js'

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
          this.filterdArr = images;
        })
      },
      close: function() {

      },
      rendercreatedAtRow: function(image) {
        return moment(image.createdAt).format("YYYY-MM-DD  H:mm:ss");
      },
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
