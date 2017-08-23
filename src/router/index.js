import Vue from 'vue'
import VueRouter from 'vue-router'

import Hello from '@/components/Hello.vue'
import Conversations from '@/components/Conversations.vue'

Vue.use(VueRouter)

export default new VueRouter({
    mode: "history",
    routes: [
        {
            path: '/:index',
            name: 'conversations-list',
            component: Conversations
        },
        {
            path: '/thread/:id',
            name: 'thread',
            component: Hello
        }
    ]
})
