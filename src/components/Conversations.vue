<template>
    <div id="conversation-list">
        <conversation-item v-for="conversation in conversations" :key="conversation.device_id" :conversation_id="conversation.device_id" :timestamp="conversation.timestamp" :title="conversation.title" :snippet="conversation.snippet" :unread="conversation.read" :small="small"></conversation-item>
    </div>
</template>

<script>

import Querier from '@/query.js'
import ConversationItem from '@/components/ConversationItem.vue'

export default {
    name: 'conversations',

    mounted () {
        this.updateConversations();
    },

    methods: {
        updateConversations () {
            Querier.fetchConversations('index_unarchived')
                .then(response => {
                    this.conversations = response;
                }).catch(response => console.log(response));
        }
    },

    data () {
        return {
            conversations: [],
            small: true,
        }
    },

    components: {
        ConversationItem,
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
    @import "../assets/scss/_vars.scss";

</style>
