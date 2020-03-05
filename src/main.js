// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import VuejsDialog from 'vuejs-dialog';
import App from '@/App';
import store from '@/store';
import router from '@/router';
import { i18n, Util } from '@/utils';
import bugsnag from '@bugsnag/js';
import bugsnagVue from '@bugsnag/plugin-vue';

import 'vuejs-dialog/dist/vuejs-dialog.min.css';
import 'vue-search-select/dist/VueSearchSelect.css';
import '@/lib/dialog.min.css';
import { componentHandler } from '@/lib/material.js';

Vue.config.productionTip = false;

if (!Util.isDevMode()) {
    const bugsnagClient = bugsnag('c9e7daf16e171be27f206895b77cee70');
    bugsnagClient.use(bugsnagVue, Vue);
}

Vue.use(VuejsDialog);

Vue.directive('mdl', {
    bind (el) {
        componentHandler.upgradeElements(el);
    }
});

new Vue({
    i18n,
    el: '#app',
    store,
    router,
    components: { App },
    template: '<App/>'
});
