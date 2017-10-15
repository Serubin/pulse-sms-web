<template>
    <div id="thread-wrap" @click="markAsRead">
        <div class="page-content" id="message-list">
            <!-- Spinner On load -->
            <spinner class="spinner" v-if="messages.length == 0"></spinner>
            <!-- messages will be inserted here -->
            <message v-for="message in messages" :key="message.device_id" :message-data="message" :thread-color="color"></message>
        </div>
        
        <sendbar :thread-id="threadId"></sendbar>
    </div>
</template>


<script>
import Vue from 'vue'
import { Util, MessageManager } from '@/utils'

import Spinner from '@/components/Spinner.vue'
import Message from './Message.vue'
import Sendbar from './Sendbar.vue'

export default {
    name: 'thread',
    props: ['threadId', 'isRead'],


    mounted () {

        this.fetchMessages();
        
        this.$store.state.msgbus.$on('newMessage', this.addNewMessage);
        this.$store.state.msgbus.$on('refresh-btn', this.refresh);


        window.addEventListener('focus', (e) => this.markAsRead());
    },

    beforeDestroy () {
        
        this.$store.state.msgbus.$off('newMessage');
        this.$store.state.msgbus.$off('refresh-btn');

        this.$store.commit('title', this.previous_title);
    },

    data () {
        return {
            conversation_id: this.threadId,
            read: this.isRead || true, 
            messages: [],
            previous_title: "",
        }
    },

    computed: {

        contact_data () {
            return this.$store.getters.getContact(this.conversation_id);
        },

        color () {
            return this.contact_data.colors.default;
        }
    },

    methods: {

        /**
         * Fetch messages from server
         * Get's latest messages from server, decrypts, and add's to
         * this.messages for rendering.
         */
        fetchMessages () {
            MessageManager.fetchThread(this.conversation_id)
                .then(response => {

                    // Flip message order and push to local state
                    for(let i = (response.length - 1); i >= 0; i--) 
                        this.messages.push(response[i]);

                    // Wait for messages to render
                    Vue.nextTick(() => { 
                        Util.scrollToBottom();

                        this.$store.commit("loading", false);
                        this.markAsRead();

                        this.previous_title = this.$store.state.title;
                        this.$store.commit('title', this.contact_data.title);
                    });
                });
        },
        

        /**
         * EventHandler: Add new message
         * Add's new message to thread
         * 
         * @param event_object
         */
        addNewMessage(event_obj) {

            // Ignore if message is not part of conversation
            if (event_obj.conversation_id != this.conversation_id)
                return;

            // Determine if displayed
            let displayed = this.messages.containsObjKey('device_id', event_obj.device_id);
            if(displayed) // Ignore if displayed
                return;
            
            this.messages.push(event_obj);
            
            Vue.nextTick(() => {            // Animate on next tick to
                Util.scrollToBottom(250);   // avoid scrolling before render
            });

            if (event_obj.type == 0 || event_obj.type == 6)
                this.read = false;
        },


        /**
         * markAsRead
         * Mark's thread as read if not already read.
         * Thread will keep track of it's own read state (estimated)
         */
        markAsRead () {

            if(this.read) // Already read
                return;

            MessageManager.markAsRead(this.conversation_id);
            this.read = true; // Set thread to read
        },
        /**
         * refresh
         * Force refresh messages - fetches from server
         */
        refresh () {
            this.messages = [];
            this.fetchMessages();
            this.markAsRead();
        }
    },

    watch: { 
        '$route' (to) { // Update thread on route change
            this.conversation_id = this.threadId;
            this.read = this.isRead

            this.$store.commit('title', this.contact_data.title);

            this.messages = [];
            this.fetchMessages();

        }
    },

    components: {
        Spinner,
        Message,
        Sendbar,
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
    @import "../../assets/scss/_vars.scss";
    
</style>
