import Vue from 'vue'
import VueRouter from 'vue-router'

import Thread from '@/components/Thread.vue'
import Conversations from '@/components/Conversations.vue'

Vue.use(VueRouter)

export default new VueRouter({
    mode: "history",
    routes: [
        {
            path: '/',
            redirect: { name: 'conversations-list'}
        },
        {
            path: '/:index',
            name: 'conversations-list',
            component: Conversations
        },
        {
            path: '/thread/:id',
            name: 'thread',
            component: Thread
        }
    ]
})
