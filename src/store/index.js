import Vue from 'vue';
import Vuex from 'vuex';
import { state, getters, mutations, actions } from '@/store/state.js';
import plugins from '@/store/plugins.js';

Vue.use(Vuex);

export default new Vuex.Store({
    state,
    getters,
    mutations,
    actions,
    plugins,
});
