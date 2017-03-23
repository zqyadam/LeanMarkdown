<template>
  <div  class="previewer-container">
    <div class="paper" id="HTMLContent" v-html="HTMLContent"></div>
  </div>
</template>
<script>
import { ipcRenderer } from 'electron'

export default {
	data(){
		return {
			HTMLContent:''
		}

	},
	/*computed:{
		HTMLContent:function() {
			console.log(this.$store.HTMLContent);
			return this.$store.state.editor.HTMLContent
		}
	},*/
	mounted:function() {
		let _this = this
		ipcRenderer.on('renderMarkdownSuccess',function(event, arg) {
			// console.log(arg);
			_this.HTMLContent = arg;
		})
	}
}
</script>
<style scoped>
.paper {
  transition: all .45s cubic-bezier(0.23, 1, 0.32, 1);
  color: rgba(0, 0, 0, 0.87);
  background-color: #fff;
  box-shadow: rgba(0, 0, 0, 0.117647) 0px 1px 6px, rgba(0, 0, 0, 0.117647) 0px 1px 4px;
  border-radius: 2px;
  height: 100%;
  padding: 20px;
  margin: 0 5px;
  overflow-y: scroll;
  word-break: break-all;
}

.previewer-container {
  height: 100%;
  width: 100%;
  margin: 0px;
  overflow: hidden;
}

.b {
  border: 1px solid red;
}

/*  add  */

/*pre {
    position: relative;
    margin-bottom: 24px;
    border-radius: 3px;
    border: 1px solid #C3CCD0;
    background: #FFF;
    overflow: hidden;
}

code {
  display: block;
  padding: 12px 24px;
  overflow-y: auto;
  font-weight: 300;
  font-family: Menlo, monospace;
  font-size: 0.8em;
}

code.has-numbering {
    margin-left: 31px;
}

.pre-numbering {
    position: absolute;
    top: 0;
    left: 0;
    width: 30px;
    padding: 0px 2px 12px 0;
    border-right: 1px solid #C3CCD0;
    border-radius: 3px 0 0 3px;
    background-color: #EEE;
    text-align: right;
    font-family: Menlo, monospace;
    font-size: 0.8em;
    color: #AAA;
}*/

</style>
<style>

/*pre {
    position: relative;
    margin-bottom: 24px;
    border-radius: 3px;
    border: 1px solid #C3CCD0;
    background: #FFF;
    overflow: hidden;
}

code {
  display: block;
  padding: 12px 24px;
  overflow-y: auto;
  font-weight: 300;
  font-family: Menlo, monospace;
  font-size: 1em;
}

code.has-numbering {
    margin-left: 31px;
}

.pre-numbering {
    position: absolute;
    top: 0;
    left: 0;
    width: 30px;
    padding: 10px 2px 12px 0;
    border-right: 1px solid #C3CCD0;
    border-radius: 3px 0 0 3px;
    background-color: #EEE;
    text-align: right;
    font-family: Menlo, monospace;
    /*font-size: 1em;*/
    /*color: #AAA;*/
/*}*/

</style>