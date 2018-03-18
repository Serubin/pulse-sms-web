<template>
    <div id="thread-wrap" @click="markAsRead">
        <div class="page-content" id="message-list" :style="{marginBottom: margin_bottom + 'px'}">
            <!-- Load More Button -->
            <button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect" @click="handleShowMore" v-if="messages.length != 0">Load Previous</button>
            <!-- Spinner On load -->
            <spinner class="spinner" v-if="messages.length == 0"></spinner>
            <!-- messages will be inserted here -->
            <message v-for="message in messages" :key="message.device_id" :message-data="message" :thread-color="getColor(message)" :text-color="text_color(message)"></message>
        </div>
        
        <sendbar ref="sendbar" :thread-id="threadId" :on-send="sendMessage" :loading="$store.state.media_sending" ></sendbar>
    </div>
</template>


<script>
import Vue from 'vue'
import jump from 'jump.js'

import { Util, Api } from '@/utils'

import Spinner from '@/components/Spinner.vue'
import Message from './Message.vue'
import Sendbar from './Sendbar.vue'

export default {
    name: 'thread',
    props: ['threadId', 'isRead'],


    mounted () {

        if (typeof this.isRead == "undefined")
            this.read = false;
        
        this.$store.state.msgbus.$on('newMessage', this.addNewMessage);
        this.$store.state.msgbus.$on('refresh-btn', this.refresh);

        this.$store.state.msgbus.$on('archive-btn', this.archive);
        this.$store.state.msgbus.$on('unarchive-btn', this.archive);

        
        // Fetch dom
        this.html = document.querySelector("html");
        this.body = document.querySelector("body");
        this.list = document.querySelector("#content");
        this.snackbar = document.querySelector(".mdl-snackbar");
        this.sendbar = document.querySelector("#sendbar");

        // Window focus event
        let events = Util.addEventListeners(['focus'], (e) => { 

            // Mark as read on focus
            this.markAsRead(); 
            // Focus cursor on message entry
            this.$el.querySelector('#message-entry').focus();

            e.preventDefault();
            e.stopPropagation();
            return false;
        });
        this.listeners.extend(events);

        // Snackbar Clean up
        events = Util.addEventListeners(['scroll'], this.cleanupSnackbar);
        this.listeners.extend(events);

       // Drag Drop Prevent default
        events = Util.addEventListeners(['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'],
            (e) => { 
                // Stop normal events
                e.preventDefault()
                e.stopPropagation()
            }
        );
        this.listeners.extend(events);

        // Drag over events
        events = Util.addEventListeners(['dragover', 'dragenter'],
            (e) => {
                // Get file drag dom
                const file_drag = document.querySelector(".file-drag");

                // Add dragging class if not already added
                const classes = file_drag.className
                if (classes.indexOf("dragging") < 0)
                    file_drag.className = classes + " dragging";
            }
        );
        this.listeners.extend(events);

        // Drag leave events
        events = Util.addEventListeners(['dragleave', 'dragend', 'drop'],
            (e) => {
                // Get file drag dom
                const file_drag = document.querySelector(".file-drag");

                // Remove dragging class
                const classes = file_drag.className.replace(" dragging", "");
                file_drag.className = classes;
            }
        );
        this.listeners.extend(events);

        // Drop handling
        events = Util.addEventListeners(['drop'],
            (e) => {
                let file;

                // Get actual file
                if (e.dataTransfer)
                    file = e.dataTransfer.files[0]
                else
                    file = e.target.files[0];
                
                // Load file to local cache
                Api.loadFile(file);
            }
        );
        this.listeners.extend(events);
        
        // Watch sendbar's message content
        this.$watch(
            '$refs.sendbar.message',
            (to) => setTimeout(() => { // Wait 500ms for text render and resize

                // Set margin bottom
                this.margin_bottom = this.$refs.sendbar.$el.clientHeight;

            }, 500),
            { deep: true, immediate: true }
        )

        // Load thread
        this.loadThread();

    },

    beforeDestroy () {
        
        this.$store.state.msgbus.$off('newMessage');
        this.$store.state.msgbus.$off('refresh-btn');

        this.$store.state.msgbus.$off('archive-btn', this.archive);
        this.$store.state.msgbus.$off('unarchive-btn', this.archive);
        
        // Restore last title
        this.$store.commit('title', this.previous_title);

        // Remove event listeners
        Util.removeEventListeners(this.listeners);

        // Remove any loaded media
        if (this.$store.state.loaded_media)
            this.$store.commit('loaded_media', null);
    },

    data () {
        return {
            conversation_id: this.threadId,
            read: this.isRead, 
            messages: [],

            previous_title: "",
            listeners: [],

            colors_from: {},
            margin_bottom: "63",

            html: null,
            body: null,
            list: null,
            snackbar: null,
            sendbar: null,

            offset: 0,
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
    },

    methods: {

        /**
         * handles sendMessage event
         * Call back for sending messages
         * @param message - string message
         */
        sendMessage (message) {

            // Send stored media if laoded
            if (this.$store.state.loaded_media) {
                Api.sendFile(this.$store.state.loaded_media, this.conversation_id);
                this.$store.commit('loaded_media', null); // Remove from store
            }

            // If message is empty, we're done
            if (message.length <= 0) 
                return false;

            // Otherwise send any corrisponding message
            Api.sendMessage(message, "text/plain", this.conversation_id)

        },

        /**
         * Load Thread
         * Set's up thread, gets colors. initiate message fetch
         */
        loadThread () {

            // Fetch messages
            this.offset = 0;
            this.messages = [];
            this.fetchMessages();

            // Colors, map name to color
            this.colors_from = {}; 

            // Focus
            this.$el.querySelector('#message-entry').focus();

            // Remove media if needed
            if (this.$store.state.loaded_media)
                this.$store.commit('loaded_media', null);

            // Get contact colors from cache
            const from = this.contact_data.title.split(", "); // Split name(s)

            if (from.length == 1) // If only one, use default color
                this.colors_from[from[0]] =  this.contact_data.colors.default;
            else // Otherwise, get from cache
                from.map(  
                    (i) => { // For each name
                        const contact = Object.values( // Get contact
                            this.$store.state.contacts // From cache
                        ).containsObjKey("title", i)   // Match to "title"
                        
                        // Map name/title to color
                        this.colors_from[i] = contact.colors.default; 
                    }
                );

        },

        /**
         * Fetch messages from server
         * Get's latest messages from server, decrypts, and add's to
         * this.messages for rendering.
         */
        fetchMessages (offset=0) {
            Api.fetchThread(this.conversation_id, offset)
                .then(response => {
                    
                    let new_messages = [];
                    let nextTimestamp;

                    
                    // Flip message order and push to local state
                    for(let i = (response.length - 1); i >= 0; i--) {

                        if (i == 0) // nextTimestamp processing
                            nextTimestamp = new Date();
                        else 
                            nextTimestamp = new Date(response[i - 1].timestamp);

                        // Compare current time stamp with the next (previous chronological)
                        response[i].dateLabel = this.compareTimestamps(
                            new Date(response[i].timestamp), nextTimestamp, 15
                        );

                        // Push to list
                        new_messages.push(response[i]); 
                    }

                    if (offset > 0) // Create marker for scroll back
                        new_messages.push({
                            marker: true
                        });

                    
                    // If offset is larger than zero, pre-pend to list
                    if (offset > 0)
                        this.messages = new_messages.concat(this.messages);
                    else
                        this.messages = new_messages; 



                    // Wait for messages to render
                    Vue.nextTick(() => { 
                        if (this.offset <= 0)
                            Util.scrollToBottom();

                        if (this.offset > 0 && this.$el.querySelector("#offset-marker"))
                            jump('#offset-marker', {
                                duration: 0,
                                offset: -190,
                                callback: () => {
                                    this.messages.splice(offset,1);
                                }
                            });

                        this.offset += 70;

                        this.$store.commit("loading", false);
                        this.markAsRead();


                        this.previous_title = this.$store.state.title;

                        // Commit title and colors
                        this.$store.commit('title', this.contact_data.title);
                        this.$store.commit('colors', this.contact_data.colors);
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
                    let timeoutId;
                    const data = {
                        message: 'New Message',
                        actionHandler: (e) => {
                            this.snackbar.MaterialSnackbar.cleanup_(); // Hide snackbar

                            clearTimeout(timeoutId); // Cancel timeout

                            Vue.nextTick(() => {            // Animate on next tick to
                                Util.scrollToBottom(250);   // avoid scrolling before render
                            });
                        },
                        actionText: 'Show',
                        timeout: 60*60*60 // Hour timeout
                    };
                    Util.snackbar(data);

                    timeoutId = setTimeout(() => { // If snackbar timeout, scroll to bottom
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

            if(this.read) // if already read, stop
                return;

            Api.markAsRead(this.conversation_id);
            this.read = true; // Set thread to read
        },

        /**
         * refresh
         * Force refresh messages - fetches from server
         */
        refresh () {
            this.offset = 0; // Clear offset
            this.messages = []; // Clear messages
            this.fetchMessages(); // Fetch messages
            this.markAsRead(); // Mark as read
        },

        /**
         * Archive conversation
         */
        archive () {
            const _this = this;
            // Archive conversation on the server
            Api.archiver(!this.isArchived, this.conversation_id);

            // Snackbar the user
            Util.snackbar({
                message: "Conversation has been " +
                    (!this.isArchived ? "archived" : "unarchived"),
                actionText: "Undo",
                actionHandler: (e) =>  {
                    // Construct push URL
                    Api.archiver(!this.isArchived, this.conversation_id);
                    this.push_archive_url();

                    e.target.innerHTML = '<i class="material-icons">done</i>';

                    setTimeout(() =>
                        e.target.parentElement.MaterialSnackbar.cleanup_(),
                    2000);

                },
                timeout: 6 * 1000
            })
            
            // Awful terrible fix for thread snackbar clean up events
            this.snackbar.MaterialSnackbar.active = false;
            
            this.push_archive_url();
        },

        push_archive_url () {
            // Construct push URL
            const constructed_url = (this.$route.path.replace("archived", "") // Remove archive 
                + (!this.isArchived ? "/archived" : "/")) // Add archive or /
                .replace("//", "/"); // Double slash fix
            // Push to archived/normal route
            this.$router.push( constructed_url )
        },

        /**
         * Determine text color for messages
         * Determines color "darkness" & returns black/white for text color
         * @params message - message object
         * @return text color
         */
        text_color (message) {

            // Get color string
            let colorString; 
            if (message.message_from)                 colorString = this.getColor(message)
            else // Otherwise default color
                colorString = this.color;

            // Split up color string
            colorString = colorString.replace("rgba(", "").replace(")", "");
            colorString = colorString.replace("rgb(", "").replace(")", "");

            // Get actual colors
            const  colorArray = colorString.split(",");
            const  red = colorArray[0];
            const  green = colorArray[1];
            const  blue = colorArray[2];
            
            // Some magic with implicit type conversion
            const  darkness = 1 - (0.299 * red + 0.587 * green + 0.114 * blue) / 255;

            // Determine color
            return darkness >= 0.30 ? "#fff" : "#000";
        },

        /**
         * getColor from specific message, respecting contact colors
         * @param message 
         * @return color
         */
        getColor (message) {
            if (message.message_from) // If multiple senders, get specific color
                return this.colors_from[message.message_from]; // Get color from cached colors
            else
                return this.color // Otherwise return conversation default
        },

        /**
         * Cleansup snackbar based on scroll position
         * For intellegant dismissing of "new message" notification
         * when the user is scrolled up in the conversation
         */
        cleanupSnackbar () {
            if(!this.snackbar.MaterialSnackbar.active)
                return false;
            
            // If within 200 px of the bottom, remove snack bar
            if ((this.html.scrollHeight - this.html.offsetHeight - 200) < 
                Math.max(this.html.scrollTop, this.body.scrollTop))
                this.snackbar.MaterialSnackbar.cleanup_();
        },

        /**
         * Compare two timestamps to determine if "length" away from one another
         * @param date - first date
         * @param nextDate - next date
         * @param length - time in minutes
         */
        compareTimestamps(date, nextDate, length) {

            // If the dates are length a part, return date string
            if (nextDate.getTime() > date.getTime() + (1000 * 60 * length))
                return date.toLocaleString();
            else  // Otherwise null
                return null;

        },

        handleShowMore() {
            this.fetchMessages(this.offset);
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

    button {
        background: #f3f3f3;
        margin-left: calc(50% - (136.5px)/2);
        margin-bottom: 30px;
    }
    
    #message-list {
        transition: margin-bottom 0.3s ease-in-out;
    }
</style>
