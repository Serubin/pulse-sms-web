<template>
    <div id="conversation-list" class="page-content">

        <!-- Spinner On load -->
        <spinner class="spinner" v-if="conversations.length == 0"></spinner>

        <!-- Conversation items -->
        <transition-group name="flip-list" tag="div">
            <conversation-item v-for="conversation in conversations" :key="conversation.hash" :conversation-data="conversation" :archive="archive" :small="small"></conversation-item>
        </transition-group>

    </div>
</template>

<script>
import Vue from 'vue';
import Hash from 'object-hash'
import { Util, MessageManager } from '@/utils'
import ConversationItem from './ConversationItem.vue'
import Spinner from '@/components/Spinner.vue'

export default {
    name: 'conversations',
    props: ['small', 'archive'],

    mounted () {

        this.$store.state.msgbus.$on('newMessage', this.updateConversation)
        this.$store.state.msgbus.$on('conversationRead', this.updateRead)
        this.$store.state.msgbus.$on('refresh-btn', this.refresh);

        this.fetchConversations();
    },

    beforeDestroy () {

        this.$store.state.msgbus.$off('newMessage')
        this.$store.state.msgbus.$off('conversationRead')
        this.$store.state.msgbus.$off('refresh-btn');
    },

    methods: {
        fetchConversations () {

            // Start query
            MessageManager.fetchConversations(this.index)
                .then(response => {
                    this.conversations = response;

                    if (!this.small)
                        this.$store.commit("loading", false);
                });
            
            // Save to contact cache
            let cache = [];

            for(let item of this.conversations) {
                cache.push(
                    Util.generateContact(
                        item.device_id,
                        item.title,
                        item.color,
                        Util.expandColor(item.color_accent),
                        Util.expandColor(item.color_light),
                        Util.expandColor(item.color_dark)
                    )
                );
            }

            this.$store.commit('contacts', cache) 

        },

        updateConversation (event_obj) {

            // Find conversation
            let conv_index = this.getConversation(event_obj.conversation_id);
            let conv_object = this.conversations[conv_index];
            
            if(typeof conv_index == "undefined")
                return false;

            // Generate new snippet
            let new_snippet = Util.generateSnippet(event_obj)

            conv_object.snippet = new_snippet;
            conv_object.read = event_obj.read;

            conv_object.hash = Hash(conv_object);

            // Move conversation if required
            if (conv_index != 0) {
                conv_object = this.conversations.splice(conv_index, 1)[0]
                this.conversations.unshift(conv_object)
            } 
        },

        updateRead (id) {
            
            if(this.conversations.length < 1)
                return;

            let index = this.getConversation(id);
            let conv = this.conversations[index];
            
            conv.read = true;
            conv.hash = Hash(conv)
        },

        getConversation(id) {
            for(var i = 0; i < this.conversations.length; i++) {
                if(id != this.conversations[i].device_id)
                    continue;

                return i;
            }

            return null;
        },

        /**
         * refresh
         * Force refresh messages - fetches from server
         */
        refresh () {
            if (!this.small) // Don't clear list if using sidebar list
                this.conversations = [];
            this.fetchConversations();
        }
    },

    data () {
        return {
            conversations: [],
        }
    },

    computed: {
        index () {
            return "index_" + ( this.archive ? "archived" : "unarchived" );
        }
    },

    watch: { 
        '$route' (to, from) { // Update index on route change

            // Only update if list page
            if (to.name != from.name && to.name.indexOf('conversations-list') >= 0) {
                this.conversations = [];
                this.fetchConversations();
            }

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
    @import "../../assets/scss/_vars.scss";
       
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
    
    }
    .flip-list-leave-active {
        position: absolute;
    }
    .flip-list-move {
        transition: transform $anim-time;
    }
</style>
