<template>
    <div id="thread-wrap" @click="markAsRead">
        <div class="page-content" id="message-list" :style="{marginBottom: margin_bottom}">
            <!-- Spinner On load -->
            <spinner class="spinner" v-if="messages.length == 0"></spinner>
            <!-- messages will be inserted here -->
            <message v-for="message in messages" :key="message.device_id" :message-data="message" :thread-color="getColor(message)" :text-color="text_color(message)"></message>
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

        
        this.$store.state.msgbus.$on('newMessage', this.addNewMessage);
        this.$store.state.msgbus.$on('refresh-btn', this.refresh);

        this.$store.state.msgbus.$on('archive-btn', this.archive);
        this.$store.state.msgbus.$on('unarchive-btn', this.archive);

        
        // Fetch dom
        this.html = document.querySelector("html");
        this.body = document.querySelector("body");
        this.list = document.querySelector("#content");
        this.snackbar = document.querySelector(".mdl-snackbar");

        // Window focus event
        let events = Util.addEventListeners(['focus'], (e) => { 
            this.markAsRead();
            this.$el.querySelector('#message-entry').focus();
        });
        this.listeners.extend(events);

        // Snackbar Clean up
        events = Util.addEventListeners(['scroll'], this.cleanupSnackbar);
        this.listeners.extend(events);

       // Drag Drop Prevent default
        events = Util.addEventListeners(['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'],
            (e) => { 
                e.preventDefault()
                e.stopPropagation()
            }
        );
        this.listeners.extend(events);

        // Drag over events
        events = Util.addEventListeners(['dragover', 'dragenter'],
            (e) => {
                const file_drag = document.querySelector(".file-drag");
                const classes = file_drag.className
                if (classes.indexOf("dragging") < 0)
                    file_drag.className = classes + " dragging";
            }
        );
        this.listeners.extend(events);

        // Drag leave events
        events = Util.addEventListeners(['dragleave', 'dragend', 'drop'],
            (e) => {
                const file_drag = document.querySelector(".file-drag");
                const classes = file_drag.className.replace(" dragging", "");
                file_drag.className = classes;
            }
        );
        this.listeners.extend(events);

        // Drop handling
        events = Util.addEventListeners(['drop'],
            (e) => {

                let file;

                if (e.dataTransfer)
                    file = e.dataTransfer.files[0]
                else
                    file = e.target.files[0];

                Api.loadFile(file);
            }
        );
        this.listeners.extend(events);

        this.loadThread();

    },

    beforeDestroy () {
        
        this.$store.state.msgbus.$off('newMessage');
        this.$store.state.msgbus.$off('refresh-btn');

        this.$store.state.msgbus.$off('archive-btn', this.archive);
        this.$store.state.msgbus.$off('unarchive-btn', this.archive);

        this.$store.commit('title', this.previous_title);

        Util.removeEventListeners(this.listeners);

        // Remove any loaded media
        if (this.$store.state.loaded_media)
            this.$store.commit('loaded_media', null);
    },

    data () {
        return {
            conversation_id: this.threadId,
            read: this.isRead || true, 
            messages: [],
            previous_title: "",
            listeners: [],
            colors_from: {},
            html: document.querySelector("html"),
            body: document.querySelector("body"),
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
        },

        margin_bottom () {
            return this.$store.state.loaded_media ? "355px" : "54px";
        }
    },

    methods: {
        loadThread () {
            // Commit title and colors
            this.$store.commit('title', this.contact_data.title);
            this.$store.commit('colors', this.contact_data.colors);

            // Fetch messages
            this.messages = [];
            this.colors_from = {};
            this.fetchMessages();

            // Focus
            this.$el.querySelector('#message-entry').focus();

            // Remove media if needed
            if (this.$store.state.loaded_media)
                this.$store.commit('loaded_media', null);

            // Cache colors
            const from = this.contact_data.title.split(", ");
            if (from.length == 1)
                this.colors_from[from[0]] =  this.contact_data.colors.default;
            else
                from.map(
                    (i) => {
                        const contact = Object.values(
                            this.$store.state.contacts
                        ).containsObjKey("title", i)
                        this.colors_from[i] = contact.colors.default;
                    }
                );

        },

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
            const displayed = this.messages.containsObjKey('device_id', event_obj.device_id);
            if(displayed) // Ignore if displayed
                return;
            
             // Add time stamp
            const lastMessage = this.messages[this.messages.length - 1];
            const lastTimestamp = new Date(lastMessage.timestamp);

            lastMessage.dateLabel = this.compareTimestamps(
                new Date(event_obj.timestamp), lastTimestamp, 15
            );
            
            this.messages.push(event_obj);

            // Mark as unread
            if (event_obj.type == 0 || event_obj.type == 6) 
                this.read = false;

            // Deploy snackbar if scrolled up 
            if ((this.html.scrollHeight - this.html.offsetHeight - 200) > Math.max(this.html.scrollTop, this.body.scrollTop)
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

        // color string = 'rgba(r,g,b,a)'
        // generated from the 'toColor' method above.
        text_color (message) {

            let colorString;
            if (message.message_from)
                colorString = this.getColor(message)
            else
                colorString = this.color;

            colorString = colorString.replace("rgba(", "").replace(")", "");
            colorString = colorString.replace("rgb(", "").replace(")", "");

            const  colorArray = colorString.split(",");
            const  red = colorArray[0];
            const  green = colorArray[1];
            const  blue = colorArray[2];

            const  darkness = 1 - (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
            return darkness >= 0.30 ? "#fff" : "#000";
        },

        getColor (message) {
            if (message.message_from)
                return this.colors_from[message.message_from]
            else
                return this.color
        },

        cleanupSnackbar () {
            if(!this.snackbar.MaterialSnackbar.active)
                return false;
            
            // If within 200 px of the bottom, remove snack bar
            if ((this.html.scrollHeight - this.html.offsetHeight - 200) < Math.max(this.html.scrollTop, this.body.scrollTop))
                this.snackbar.MaterialSnackbar.cleanup_();
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
            
            this.loadThread();

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
