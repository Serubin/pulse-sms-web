<template>
    <div id="thread-wrap">
        <div id="message-list" class="page-content" :style="{marginBottom: margin_bottom + 'px'}">
            <!-- Load More Button -->
            <button v-if="messages.length > 69" class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect" @click="handleShowMore">
                Load Previous
            </button>
            <!-- Spinner On load -->
            <spinner v-if="messages.length == 0" class="spinner" />
            <!-- messages will be inserted here -->

            <transition-group name="fade" tag="div">
                <message v-for="message in messages" :key="message.device_id" :message-data="message" :thread-color="getColor(message)" :text-color="text_color(message)" />
            </transition-group>
        </div>

        <sendbar ref="sendbar" :thread-id="threadId" :on-send="sendMessage" :loading="$store.state.media_sending" />
    </div>
</template>


<script>
import Vue from 'vue';
import jump from 'jump.js';
import debounce from 'lodash/debounce';

import { Util, Api, SessionCache, TimeUtils } from '@/utils';

import Spinner from '@/components/Spinner.vue';
import Message from './Message.vue';
import Sendbar from './Sendbar.vue';

export default {
    name: 'Thread',

    components: {
        Spinner,
        Message,
        Sendbar,
    },
    props: ['threadId', 'isRead'],

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

            messageText: "",
            has_draft: false,
        };
    },

    computed: {

        conversation_data () {
            return this.$store.getters.getConversationData(this.conversation_id);
        },

        color () {
            // If conversation_data is real and global theme is disabled
            if (!this.$store.state.theme_use_global && this.conversation_data) {
                return this.conversation_data.colors.default;
            } else { // Fallback to global
                return this.$store.state.theme_global_default;
            }
            // This handles three things - global theme option, conversation color
            // And the situation where conversation color is in use but undefined
        },

        isArchived () {
            return this.$route.path.indexOf("archived") > -1;
        },
    },

    watch: {
        '$route' () { // Update thread on route change

            this.cleanupDrafts();

            this.messageText = "";
            this.has_draft = false;
            this.$store.state.msgbus.$emit('clear-sendbar');

            this.conversation_id = this.threadId;
            this.read = this.isRead;

            this.loadThread();
            this.loadDrafts();
        },
    },


    mounted () {

        if (typeof this.isRead == "undefined")
            this.read = false;

        this.$store.state.msgbus.$on('newMessage', this.addNewMessage);
        this.$store.state.msgbus.$on('deletedMessage', this.deletedMessage);
        this.$store.state.msgbus.$on('refresh-btn', this.refresh);
        this.$store.state.msgbus.$on('message-text-updated', this.messageTextUpdated);

        this.$store.state.msgbus.$on('archive-btn', this.archive);
        this.$store.state.msgbus.$on('unarchive-btn', this.archive);

        this.$store.state.msgbus.$on('delete-btn', this.delete);
        this.$store.state.msgbus.$on('blacklist-btn', this.blacklist);

        this.$store.state.msgbus.$on('conversation-information-btn', this.conversationInformation);
        this.$store.state.msgbus.$on('conversation-settings-btn', this.conversationSettings);

        this.$store.state.msgbus.$on('hotkey-page-previous', this.pageToPrevious);
        this.$store.state.msgbus.$on('hotkey-page-next', this.pageToNext);

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

        // Mark as read when action is taken on page (just focus is not enough)
        events = Util.addEventListeners(['keydown', 'click'], debounce(this.markAsRead, 250));
        this.listeners.extend(events);

        // Snackbar Clean up
        events = Util.addEventListeners(['scroll'], this.cleanupSnackbar);
        this.listeners.extend(events);

        // Drag Drop Prevent default
        events = Util.addEventListeners(['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'],
            (e) => {
                // Stop normal events
                e.preventDefault();
                e.stopPropagation();
            }
        );
        this.listeners.extend(events);

        // Drag over events
        events = Util.addEventListeners(['dragover', 'dragenter'],
            () => {
                // Get file drag dom
                const file_drag = document.querySelector(".file-drag");

                // Add dragging class if not already added
                const classes = file_drag.className;
                if (classes.indexOf("dragging") < 0)
                    file_drag.className = classes + " dragging";
            }
        );
        this.listeners.extend(events);

        // Drag leave events
        events = Util.addEventListeners(['dragleave', 'dragend', 'drop'],
            () => {
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
                    file = e.dataTransfer.files[0];
                else
                    file = e.target.files[0];

                // Load file to local cache
                Api.messages.media.compress(file);
            }
        );
        this.listeners.extend(events);

        // Watch sendbar's message content
        this.$watch(
            '$refs.sendbar.message',
            () => setTimeout(() => { // Wait 500ms for text render and resize

                // Set margin bottom
                this.margin_bottom = this.$refs.sendbar && this.$refs.sendbar.$el.clientHeight;

            }, 500),
            { deep: true, immediate: true }
        );

        // Load thread
        this.loadThread();
        this.loadDrafts();
    },

    beforeDestroy () {

        this.cleanupDrafts();

        this.$store.state.msgbus.$off('newMessage', this.addNewMessage);
        this.$store.state.msgbus.$off('deletedMessage', this.deletedMessage);
        this.$store.state.msgbus.$off('refresh-btn', this.refresh);
        this.$store.state.msgbus.$off('message-text-updated', this.messageTextUpdated);

        this.$store.state.msgbus.$off('archive-btn', this.archive);
        this.$store.state.msgbus.$off('unarchive-btn', this.archive);

        this.$store.state.msgbus.$off('delete-btn', this.delete);
        this.$store.state.msgbus.$off('blacklist-btn', this.blacklist);

        this.$store.state.msgbus.$off('conversation-information-btn', this.conversationInformation);
        this.$store.state.msgbus.$off('conversation-settings-btn', this.conversationSettings);

        this.$store.state.msgbus.$off('hotkey-page-previous', this.pageToPrevious);
        this.$store.state.msgbus.$off('hotkey-page-next', this.pageToNext);

        // Restore last title
        this.$store.commit('title', this.previous_title);

        // Close media viewer if it is open
        this.$store.state.msgbus.$emit('hideImage');

        // Remove event listeners
        Util.removeEventListeners(this.listeners);

        // Remove any loaded media
        if (this.$store.state.loaded_media)
            this.$store.commit('loaded_media', null);
    },

    methods: {

        /**
         * handles sendMessage event
         * Call back for sending messages
         * @param message - string message
         */
        sendMessage (message, conversationId) {
            if (!conversationId) {
                conversationId = this.conversation_id;
            }

            // Send stored media if laoded
            if (this.$store.state.loaded_media) {
                Api.messages.media.send(this.$store.state.loaded_media, (file, messageId) => {
                    Api.messages.send("firebase -1", file.type, conversationId, messageId);
                });
            }

            // If message is empty, we're done
            if (message.length <= 0) {
                return false;
            }

            // Otherwise send any corrisponding message
            Api.messages.send(message, "text/plain", conversationId);
            
            // this is an "experiments" setting
            if (!this.isArchived && this.$store.state.archive_after_send) {
                Api.conversations.archive(conversationId, true);
                this.pageToNext();
            }

            // Delete drafts if any exist
            if (this.has_draft) {
                this.deleteDrafts();
            }
        },

        /**
         * Load Thread
         * Set's up thread, gets colors. initiate message fetch
         */
        loadThread () {

            // Check conversation_data for bad data yield. This occurs
            // when the session cache is invalid or when a conversation doesn't
            // exist. we handle this by checking if the appropriate variables
            // are truthy. We can fix this by invaldiating the cache and then pushing to `/`
            if (!this.conversation_data) {
                SessionCache.invalidateAllConversations();
                SessionCache.invalidateMessages(this.conversation_id + '');
                this.$router.push("/");
            }

            // Fetch messages
            this.offset = 0;
            this.messages = [];
            this.fetchMessages();

            // Colors, map name to color
            this.colors_from = {};

            // Focus
            if (!this.$store.state.hotkey_navigation) {
                Vue.nextTick(() => { // Wait item to render
                    this.$el.querySelector('#message-entry').focus();
                });
            } else {
                this.$store.commit('hotkey_navigation', false);
            }

            // Remove media if needed
            if (this.$store.state.loaded_media)
                this.$store.commit('loaded_media', null);

            // NOTE: `from` may be undefined due to conversation_data not yielding
            // data. This occurs when the session cache is invalid or when a
            // conversation doesn't exist. we handle this by checking if the
            // appropriate variables are truthy

            // Get contact colors from cache
            const from = this.conversation_data && this.conversation_data
                .phone_number.split(", "); // Split numbers

            if (from && from.length == 1)  // If only one, use default color
                this.colors_from[this.conversation_data.name]  // Save color by name
                        = this.conversation_data.colors.default;

            else if (from) // Otherwise, get from cache
                from.map(
                    (i) => { // For each name
                        const id = Util.createIdMatcher(i);
                        const contact = this.$store.getters.getContact(id); // Get contact

                        if (!contact || !contact.colors.default)
                            return this.colors_from[i] = this.color;
                        // Map name to color
                        this.colors_from[contact.name] = contact.colors.default;
                    }
                );

        },

        /**
         * Fetch drafts from api and loads them into local thread memory
         */
        loadDrafts () {
            Api.drafts.getConversationDrafts(this.conversation_id)
                .then(response => {
                    if (response.length > 0) {
                        for (const draft of response) {
                            if (draft.mime_type == "text/plain") {
                                this.$store.state.msgbus.$emit('apply-draft', draft.data);
                                this.has_draft = true;
                                break;
                            }
                        }
                    }
                });
        },

        /**
         * Save or delete draft on thread change/destroy
         * Check if text exists then save or delete draft
         * no return - has effects
         */
        cleanupDrafts () {
            if (this.messageText.trim() && !this.$store.state.archive_after_send) {
                this.saveDraft(this.messageText);
            } else if (this.has_draft) {
                this.deleteDrafts();
            }
        },

        /**
         * Fetch messages from server
         * Get's latest messages from server, decrypts, and add's to
         * this.messages for rendering.
         */
        fetchMessages (offset=0) {
            Api.messages.get(this.conversation_id, offset)
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
                            new Date(response[i].timestamp), nextTimestamp
                        );


                        // Apply fromLabel
                        response[i].fromLabel = response[i].message_from;
                        if (response[i].message_from && i > 0) {
                            if (response[i - 1].message_from == response[i].message_from) {
                                response[i].fromLabel = "";
                            }
                        }

                        // Push to list
                        new_messages.push(response[i]);
                    }

                    if (offset > 0) // Create marker for scroll back
                        new_messages.push({
                            device_id: Api.generateId(),
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

                        if (this.conversation_data) { // If valid thread
                            // Commit title and colors
                            this.$store.commit('title', this.conversation_data.name);
                            this.$store.commit('colors', this.conversation_data.colors);
                        }
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
                new Date(event_obj.timestamp), lastTimestamp
            );

            // Apply fromLabel
            event_obj.fromLabel = event_obj.message_from;
            if (event_obj.message_from && this.messages.length > 0) {
                if (lastMessage.message_from == event_obj.message_from) {
                    lastMessage.fromLabel = "";
                }
            }

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
                        message: this.$t('thread.newmessage'),
                        actionHandler: () => {
                            this.snackbar.MaterialSnackbar.cleanup_(); // Hide snackbar

                            clearTimeout(timeoutId); // Cancel timeout

                            Vue.nextTick(() => {            // Animate on next tick to
                                Util.scrollToBottom(250);   // avoid scrolling before render
                            });
                        },
                        actionText: this.$t('thread.show'),
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

        deletedMessage (id) {
            for (let i = 0; i < this.messages.length; i++) {
                if (this.messages[i].device_id == id) {
                    this.messages.splice(i, 1);
                }
            }
        },

        /**
         * markAsRead
         * Mark's thread as read if not already read.
         * Thread will keep track of it's own read state (estimated)
         */
        markAsRead () {
            if(this.read) // if already read, stop
                return;

            Api.conversations.read(this.conversation_id);
            this.read = true; // Set thread to read
        },

        /**
         * refresh
         * Force refresh messages - fetches from server
         */
        refresh () {
            SessionCache.invalidateAllConversations();
            SessionCache.invalidateMessages(this.conversation_id + '');

            this.offset = 0; // Clear offset
            this.messages = []; // Clear messages
            this.fetchMessages(); // Fetch messages
            this.markAsRead(); // Mark as read
        },

        /**
         * Archive conversation
         */
        archive () {
            // Archive conversation on the server
            Api.conversations.archive(this.conversation_id, !this.isArchived);

            // Snackbar the user
            Util.snackbar({
                message: "Conversation has been " +
                    (!this.isArchived ? "archived" : "moved to inbox") + ".",
                actionText: "Undo",
                actionHandler: (e) =>  {
                    // Construct push URL
                    Api.conversations.archive(this.conversation_id, !this.isArchived);
                    this.push_archive_url();

                    e.target.innerHTML = '<i class="material-icons">done</i>';

                    setTimeout(() =>
                        e.target.parentElement.MaterialSnackbar.cleanup_(),
                    2000);

                },
                timeout: 6 * 1000
            });

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
            this.$router.push(constructed_url);
        },

        /**
         * Delete conversations
         */
        delete () {
            let options = {
                okText: this.$t('thread.delete.delete'),
                cancelText: this.$t('thread.delete.cancel'),
                animation: 'fade'
            };

            const id = this.conversation_id;
            const apiUtils = Api;

            this.$router.push('/');
            this.$dialog.confirm(this.$t('thread.delete.thread'), options)
                .then(() => {
                    apiUtils.conversations.delete(id);
                }).catch(function() { });
        },

        /**
         * Blacklist contact
         */
        blacklist () {
            if (this.conversation_data.phone_number.indexOf(",") < 0) {
                Api.blacklist.create.phone(this.conversation_data.phone_number);
                Api.conversations.archive(this.conversation_id, true);

                // Snackbar the user
                Util.snackbar({
                    message: this.$t('thread.blacklisted'),
                    timeout: 6 * 1000
                });

                this.$router.push('/');
            } else {
                Util.snackbar({
                    message: this.$t('thread.groupblacklisted'),
                    timeout: 6 * 1000
                });
            }

            // Awful terrible fix for thread snackbar clean up events
            this.snackbar.MaterialSnackbar.active = false;
        },

        /**
         * Conversation Information
         */
        conversationInformation () {
            // Just a way to give the user the phone number for the conversation
            const baseText = this.conversation_data.phone_number.indexOf(",") < 0 ? "Phone number: " : "Phone numbers: ";
            Util.snackbar({
                message: baseText + this.conversation_data.phone_number,
                actionText: "Copy",
                actionHandler: (e) =>  {
                    var dummy = document.createElement("input");
                    document.body.appendChild(dummy);
                    dummy.setAttribute('value', this.conversation_data.phone_number);
                    dummy.select();
                    document.execCommand("copy");
                    document.body.removeChild(dummy);

                    e.target.parentElement.MaterialSnackbar.cleanup_();
                },
                timeout: 10 * 1000
            });
        },

        /**
         * Conversation Settings
         */
        conversationSettings () {
            this.$router.push({
                name: 'conversation-settings', params: { conversationTitle: this.conversation_data.name, conversationId: this.conversation_id }
            });
        },

        pageToNext () {
            let conversations = SessionCache.getConversations();
            let index = -1;

            for (let i = 0; i < conversations.length; i++) {
                if (conversations[i].device_id == this.conversation_id) {
                    index = i;
                    break;
                }
            }

            if (index != -1 && index < conversations.length - 1) {
                this.$router.push('/thread/' + conversations[index + 1].device_id);
            }
        },

        pageToPrevious () {
            let conversations = SessionCache.getConversations();
            let index = -1;

            for (let i = 0; i < conversations.length; i++) {
                if (conversations[i].device_id == this.conversation_id) {
                    index = i;
                    break;
                }
            }

            if (index > 0) {
                this.$router.push('/thread/' + conversations[index - 1].device_id);
            }
        },

        /**
         * Determine text color for messages
         * Determines color "darkness" & returns black/white for text color
         * @params message - message object
         * @return text color
         */
        text_color (message) {
            try {
                const colorString = this.getColor(message);
                return Util.getTextColorBasedOnBackground(colorString);
            } catch (err) {
                return "#FFF";
            }
        },

        /**
         * getColor from specific message, respecting contact colors
         * @param message
         * @return color
         */
        getColor (message) {
            if (message.message_from) { // If multiple senders, get specific color
                const color = this.colors_from[message.message_from]; // Get color from cached colors
                if (color) {
                    return color;
                } else {
                    return this.color;
                }
            } else {
                return this.color; // Otherwise return conversation default
            }
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
        compareTimestamps(date, nextDate) {
            let length = 15; // minutes

            // If the dates are "length" a part, return date string
            if (this.$store.state.theme_message_timestamp ||
                    nextDate.getTime() > date.getTime() + (1000 * 60 * length)) {
                return TimeUtils.formatTimestamp(date.getTime(), Date.now());
            } else {
                return null;
            }
        },

        handleShowMore() {
            this.fetchMessages(this.offset);
        },

        messageTextUpdated (newText) {
            this.messageText = newText;
        },

        saveDraft (text) {
            if(!this.has_draft) {
                Api.drafts.create(this.conversation_id, text);
            } else {
                Api.drafts.replace(this.conversation_id, text);
            }
        },

        deleteDrafts () {
            Api.drafts.delete(this.conversation_id);
        },
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
    @import "../../assets/scss/_vars.scss";

    .fade-enter-active, .fade-leave-active {
      transition: opacity .2s;
    }
    .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
      opacity: 0;
    }

    button {
        background: #f3f3f3;
        margin-left: calc(50% - (136.5px)/2);
        margin-bottom: 30px;
    }

    #message-list {
        transition: margin-bottom 0.3s ease-in-out;
    }
</style>
