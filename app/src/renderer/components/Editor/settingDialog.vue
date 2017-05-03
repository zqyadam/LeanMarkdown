<template>
  <el-dialog v-model="showDialog" :close-on-press-escape="true" :modal="false" :close-on-click-modal="false" size="tiny" @open="open" @close="close">
    <span slot="title"><i class="el-icon-z-setting1"></i><span style="margin-left:5px;">基本设置</span></span>
    <el-form :model="settings" label-width="100px" label-position="left" ref="settingForm" style="width:100%;">
      <el-form-item label="App ID" prop="appId" :rules="[{required:true, message:'App ID不能为空'}]">
        <el-input v-model="settings.appId" placeholder="请输入App ID" type="text">
        </el-input>
      </el-form-item>
      <el-form-item label="App Key" prop="appKey" :rules="[{required:true, message:'App Key不能为空'}]">
        <el-input v-model="settings.appKey" placeholder="请输入App Key" type="text">
        </el-input>
      </el-form-item>
      <el-form-item label="登录邮箱" prop="username" :rules="[{ required: true, message: '请输入邮箱地址', trigger: 'blur' }, { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur,change' }]">
        <el-input v-model="settings.username" placeholder="请输入App ID" type="text">
        </el-input>
      </el-form-item>
      <el-form-item label="登录密码" prop="password" :rules="[{required:true, message:'密码不能为空'}, { min: 6,  message: '长度不小于6个字符', trigger: 'blur' }]">
        <el-input v-model="settings.password" placeholder="请输入App Key" type="text">
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
  initAV,
  requestLogin,
  createNewUser,
  getCurrentUser
} from '../../js/api'

export default {
  data() {

      // let checkPassword =function(rule, value,callbcak) {
      //   if (value.length <6 ) {return false}
      // }

      return {
        settings: {
          appId: '', //
          appKey: '', // 
          username: '',
          password: ''
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
          if (!validate) {
            return
          }
          // 初始化应用信息
          localStorage.setItem('settings', JSON.stringify(_this.settings));
          initAV(_this.settings);

          requestLogin(_this.settings.username, _this.settings.password).then(function(user) {
            console.log(user);
            _this.$parent.$message.success('用户：' + _this.settings.username + '登录成功！');
            _this.$parent.currentFileInfo.localMode = false;
            _this.$parent.showDialog = false;
            addCategory('未分类');
          }, function(err) {
            // 登录失败，判断失败原因
            console.log('login failed');
            console.log(err.code);
            switch (err.code) {
              case 201:
                _this.$parent.$message.error('没有提供密码，或者密码为空');
                break;
              case 202:
                _this.$parent.$message.error('用户名已经被占用');
                break;
              case 203:
                _this.$parent.$message.error('电子邮箱地址已经被占用');
                break;
              case 205:
                _this.$parent.$message.error('找不到电子邮箱地址对应的用户');
                break;
              case 210:
                _this.$parent.$message.error('用户名和密码不匹配');
                break;
              case 219:
                _this.$parent.$message.error('登录过于频繁，请在15分钟后重试！');
                break;
              case 211:
                _this.$parent.$confirm('找不到用户，是否以本次输入的邮箱和密码创建新用户？', '创建新用户', {
                  confirmButtonText: '创建新用户',
                  cancelButtonText: '不创建',
                  type: 'warning'
                }).then(function() {
                  createNewUser(_this.settings.username, _this.settings.password).then(function(user) {
                    console.log(user);
                    _this.$parent.$notify({
                        type: 'success',
                        title: '新用户创建成功',
                        message: '请牢记您的用户名和密码！\n用户名：' + _this.settings.username + '\n密码：' + _this.settings.password,
                        offset: 50
                      })
                      // 切换
                    _this.$parent.currentFileInfo.localMode = false;
                    _this.$parent.showDialog = false;
                  }, function(err) {
                    console.log('register fail');
                    console.log(err);
                    _this.$parent.$message.error('新用户创建失败，请检查网络情况！');
                    _this.$parent.showDialog = false;
                  })
                }).catch(function() {
                  _this.$parent.$message.warning('取消新用户创建');
                })

                break;
              default:
                _this.$parent.$message.error('不知名错误，(⊙﹏⊙)b')
            }
            // _this.$parent.currentFileInfo.localMode = false;
            //  _this.$parent.showDialog = false;
          })

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
          let user = getCurrentUser();
          this.settings.username = (user ? user.getUsername() : '');
          this.settings.password = '';
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
