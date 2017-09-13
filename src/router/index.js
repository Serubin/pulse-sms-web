import Vue from 'vue'
import VueRouter from 'vue-router'

import Login from '@/components/Login.vue'
import Thread from '@/components/Thread.vue'
import Conversations from '@/components/Conversations.vue'

Vue.use(VueRouter)

export default new VueRouter({
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
            path: '/login',
            name: 'login',
            component: Login,
        },
    ]
})
