import Vue from 'vue'
import Router from 'vue-router'
import Conversations from '@/components/Conversations.vue'

Vue.use(Router)

export default new Router({
    routes: [
        {
            path: '/',
            name: 'conversations-list',
            component: Conversations
        }
    ]
})
