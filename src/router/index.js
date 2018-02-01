import Vue from 'vue'
import VueRouter from 'vue-router'

import store from '@/store/'

import Login from '@/components/Login.vue'
import Settings from '@/components/Settings.vue'
import Thread from '@/components/Thread/'
import Compose from '@/components/Compose'
import Conversations from '@/components/Conversations/'

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

export default router
