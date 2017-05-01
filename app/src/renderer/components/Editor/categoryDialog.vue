<template>
	<el-dialog v-model="showDialog" :close-on-press-escape="true" :modal="false" :close-on-click-modal="false" size="full" @open="open" @close="close">
		 <span slot="title"><i class="el-icon-z-category"></i><span style="margin-left:5px;">分类管理</span></span>
	</el-dialog>	
</template>
<script>
export default {
	data(){
		return {

		}
	},
	computed:{
		showDialog:function() {
			return this.show;
		}
	},
	props:{
		show:{
			type:Boolean,
			required:true
		}
	},
	methods:{

	}
}
	
</script>
<style scoped>
	
</style>