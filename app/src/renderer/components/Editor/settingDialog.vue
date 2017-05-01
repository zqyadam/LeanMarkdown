<template>
  <el-dialog v-model="showDialog" :close-on-press-escape="true" :modal="false" :close-on-click-modal="false" size="tiny" @open="open" @close="close">
    <span slot="title"><i class="el-icon-z-setting1"></i><span style="margin-left:5px;">应用设置</span></span>
    <el-form :model="settings" label-width="80px" label-position="left" ref="settingForm" style="width:100%;">
      <el-form-item label="App ID" prop="appId" :rules="[{required:true, message:'App ID不能为空'}]">
        <el-input v-model="settings.appId" placeholder="请输入App ID" type="text">
        </el-input>
      </el-form-item>
      <el-form-item label="App Key" prop="appKey" :rules="[{required:true, message:'App Key不能为空'}]">
        <el-input v-model="settings.appKey" placeholder="请输入App Key" type="text">
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="confirm" :type="!$parent.currentFileInfo.localMode? 'primary' :'default'">网络模式</el-button>
        <el-button @click="cancel" :type="$parent.currentFileInfo.localMode? 'primary' :'default'">本地模式</el-button>
      </el-form-item>
    </el-form>
    <p class="tip">请在输入LeanCloud应用的App ID及App Key后，选择“网络模式”</p>
  </el-dialog>
</template>
<script>
import {
  initAV
} from '../../js/api'

export default {
  data() {
      return {
        settings: {
          appId: '', //
          appKey: '' // 
        },
      }
    },
    computed: {
      showDialog: function() {
        return this.show;
      }
    },
    props: {
      'show': {
        type: Boolean,
        required: true
      }
    },
    methods: {
      confirm: function() {
        let _this = this;
        this.$refs.settingForm.validate(function(validate) {
          console.log(_this.settings);
          if (validate) {
            localStorage.setItem('settings', JSON.stringify(_this.settings));
            initAV(_this.settings);
            _this.$parent.currentFileInfo.localMode = false;
            _this.$parent.showDialog = false;
          }
        })
      },
      cancel: function() {
        this.$parent.currentFileInfo.localMode = true;
        this.$parent.showDialog = false;
      },
      close: function() {
        console.log('closing setting dialog');
        this.$parent.showDialog = false;
      },
      open: function() {
        let settings = localStorage.getItem('settings');
        if (settings) {
          this.settings = JSON.parse(settings);
        }
      }
    }
}
</script>
<style scoped>
.el-form {
  margin: 0 auto;
  width: 300px;
}

.tip {
  font-size: 14px;
  font-family: "微软雅黑";
  text-align: left;
  color: #888;
  text-indent: 2em;
  margin: 15px auto;
}

.el-form .el-button {
  width: 40%;
}
</style>
