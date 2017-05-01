<template>
  <el-dialog :modal="false" v-model="showDialog" title="上传图片" :close-on-press-escape="true" :close-on-click-modal="false" @close="close">
    <el-upload class="avatar-uploader" :before-upload="upload" action="" :show-file-list="false" select :accept="accepts">
      <i class="el-icon-plus avatar-uploader-icon"></i>
    </el-upload>
  </el-dialog>
</template>
<script>
import {
  requestImageUploadFromLocal
} from '../../js/api.js'
export default {
  data() {
      return {
        accepts:  'image/*'
      }
    },
    computed:{
      showDialog:function() {
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
      close: function() {
        console.log('closing image dialog');
        this.$parent.showDialog = false;
        this.$parent.cm.focus();
        // this.$emit('close')
      },
      upload: function(file) {
        let filePromise = requestImageUploadFromLocal(file);
        this.$parent.uploadingImageFile(filePromise)
        // this.$emit('uploadingImageFile', filePromise);
        // this.close();
        this.$parent.showDialog = false;
        return false;
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
