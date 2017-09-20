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
import jump from 'jump.js'
import { Util, MessageManager } from '@/utils'

import Spinner from '@/components/Spinner.vue'
import Message from '@/components/Message.vue'
import Sendbar from '@/components/Sendbar.vue'

export default {
    name: 'thread',
    props: ['threadId', 'isRead'],


    mounted () {
        this.fetchMessages();
        
        this.$store.state.msgbus.$on('newMessage', this.addNewMessage);

        window.addEventListener('focus', (e) => this.markAsRead());
    },

    data () {
        return {
            conversation_id: this.threadId,
            read: this.isRead,
            messages: [],
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
                        this.scrollToBottom();

                        this.$store.dispatch("loading", false);
                        this.markAsRead();
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
                this.scrollToBottom(250);   // avoid scrolling before render
            });

            if (event_obj.type == 0 || event_obj.type == 6)
                this.read = false;
        },

        /**
         * Scroll to bottom
         * Scrolls thread to bottom of page; uses tween easing
         *
         * @param speed - default to zero (no animation)
         */
        scrollToBottom(speed) {

            if (typeof speed == "undefined") // Speed defaults to zero
                speed = 0;

            const docu = document.getElementsByTagName("html")[0].clientHeight
            const body = document.getElementsByTagName("body")[0].clientHeight

            const bottom = Math.max(docu, body); // Calculate bottom

            // Jump to bottom
            jump(bottom, {
                duration: speed,
                easing: (t, b, c, d) => { // easeInOutCubic - @jaxgeller
                    if ((t/=d/2) < 1) return c/2*t*t*t + b;
                    return c/2*((t-=2)*t*t + 2) + b;
                }
            });
        },

        markAsRead () {

            if(this.read) // Already read
                return;

            MessageManager.markAsRead(this.conversation_id);
            this.read = true; // Set thread to read
        }
    },

    watch: { 
        '$route' (to) { // Update thread on route change
            this.threadId = to.params.threadId;
            this.conversation_id = to.params.threadId;

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
    @import "../assets/scss/_vars.scss";
    
</style>
