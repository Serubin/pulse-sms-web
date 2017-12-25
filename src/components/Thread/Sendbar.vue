<template>
    <div class="send-bar">
        <div v-if="$store.state.media_sending" class="mdl-progress mdl-js-progress mdl-progress__indeterminate" v-mdl></div>
        <div v-if="$store.state.loaded_media" class="preview" v-mdl>
            <div class="overlay">
                <button class="media-clear mdl-button mdl-js-button mdl-button--colored mdl-button--fab mdl-js-ripple-effect" @click="removeMedia">
                    <i class="material-icons">clear</i>
                </button>
            </div>
            <img :src="media_blob" />
        </div>
        <div class="send-bar-inner" id="sendbar">
            <input id="attach" class="mdl-button mdl-js-button mdl-button--icon attach-button" type="image" src="../../assets/images/ic_attach.png" @click.prevent="attachMedia"/>
            <input id="emoji" class="mdl-button mdl-js-button mdl-button--icon emoji-button" type="image" src="../../assets/images/ic_mood.png" @click="toggleEmoji"/>
            <div id="emoji-wrapper" v-show="show_emoji" @click.self="toggleEmoji">
                    <Picker set="emojione" :style="emojiStyle"  :set="set" :per-line="perLine" :skins="skin" :onItemClick="insertEmoji" />
            </div>
            <div class="entry mdl-textfield mdl-js-textfield" :class="is_dirty" v-mdl>
                <textarea class="mdl-textfield__input disabled" type="text" id="message-entry" autofocus @keydown.shift.enter.stop @keydown.enter.prevent.stop="dispatchSend" v-model="message"></textarea>
                <label class="mdl-textfield__label" for="message-entry">Type message...</label>
            </div>
            <!-- fab with correct colors will be inserted here -->
            <button class="send mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--colored mdl-js-ripple-effect" :style="{ background: send_color }" id="send-button" @click="dispatchSend">
                <i class="material-icons md-18 material-icons-white">send</i>
            </button>
        </div>
    </div>
</template>

<script>
import AutoGrow from '@/lib/textarea-autogrow.js'
import emojione from 'emojione'
import 'vue-emoji-mart/css/emoji-mart.css'
import { Picker } from 'vue-emoji-mart'
import { Api } from '@/utils'

export default {
    name: 'Sendbar',
    props: ['threadId'],

    mounted () {
        let autogrow = new AutoGrow({target: document.getElementById("message-entry"), extra_line: true, content_el: document.getElementById("message-list")});

        window.addEventListener('resize', this.updateEmojiMargin)
        this.$wrapper = document.querySelector("#wrapper");
        
    },

    data () {
        return {
            message: "",
            emojiStyle: {
                position: "absolute",
                left: 0,
                bottom: "70px",
                width: "18em",
            },
            perLine: 6,
            set: 'emojione',
            skin: 3,
            show_emoji: false,
            $wrapper: null,
        }
    },

    methods: {
        dispatchSend(e) { // Dispatch send message when klicked
            if (e.shiftKey) {
                this.message += "\n";
                return;
            }

            if (this.$store.state.loaded_media) {
                Api.sendFile(this.$store.state.loaded_media, this.threadId);
                this.$store.commit('loaded_media', null);
            }

            if (this.message.length <= 0) 
                return;


            Api.sendMessage(this.message, "text/plain", this.threadId)
            
            this.message = "";
        },
        removeMedia () {
            this.$store.commit('loaded_media', null);
        },
        attachMedia (e) {
            const input = document.createElement('input');
            input.setAttribute("type", "file");

            // Change Event
            input.addEventListener('change', (e) => {
                let file;

                if (e.dataTransfer)
                    file = e.dataTransfer.files[0]
                else
                    file = e.target.files[0];

                Api.loadFile(file);
            });

            // Simulate Click
            const event = document.createEvent("MouseEvents");
            event.initMouseEvent("click", true, true, window, 1, 0, 0, 0, 0,
                false, false, false, false, 0, null);

            // Dispatch click
            input.dispatchEvent(event)
        },
        toggleEmoji (toggle=null) {

            this.updateEmojiMargin(true);
            if(typeof toggle != "boolean")
                return this.show_emoji = !this.show_emoji
            
            return this.show_emoji = toggle

        },
        updateEmojiMargin (force=false) {

            if (!this.show_emoji && !force)
                return;

            // Calculate Margin (again...)
            const MAIN_CONTENT_SIZE = 950;
            const width = document.documentElement.clientWidth;
            let margin = 0;

            // Handles left side offset
            if (width > MAIN_CONTENT_SIZE) {
                margin = (width - MAIN_CONTENT_SIZE) / 2;
            }

            this.emojiStyle.left = (270  + margin) + "px";
        },
        insertEmoji(e) {
            this.message += e.native;
        }
    },

    computed: {
        send_color () {
            return this.$store.state.colors_accent
        },
        is_dirty () {
            if (this.message.length > 0)
                return "is-dirty";
            return "";
        },
        media_blob () {
            return window.URL.createObjectURL(this.$store.state.loaded_media)
        }
    },

    watch: { 
        '$route' (to) { // Update thread on route change
            this.message = "";
        }
    },
    components: {
        Picker,
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

        .mdl-progress {
            width: 100%;
        }

        .preview {
            position: relative;
            background: #fafafa;
            max-height: 300px;
            overflow: hidden;

            .overlay {
                background: linear-gradient(to bottom, rgba(250,250,250,0) 95%,rgba(250,250,250,1) 100%);
                position: absolute;
                top: 0;
                bottom: 0;
                height: 100%;
                width: 100%;
                z-index: 10;
                
                .media-clear {
                    position: absolute;
                    margin: 0.3em 1em;
                    background: rgb(33, 150, 243) none repeat scroll 0% 0%;
                    padding: 0.3em;
                    right: 1em;
                    width: 24px;
                    min-width: 24px;
                    min-height: 24px;
                    height: 24px;
                }

                .media-clear i {
                    width: 24px;
                    font-size: 18px;
                    line-height: 24px;
                    height: 24px;
                }
            }

            img {
                margin: 1em calc(24px + 16px + 8px) 1em;
                width: calc(100% - 108px);
            }


        }

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
        outline: none;
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

    #emoji-wrapper {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10;

        .emoji-mart {
            z-index: 15;
            transition: ease-in-out left $anim-time;
        }
    }

    body.dark {
        .preview {
            background: rgb(55,66,72);

            .overlay {
                background: linear-gradient(to bottom, rgba(55,66,72,0) 95%,rgba(55,66,72,1) 100%);
            }
        }

        .send-bar-inner {
            background: #374248;
            color: #fff;
        }

        .mdl-textfield__label {
            color: #fff !important;
        }
    }

</style>
