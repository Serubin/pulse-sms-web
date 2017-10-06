<template>
    <div class="send-bar">
        <div class="send-bar-inner" id="sendbar">
            <input id="attach" class="mdl-button mdl-js-button mdl-button--icon attach-button" type="image" src="../../assets/images/ic_attach.png"/>
            <input id="emoji" class="mdl-button mdl-js-button mdl-button--icon emoji-button" type="image" src="../../assets/images/ic_mood.png"/>
            <div class="entry mdl-textfield mdl-js-textfield" v-mdl>
                <textarea class="mdl-textfield__input disabled" type="text" id="message-entry" autofocus @keydown.shift.enter.stop @keydown.enter.prevent.stop="dispatchSend" v-model="message"></textarea>
                <label class="mdl-textfield__label" for="message-entry">Type message...</label>
            </div>
            <!-- fab with correct colors will be inserted here -->
            <button class="send mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--colored mdl-js-ripple-effect" id="send-button" @click="dispatchSend">
                <i class="material-icons md-18 material-icons-white">send</i>
            </button>
        </div>
    </div>
</template>

<script>
import AutoGrow from '@/lib/textarea-autogrow.js'
import { MessageManager } from '@/utils'

export default {
    name: 'Sendbar',
    props: ['threadId'],

    mounted () {
        let autogrow = new AutoGrow({target: document.getElementById("message-entry"), extra_line: true, content_el: document.getElementById("message-list")});
    },

    data () {
        return {
            message: "",
        }
    },

    methods: {
        dispatchSend(e) { // Dispatch send message when klicked
            if (e.shiftKey) {
                this.message += "\n";
                return;
            }

            
            if (this.message.length <= 0) 
                return;

            MessageManager.sendMessage(this.message, "text/plain", this.threadId)
            
            this.message = "";
        },
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
@import "../../assets/scss/_vars.scss";

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
