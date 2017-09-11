<template>
    <div id="conversation-list" class="page-content">

        <!-- Spinner On load -->
        <spinner class="spinner" v-if="conversations.length == 0"></spinner>

        <!-- Conversation items -->
        <transition-group name="flip-list" tag="div">
            <conversation-item v-for="conversation in conversations" :key="conversation.device_id" :conversation-data="conversation" :small="small"></conversation-item>
        </transition-group>

    </div>
</template>

<script>

import Util from '@/utils/util.js'
import Querier from '@/utils/query.js'
import ConversationItem from '@/components/ConversationItem.vue'
import Spinner from '@/components/Spinner.vue'

export default {
    name: 'conversations',
    props: ['small'],

    mounted () {
        this.$store.state.msgbus.$on('newMessage', this.updateConversation)
        this.$store.state.msgbus.$on('conversationRead', this.updateRead)

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
        },

        updateConversation (event_obj) {
            console.log(event_obj);
            // Find conversation
            let conv_index = this.getConversation(event_obj.conversation_id);
            let conv_object = this.conversations[conv_index];

            if(typeof conv_index == "undefined")
                return false;

            // Generate new snippet
            let new_snippet = Util.generateSnippet(event_obj)

            // Update snippet if required
            if (conv_object.snippet != new_snippet)
                this.$set(conv_object, "snippet", new_snippet);
            
            this.$set(conv_object, "read", event_obj.read);

            // Move conversation if required
            if (conv_index != 0) {
                conv_object = this.conversations.splice(conv_index, 1)[0]
                this.conversations.unshift(conv_object)
            } else {
                this.$set(this.conversations, conv_index, conv_object)
            }

        },

        updateRead (id) {
            console.log(id)
            let index = this.getConversation(id);
            let conv = this.conversations[index];
            this.$set(conv, "read", true);
        },

        getConversation(id) {
            for(var i = 0; i < this.conversations.length; i++) {
                if(id != this.conversations[i].device_id)
                    continue;

                return i;
            }

            return null;
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
    .flip-list-enter, .flip-list-leave-to
    /* .flip-list-leave-active below version 2.1.8 */ {
        opacity: 0;
        transform: translateX(0px);
    }
    .flip-list-leave-active {
        position: absolute;
    }
    .flip-list-move {
        transition: transform $anim-time;
    }
</style>
