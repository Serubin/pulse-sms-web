<template>
    <div id="thread-wrap">
        <div class="page-content" id="message-list">
            <!-- Spinner On load -->
            <spinner class="spinner" v-if="messages.length == 0"></spinner>
            <!-- messages will be inserted here -->
            <message v-for="message in messages" :key="message.device_id" :message-data="message" :thread-color="color" ></message>
        </div>

        <div class="send-bar">
            <div class="send-bar-inner" id="sendbar">
                <input id="attach" class="mdl-button mdl-js-button mdl-button--icon attach-button" type="image" src="../assets/images/ic_attach.png"/>
                <input id="emoji" class="mdl-button mdl-js-button mdl-button--icon emoji-button" type="image" src="../assets/images/ic_mood.png"/>
                <div class="entry mdl-textfield mdl-js-textfield">
                    <textarea class="mdl-textfield__input disabled" type="text" id="message-entry" autofocus></textarea>
                    <label class="mdl-textfield__label" for="message-entry">Type message...</label>
                </div>
                <!-- fab with correct colors will be inserted here -->
                <button class="send mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--colored mdl-js-ripple-effect" id="send-button">
                    <i class="material-icons md-18 material-icons-white">send</i>
                </button>
            </div>
        </div>
    </div>
</template>


<script>
import Vue from 'vue'
import jump from 'jump.js'
import AutoGrow from '@/lib/textarea-autogrow.js'
import Querier from '@/query.js'

import Spinner from '@/components/Spinner.vue'
import Message from '@/components/Message.vue'

export default {
    name: 'thread',
    props: ['threadId'],

    mounted () {
        let autogrow = new AutoGrow({target: document.getElementById("message-entry")});
        this.fetchMessages();
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
                    for(let i = (response.length - 1); i > 0; i--)
                        this.messages.push(response[i]);

                    // Wait for messages to render
                    Vue.nextTick(() => { 
                        this.scrollToBottom();
                    });
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
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
    @import "../assets/scss/_vars.scss";
    
    .send-bar {
        height: auto;
        width: 100%;
        margin: auto;
        position: fixed;
        bottom: 0%;
        clear: both;
        transition: ease-in-out width $anim-time;

        @media (min-width: 750px) {
            & {
                width: 500px;
            }
        }

        @media (min-width: 800px) {
            & {
                width: 550px;
            }
        }
        @media (min-width: 850px) {
            & {
                width: 600px;
            }
        }
        @media (min-width: 900px) {
            & {
                width: 650px;
            }
        }
        @media (min-width:950px) {
            & {
                width: 650px;
            }
        }
    }

    .mdl-textfield {
        padding: 0px 0;
        padding-top: 20px;
    }

    .mdl-textfield__input {
        min-height: 2em;
        transition: height ease-in-out $anim-time;
    }

    .mdl-textfield__label:after {
        background-color: rgba(0,0,0,0);
        bottom: 1px;
        height: 1px;
    }

    .send-bar-inner {
        background: #fafafa;
        height: 100%;
        margin: auto;
        padding-left: 16px;
        padding-right: 16px;
        border-radius: 2px;
        
        .entry {
            width: calc(100% - 108px);
            margin-top: -4px;
        }

        .send {
            float: right;
            margin-top: 8px;
        }

        .attach-button {
            float: left;
            text-align: center;
            margin-top: 15px;
            min-width: 0px;
            width: 28px;
            height: 28px;
            opacity: .56;
            margin-right: 8px;
        }

        .emoji-button {
            float: left;
            text-align: center;
            margin-top: 18px;
            min-width: 0px;
            width: 24px;
            height: 24px;
            opacity: .56;
            margin-right: 8px;
        }
    }

    #message-entry {
        height: 24px;
        resize: none;
    }
</style>
