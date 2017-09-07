<template>
    <div id="conversation-list" class="page-content">

        <!-- Spinner On load -->
        <spinner class="spinner" v-if="conversations.length == 0"></spinner>

        <!-- Conversation items -->
        <conversation-item v-for="conversation in conversations" :key="conversation.device_id" :conversation-data="conversation" :small="small"></conversation-item>

    </div>
</template>

<script>

import Querier from '@/utils/query.js'
import ConversationItem from '@/components/ConversationItem.vue'
import Spinner from '@/components/Spinner.vue'

export default {
    name: 'conversations',
    props: ['small'],

    mounted () {
        this.fetchConversations();
    },

    methods: {
        fetchConversations () {

            // Get index from url/params
            var param_index = this.$route.params.index;
            this.index = "index_" 
                + (param_index == null ? "unarchived" : param_index);

            // Start query
            Querier.fetchConversations(this.index)
                .then(response => {
                    this.conversations = response;

                    if (!this.small)
                        this.$store.dispatch("loading", false);
                });
        }
    },

    data () {
        return {
            index: 'index_unarchived',
            conversations: [],
        }
    },

    watch: { 
        '$route' (to) { // Update index on route change

            // Only update if list page
            if(to.name == 'conversations-list') 
                this.fetchConversations() 

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
       
    #conversation-list {
        width: 100%;
        margin-top: 36px !important;

        .spinner {
            margin-top: 100px;
        }
    }
</style>
