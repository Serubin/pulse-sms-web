// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import ajax from 'vue-h-ajax';
import VuejsDialog from 'vuejs-dialog';
import App from '@/App'
import store from '@/store'
import router from '@/router'
import { i18n } from '@/utils'

import '@/lib/material.min.js'
import 'vuejs-dialog/dist/vuejs-dialog.min.css';

Vue.config.productionTip = false

Vue.use(ajax)
Vue.use(VuejsDialog)
Vue.http.withCredentials = false;

Vue.directive('mdl', {
    bind (el) {
        componentHandler.upgradeElements(el)
    }
})

new Vue({
    i18n,
    el: '#app',
    store,
    router,
    template: '<App/>',
    components: { App }
})
