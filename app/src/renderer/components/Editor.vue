<template>
  <div class="main">
    <toolbar></toolbar>
    <div class="half">
      <section class="half-item">
        <mdeditor @input="inputing"></mdeditor>
      </section>
      <section class="half-item">
        <mdpreviewer></mdpreviewer>
      </section>
    </div>
  </div>
</template>
<script>
import Toolbar from './Editor/Toolbar'
import MdEditor from './Editor/MdEditor'
import MdPreviewer from './Editor/MdPreviewer'

export default {
  components: {
    toolbar: Toolbar,
    mdeditor: MdEditor,
    mdpreviewer: MdPreviewer
  },
  methods:{
  	inputing:function(content) {
  		console.log(content);
  	}
  }
}
</script>
<style scoped>
.main {
  margin: 0px;
  border: none;
  display: flex;
  flex-direction: column;
}


.half {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  justify-content: center;
  height: 100%;
}

.half-item {
  /*flex-grow: 1;*/
  /*flex-shrink:1;*/
  width: 50%;
}

.b {
  border: 1px solid blue;
}
</style>
