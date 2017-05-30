<template>
  <el-dialog :modal="false" v-model="showDialog" title="上传图片" :close-on-press-escape="true" :close-on-click-modal="false" @close="close">
    <el-upload class="avatar-uploader"  action="" :show-file-list="false" select :accept="accepts"  ref="uploader" :http-request="upload">
    <!-- :before-upload="upload" -->
      <i class="el-icon-plus avatar-uploader-icon"></i>
    </el-upload>
  </el-dialog>
</template>
<script>
import {
  requestImageUploadFromLocal,
  imageExists
} from '../../js/api.js'

import hasha from 'hasha'

export default {
  data() {
      return {
        accepts: 'image/*'
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
      close: function() {
        console.log('closing image dialog');
        this.$parent.currentDialog = '';
        this.$parent.showDialog = false;
        this.$parent.cm.focus();
      },
      upload: function(req) {
        console.log(req);
        // get file md5 
        let file = req.file;        
        let fileMd5 = hasha.fromFileSync(file.path, {
          algorithm: 'md5'
        });

        imageExists(fileMd5).then((results) => {
          console.log(results.length);
          if (results.length != 0) {
            console.log('image exist');
            // image exist
            let url = results[0].get('url');

            this.$parent.execuateCallback('insertImageLabel', url);
          } else {
            // image not exist
            // read and upload image
            this.$parent.loading = true;
            this.$parent.loadingText = '准备开始上传...';
            let filePromise = requestImageUploadFromLocal(file);
            this.$parent.uploadingImageFile(filePromise)
          }
        }, (err) => {
          console.error('checking image exists error');
        })
        this.$parent.showDialog = false;   
      }
    },

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
