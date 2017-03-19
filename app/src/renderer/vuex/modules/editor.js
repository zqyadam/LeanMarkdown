import * as types from '../mutation-types'
import marked from '../../js/markdownSettings.js'

const state = {
  MdContent: ''
}

const mutations = {
  [types.UPDATE_CONTENT](state, content) {
    state.MdContent = content
  }
}


const getters = {
  convertedContent(state) {
    let content = marked(state.MdContent);
    return content;
  }

}

const actions = {
  updateContent({ commit }, RawContent) {
    commit(types.UPDATE_CONTENT, RawContent);
  }
}

export default {
  state,
  mutations,
  getters,
  actions
}
