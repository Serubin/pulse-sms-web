import Vue from 'vue'
import VueRouter from 'vue-router'

import store from '@/store/'

import Login from '@/components/Login.vue'
import Settings from '@/components/Settings.vue'
import Thread from '@/components/Thread/'
import Compose from '@/components/Compose/'
import Conversations from '@/components/Conversations/'
import Blacklists from '@/components/Blacklists'

Vue.use(VueRouter)

let router = new VueRouter({
    mode: "history",
    routes: [
        {
            path: '/',
            name: 'conversations-list',
            component: Conversations,
            props: { 'archive': false, 'small': false },
        },
        {
            path: '/archived',
            name: 'conversations-list-archived',
            component: Conversations,
            props: { 'archive': true, 'small': false },
        },
        {
            path: '/thread/:threadId',
            name: 'thread',
            component: Thread,
            props: true,
        },
        {
            path: '/thread/:threadId/archived',
            name: 'thread-archived',
            component: Thread,
            props: true,
        },
        {
            path: '/compose',
            name: 'Compose',
            component: Compose,
        },
        {
            path: '/login',
            name: 'login',
            component: Login,
        },
        {
            path: '/settings',
            name: 'settings',
            component: Settings,
        },
        {
            path: '/blacklists',
            name: 'blacklists',
            component: Blacklists,
        },
    ],
})

router.beforeEach((to, from, next) => {
    if (to.name == null)
        return next({name: 'Conversations-list'});

    if (to.name == 'login')
        return next();

    if (store.state.account_id == '' )
        return next({name: 'login'});

    next();
})

// This script is a work around for github pages deployments.
// If a redirect session is created, delete and redirect
var redirect = sessionStorage.redirect;
delete sessionStorage.redirect;

if (redirect && redirect != location.href)
    router.replace(redirect.split(location.host)[1])

export default router
