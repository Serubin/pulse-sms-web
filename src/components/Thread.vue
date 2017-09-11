<template>
    <div id="thread-wrap">
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
import Querier from '@/utils/query.js'

import Spinner from '@/components/Spinner.vue'
import Message from '@/components/Message.vue'
import Sendbar from '@/components/Sendbar.vue'

export default {
    name: 'thread',
    props: ['threadId'],


    mounted () {
        this.fetchMessages();

        this.$store.state.msgbus.$on('newMessage', this.addNewMessage)
    },

    data () {
        return {
            conversation_id: this.threadId,
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
        fetchMessages () {
            Querier.fetchThread(this.conversation_id)
                .then(response => {

                    // Flip message order and push to local state
                    for(let i = (response.length - 1); i >= 0; i--) 
                        this.messages.push(response[i]);

                    // Wait for messages to render
                    Vue.nextTick(() => { 
                        this.scrollToBottom();

                        this.$store.dispatch("loading", false);
                    });
                });
        },

        addNewMessage(event_obj) {

            // Determine if displayed
            let displayed = this.messages.containsObjKey('device_id', event_obj.device_id);
            if(displayed)
                return;
            
            console.log(event_obj)
            this.messages.push(event_obj);
            Vue.nextTick(() => { 
                this.scrollToBottom(250);
            });
        },

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
