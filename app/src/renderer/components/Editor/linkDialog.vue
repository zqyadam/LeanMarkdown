<template>
  <el-dialog v-model="show" title="添加链接" :close-on-press-escape="true" @open="open" :modal="false" :close-on-click-modal="false" @close="close">
    <el-form label-width="80px" label-position="right">
      <el-form-item label="链接内容">
        <el-input v-model="linkText" :autofocus="true"></el-input>
      </el-form-item>
      <el-form-item label="链接地址">
        <el-input v-model="linkAddress"></el-input>
      </el-form-item>
      <el-form-item label="链接标题">
        <el-input v-model="linkTitle"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="confirm">确定</el-button>
      <el-button @click="cancel">取消</el-button>
    </div>
  </el-dialog>
</template>
<script>
export default {
  data() {
      return {
        linkAddress: '',
        linkText: '',
        linkTitle: '',
        modal: false
      }
    },
    props: {
      show: {
        type: Boolean,
        required: true
      },
    },
    methods: {
      cancel: function() {
        this.$parent.showDialog = false;
      },
      confirm: function() {
        let link = '[' + this.linkText + '](' + this.linkAddress + (this.linkTitle ? ' "' + this.linkTitle + '"' : '') + ')';
        this.$parent.cm.replaceSelection(link);
        this.$parent.showDialog = false;
      },
      close: function() {
        console.log('closing link dialog');
        this.linkText = '';
        this.linkTitle = '';
        this.linkAddress = '';
        this.$parent.cm.focus();
        this.$parent.showDialog = false;
      },
      open: function() {
        if (this.$parent.cm.somethingSelected()) {
          this.linkText = this.$parent.cm.getSelection();
        }
      }
    }
}
</script>
<style scoped>
</style>
