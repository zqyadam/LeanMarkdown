<template>
  <div class="fit">
    <div id="container">
      <img src="../images/MarkdownLogo.jpg" alt="mdlogo">
      <el-form :model="settings" label-width="80px" label-position="left" ref="settingForm">
        <el-form-item label="App ID" prop="appId" :rules="[{required:true, message:'App ID不能为空'}]">
          <el-input v-model="settings.appId" placeholder="请输入App ID" type="password">
          </el-input>
        </el-form-item>
        <el-form-item label="App Key" prop="appKey" :rules="[{required:true, message:'App Key不能为空'}]">
          <el-input v-model="settings.appKey" placeholder="请输入App Key" type="password">
          </el-input>
        </el-form-item>
        <p>请输入LeanCloud应用的App ID及App Key</p>
        <el-form-item>
          <el-button @click="login" type="primary">确定</el-button>
          <el-button @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
export default {
  data() {
      return {
        settings: {
          appId: 'KYkddmR5GLXnD15sR7loC42p-gzGzoHsz',
          appKey: 'FEBSUHwgfS2QHQKfHT1dikH7'
        }
      }
    },
    methods: {
      login: function() {
        let _this = this;
        this.$refs.settingForm.validate(function(validate) {
          console.log(_this.settings);
          if (validate) {
            localStorage.setItem('settings', JSON.stringify(_this.settings))
            _this.$router.push({
              name: 'editor'
            })
          }
        })
      },
      reset: function() {
        this.$refs['settingForm'].resetFields();
      }
    }
}
</script>
<style scoped>
.fit {
  width: 100%;
  height: 100%;
  background: url(../images/LoginBackgroundImage.png) center center;
  background-size: cover;
  position: relative;
}

#container {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  text-align: center;
}

#container img {
  width: 200px;
  border-radius: 50%;
  border: 1px solid #fff;
  background-color: #fff;
  margin-bottom: 20px;
}

.el-form {
  margin: 0 auto;
  width: 300px;
}

.el-form p {
  font-size: 14px;
  font-family: "微软雅黑";
  text-align: center;
  margin: 15px auto;
}

.el-form .el-button {
  width: 100px;
}
</style>
