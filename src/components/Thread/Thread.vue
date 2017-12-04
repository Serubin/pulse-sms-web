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
import { Util, Api } from '@/utils'

import Spinner from '@/components/Spinner.vue'
import Message from './Message.vue'
import Sendbar from './Sendbar.vue'

export default {
    name: 'thread',
    props: ['threadId', 'isRead'],


    mounted () {

        this.fetchMessages();

        this.$el.querySelector('#message-entry').focus();
        
        this.$store.state.msgbus.$on('newMessage', this.addNewMessage);
        this.$store.state.msgbus.$on('refresh-btn', this.refresh);

        this.$store.state.msgbus.$on('archive-btn', this.archive);
        this.$store.state.msgbus.$on('unarchive-btn', this.archive);

        this.html = document.querySelector("html");
        this.list = document.querySelector("#content");
        this.snackbar = document.querySelector(".mdl-snackbar");

        window.addEventListener('focus', (e) => { 
            this.markAsRead();
            this.$el.querySelector('#message-entry').focus();
        });
    },

    beforeDestroy () {
        
        this.$store.state.msgbus.$off('newMessage');
        this.$store.state.msgbus.$off('refresh-btn');

        this.$store.state.msgbus.$off('archive-btn', this.archive);
        this.$store.state.msgbus.$off('unarchive-btn', this.archive);

        this.$store.commit('title', this.previous_title);
    },

    data () {
        return {
            conversation_id: this.threadId,
            read: this.isRead || true, 
            messages: [],
            previous_title: "",
            html: document.querySelector("html"),
            list: document.querySelector("#content"),
            snackbar: document.querySelector(".mdl-snackbar"),
        }
    },

    computed: {

        contact_data () {
            return this.$store.getters.getContact(this.conversation_id);
        },

        color () {
            return this.contact_data.colors.default;
        },

        isArchived () {
            return this.$route.path.includes("archived");
        }
    },

    methods: {

        /**
         * Fetch messages from server
         * Get's latest messages from server, decrypts, and add's to
         * this.messages for rendering.
         */
        fetchMessages () {
            Api.fetchThread(this.conversation_id)
                .then(response => {

                    let nextTimestamp;

                    // Flip message order and push to local state
                    for(let i = (response.length - 1); i >= 0; i--) {

                        if (i == 0) // nextTimestamp processing
                            nextTimestamp = new Date();
                        else 
                            nextTimestamp = new Date(response[i - 1].timestamp);

                        response[i].dateLabel = this.compareTimestamps(
                            new Date(response[i].timestamp), nextTimestamp, 15
                        );
                        
                        // Push to list
                        this.messages.push(response[i]);

                    }

                    this.$store.commit('colors', this.contact_data.colors);

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

            // Mark as unread
            if (event_obj.type == 0 || event_obj.type == 6) 
                this.read = false;

            // Deploy snackbar if scrolled up 
            if ((this.html.scrollHeight - this.html.offsetHeight - 200) > this.html.scrollTop
                && !(this.list.scrollHeight < this.html.offsetHeight)) {
                
                if (!this.snackbar.MaterialSnackbar.active) {
                    var data = {
                        message: 'New Message',
                        actionHandler: (e) => {
                            this.snackbar.MaterialSnackbar.cleanup_(); // Hide snackbar

                            Vue.nextTick(() => {            // Animate on next tick to
                                Util.scrollToBottom(250);   // avoid scrolling before render
                            });
                        },
                        actionText: 'Show',
                        timeout: 60*60*60 // Hour timeout
                    };
                    Util.snackbar(data);

                    setTimeout(() => { // If snackbar timeout, scroll to bottom
                        Vue.nextTick(() => {            // Animate on next tick to
                            Util.scrollToBottom(250);   // avoid scrolling before render
                        });
                    }, 60*60*60);
                }
                
                return;
            }


            Vue.nextTick(() => {            // Animate on next tick to
                Util.scrollToBottom(250);   // avoid scrolling before render
            });
            

        },


        /**
         * markAsRead
         * Mark's thread as read if not already read.
         * Thread will keep track of it's own read state (estimated)
         */
        markAsRead () {

            if(this.read) // Already read
                return;

            Api.markAsRead(this.conversation_id);
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
        },
        
        archive () {
            Api.archiver(!this.isArchived, this.conversation_id);
            this.$router.push( !this.isArchived ? "/archived" : "/")
        },
        
        compareTimestamps(date, nextDate, length) {

            if (nextDate.getTime() > date.getTime() + (1000 * 60 * length))
                return date.toLocaleString();
            else 
                return null;

        }
    },

    watch: { 
        '$route' (to) { // Update thread on route change
            this.conversation_id = this.threadId;
            this.read = this.isRead

            this.$store.commit('title', this.contact_data.title);

            this.messages = [];
            this.fetchMessages();

            this.$store.commit('colors', this.contact_data.colors);
            this.$el.querySelector('#message-entry').focus();

        },
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
