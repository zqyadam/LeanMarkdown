<template>
  <el-dialog v-model="showDialog" :close-on-press-escape="true" :modal="false" :close-on-click-modal="false" size="full" @open="open" @close="close">
    <span slot="title"><i class="el-icon-z-category"></i><span style="margin-left:5px;">分类管理</span></span>
    <el-table style="width: 100%;" :data="tableData" :border="true" empty-text="暂无文章" v-loading.body="loading" element-loading-text="拼命加载中" height="442" @filter-change="filterCategory">
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
  </el-dialog>
</template>
<script>
export default {
  data() {
      return {

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

      },
      close: function() {
        this.$parent.showDialog = false;
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


