<template>
    <div id="conversation-list">
        <spinner v-if="conversations.length == 0"></spinner>
        <conversation-item v-for="conversation in conversations" :key="conversation.device_id" :conversation_id="conversation.device_id" :timestamp="conversation.timestamp" :title="conversation.title" :snippet="conversation.snippet" :read="conversation.read" :color="conversation.color" :small="small"></conversation-item>
    </div>
</template>

<script>

import Querier from '@/query.js'
import ConversationItem from '@/components/ConversationItem.vue'
import Spinner from '@/components/Spinner.vue'

export default {
    name: 'conversations',
    props: ['small'],

    mounted () {
        this.updateConversations();
    },

    methods: {
        updateConversations () {
            Querier.fetchConversations('index_unarchived')
                .then(response => {
                    this.conversations = response;
                });
        }
    },

    data () {
        return {
            conversations: [],
        }
    },

    components: {
        ConversationItem,
        Spinner
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
    @import "../assets/scss/_vars.scss";

</style>
