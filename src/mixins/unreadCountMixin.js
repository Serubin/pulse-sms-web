import store from '@/store';

export default {
    methods: {
        updateUnreadCount () {
            const conversations = store.state.session_conversations.index_public_unarchived;
            const newUnreadCount = conversations.reduce((count, conv) => count + (conv.read ? 0 : 1), 0);
            store.commit('unread_count', newUnreadCount);
        },
    },
};
