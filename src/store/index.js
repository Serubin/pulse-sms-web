import Vue from 'vue'
import Vuex from 'vuex'
import { state, mutations, actions } from './state.js'

Vue.use(Vuex)

export default new Vuex.Store({
    state,
    mutations,
    actions
})
