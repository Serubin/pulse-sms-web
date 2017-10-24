<template>
    <div id="conversation-list" class="page-content">

        <!-- Spinner On load -->
        <spinner class="spinner" v-if="conversations.length == 0"></spinner>

        <!-- Conversation items -->
        <transition-group name="flip-list" tag="div">
                <component v-for="conversation in conversations" :is="conversation.title ? 'ConversationItem' : 'DayLabel'" :conversation-data="conversation" :archive="archive" :small="small" :key="conversation.hash"/>
        </transition-group>

    </div>
</template>

<script>
import Vue from 'vue';
import Hash from 'object-hash'
import { Util, MessageManager } from '@/utils'
import ConversationItem from './ConversationItem.vue'
import DayLabel from './DayLabel.vue'
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
                .then(response => this.processConversations(response));
        },

        processConversations (response) {

            const updatedConversations = [];

            const cache = [];
            const titles = [];

            
            for(let i in response) {
                const item = response[i]
                
                const title = this.calculateTitle(item);
                
                if (!titles.includes(title)) {
                    titles.push(title);

                    updatedConversations.push({
                        label: title, 
                        hash: Hash(title)
                    });
                }

                updatedConversations.push(item)

                // Save to contact cache
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

            this.$store.commit('contacts', cache);
            this.conversations = updatedConversations;

            if (!this.small)
                this.$store.commit("loading", false);

        },

        updateConversation (event_obj) {

            // Find conversation
            let { conv, conv_index } = this.getConversation(event_obj.conversation_id);
            
            if(typeof conv_index == "undefined")
                return false;

            // Generate new snippet
            let new_snippet = Util.generateSnippet(event_obj)

            conv.snippet = new_snippet;
            conv.read = event_obj.read;

            conv.hash = Hash(conv);

            // Move conversation if required
            if (conv_index != 0) {
                conv = this.conversations.splice(conv_index, 1)[0]
                this.conversations.splice(1, 0, conv)
            } 
        },

        updateRead (id) {
            
            if(this.conversations.length < 1)
                return;

            let { conv, conv_index } = this.getConversation(id);
            
            conv.read = true;
            conv.hash = Hash(conv)
        },

        getConversation(id) {
            for(let conv_index in this.conversations) {
                let conv = this.conversations[conv_index];

                if(id == conv.device_id)
                    return  { conv, conv_index };
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
        },

        calculateTitle (conversation) {
            if (conversation.pinned) 
                return "Pinned";
            else if (isToday(conversation.timestamp)) 
                return "Today";
            else if (isYesterday(conversation.timestamp)) 
                return "Yesterday";
            else if (isLastWeek(conversation.timestamp)) 
                return "This Week";
            else if (isLastMonth(conversation.timestamp)) 
                return "This Month";
            else 
                return "Older";
            

            function isToday(timestamp) {
                let current = new Date();
                zeroDate(current);

                let time = new Date(timestamp);
                zeroDate(time);

                return current.getTime() == time.getTime();
            }

            function isYesterday(timestamp) {
                let yesterday = new Date();
                zeroDate(yesterday);
                yesterday = new Date(yesterday.getTime() - 1000 * 60 * 60 * 24)

                let time = new Date(timestamp);
                zeroDate(time);

                return yesterday.getTime() == time.getTime();
            }

            function isLastWeek(timestamp) {
                let lastWeek = new Date();
                zeroDate(lastWeek);
                lastWeek = new Date(lastWeek.getTime() - 1000 * 60 * 60 * 24 * 7)

                return timestamp > lastWeek.getTime() && timestamp < (new Date().getTime());
            }

            function isLastMonth(timestamp) {
                return new Date().getMonth() == new Date(timestamp).getMonth();
            }

            function zeroDate(date) {
                date.setHours(0);
                date.setMinutes(0);
                date.setSeconds(0);
                date.setMilliseconds(0);
            }
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
        DayLabel,
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
