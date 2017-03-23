import * as types from '../mutation-types'
import marked from '../../js/markdownSettings.js'

const state = {
  MdContent: '',
  HTMLContent: ''
}

const mutations = {
  [types.UPDATE_CONTENT](state, content) {
    state.MdContent = content.RawContent
    state.HTMLContent = content.HTMLContent
  }
}


// const getters = {
//   convertedContent(state) {
//     let content = marked(state.MdContent);
//     return content;
//   }

// }

const actions = {
  updateContent({ commit }, RawContent) {
    setTimeout(function() {
      let time1 = new Date().getTime();
      let HTMLContent = marked(RawContent);
      let time2 = new Date().getTime();
      console.log('markdown render use time:' + (time2 - time1));
      commit(types.UPDATE_CONTENT, { 'RawContent': RawContent, 'HTMLContent': HTMLContent });
    }, 1000)
  }
}

export default {
  state,
  mutations,
  // getters,
  actions
}
