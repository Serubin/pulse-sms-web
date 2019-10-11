<template>
    <div v-mdl class="send-bar">
        <div
            v-mdl
            class="mdl-progress mdl-js-progress mdl-progress__indeterminate"
            :style="{ display: loading ? '' : 'none' }"
        ></div>
        <div v-if="$store.state.loaded_media" v-mdl class="preview">
            <div class="overlay">
                <button
                    class="media-clear mdl-button mdl-js-button mdl-button--colored mdl-button--fab mdl-js-ripple-effect"
                    :style="{ background: send_color }"
                    @click="removeMedia"
                >
                    <i class="material-icons">clear</i>
                </button>
            </div>
            <img :src="media_blob">
        </div>
        <div id="sendbar" class="send-bar-inner">
            <input
                id="attach"
                class="mdl-button mdl-js-button mdl-button--icon attach-button"
                readonly
                tabindex="-1"
                @click.prevent="attachMedia"
            >
            <input
                id="emoji"
                class="mdl-button mdl-js-button mdl-button--icon emoji-button"
                readonly
                tabindex="-1"
                @click="toggleEmoji"
            >
            <div v-show="show_emoji" id="emoji-wrapper" @click.self="toggleEmoji">
                <nimble-picker
                    title="Pick your emoji…"
                    :style="emojiStyle"
                    :set="set"
                    :sheet-size="sheetSize"
                    :per-line="perLine"
                    :skins="skin"
                    :data="emojiIndex"
                    @select="insertEmoji"
                />
            </div>
            <div v-show="autocomplete_emoji" id="emoji-autocomplete" :style="emojiAutocompleteStyle">
                <transition-group name="flip-list" tag="div">
                    <emoji-autocomplete-suggestion
                        v-for="(suggestion, i) in emojiAutocompleteSuggestions"
                        :key="suggestion.code"
                        :emoji="suggestion"
                        :on-selected="selectAutocompleteEmoji"
                        :is-active="i === emojiSelectedIndex"
                    />
                </transition-group>
            </div>
            <div v-mdl class="entry mdl-textfield mdl-js-textfield" :class="is_dirty">
                <!-- eslint-disable vue/use-v-on-exact -->
                <textarea
                    id="message-entry"
                    v-model="message"
                    class="mdl-textfield__input disabled"
                    type="text"
                    @keydown.down.exact.prevent.stop="onArrowUp"
                    @keydown.up.exact.prevent.stop="onArrowDown"
                    @keydown.shift.enter.stop
                    @keydown.enter.prevent.stop="dispatchSend"
                ></textarea>
                <label class="mdl-textfield__label" for="message-entry">{{ $t('sendbar.type') }}</label>
            </div>
            <!-- fab with correct colors will be inserted here -->
            <button
                id="send-button"
                class="send mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--colored mdl-js-ripple-effect"
                :style="{ background: send_color }"
                @click="dispatchSend"
            >
                <i class="material-icons md-18 material-icons-white">send</i>
            </button>
        </div>
    </div>
</template>

<script>
import Vue from 'vue';
import EmojiAutocompleteSuggestion from './EmojiAutocompleteSuggestion.vue';
import AutoGrow from '@/lib/textarea-autogrow.js';
import data from 'emoji-mart-vue-fast/data/all.json';
import 'emoji-mart-vue-fast/css/emoji-mart.css';
import { NimblePicker, EmojiIndex } from 'emoji-mart-vue-fast';
import { Api } from '@/utils';

export default {
    name: 'Sendbar',
    components: {
        NimblePicker,
        EmojiAutocompleteSuggestion,
    },
    props: ['threadId', 'onSend', 'loading'],

    data () {
        return {
            message: "",
            emojiStyle: {
                position: "absolute",
                left: 0,
                bottom: "70px",
                width: "18em",
            },
            emojiAutocompleteStyle: {
                position: "absolute",
                left: "72px",
                bottom: "67px",
                width: "18em",
            },
            perLine: 6,
            set: 'twitter',
            emojiIndex: new EmojiIndex(data),
            sheetSize: 32,
            skin: 3,
            show_emoji: false,
            $wrapper: null,
            $sendbar: null,
            emojiAutocompleteSuggestions: [],
            emojiSelectedIndex: 0,
        };
    },

    computed: {
        send_color () {
            if (this.$store.state.theme_use_global) {
                return this.$store.state.theme_global_accent;
            } else {
                return this.$store.state.colors_accent;
            }
        },
        is_dirty () { // Is dirty fix for mdl
            if (this.message.length > 0)
                return "is-dirty";
            return "";
        },
        media_blob () { // creates url object from media blob
            return window.URL.createObjectURL(this.$store.state.loaded_media);
        },
        autocomplete_emoji () {
            return this.emojiAutocompleteSuggestions.length > 0;
        }
    },

    watch: {
        '$route' () { // Update thread on route change
            this.message = "";
            this.removeMedia();
        },

        'message' () {
            const cursorContextMessage = this.message.substr(0, this.$sendbar.selectionStart);
            const lastIndexSemicolon = cursorContextMessage.lastIndexOf(":");
            const lastIndex = cursorContextMessage.length - 1;
            if (lastIndexSemicolon != -1 && lastIndexSemicolon > cursorContextMessage.lastIndexOf(" ") && lastIndexSemicolon != lastIndex) {
                const emojiSearch = cursorContextMessage.substring(lastIndexSemicolon + 1, lastIndex + 1);
                this.emojiAutocompleteSuggestions = this.emojiIndex.search(emojiSearch).map((o) => ({ emoji: o.native, code: o.short_name })).slice(0, 10);
            } else {
                this.emojiAutocompleteSuggestions = [];
            }
        }
    },

    mounted () {
        // No need for assignment - just build object
        new AutoGrow({target: document.getElementById("message-entry"), extra_line: true, content_el: document.getElementById("message-list")});

        window.addEventListener('resize', this.updateEmojiMargin);
        this.$wrapper = document.querySelector("#wrapper");
        this.$sendbar = document.querySelector("#message-entry");

        this.$store.state.msgbus.$on('hotkey-emoji', this.toggleEmoji);

        document.documentElement.addEventListener('paste', function(event) {
            var clipboardData, found;
            found = false;
            clipboardData = event.clipboardData;

            return Array.prototype.forEach.call(clipboardData.types, function(type, i) {
                var file, reader;
                if (found) {
                    return;
                }

                if (type.match(/image.*/) || clipboardData.items[i].type.match(/image.*/)) {
                    file = clipboardData.items[i].getAsFile();
                    reader = new FileReader();

                    reader.onload = function() {
                        return Api.messages.media.compress(file);
                    };

                    reader.readAsDataURL(file);
                    return found = true;
                }
            });
        });
    },

    destroy () {
        document.documentElement.removeEventListener('paste');
        this.$store.state.msgbus.$off('hotkey-emoji', this.toggle);
    },

    methods: {
        /**
         * dispatchSend
         * Handles send and enter press
         * Also handles shift modifier
         * @param e - event object
         */
        dispatchSend(e) { // Dispatch send message when clicked

            if (e instanceof KeyboardEvent && this.autocomplete_emoji) {
                const emoji = this.emojiAutocompleteSuggestions[this.emojiSelectedIndex].emoji;
                this.selectAutocompleteEmoji(emoji);

                return;
            }

            // the shift key will be used to toggle between the send and return functionality, based
            // on the users "enter to send" preference, in settings.

            // case one: enter to send=off, no shift key -> return line
            // case two: enter to send=off, shift key -> send message
            // case three: enter to send=on, no shift key -> send message
            // case four: enter to send=on, shift key -> return line

            if (e instanceof KeyboardEvent && (
                (e.shiftKey && this.$store.state.enter_to_send) ||
                  (!e.shiftKey && !this.$store.state.enter_to_send))) { // return line

                // Get start/end of selection for insert location
                const start = e.target.selectionStart;
                const end =  e.target.selectionEnd;

                // Overwrite selection with newline
                this.message = this.message.substr(0,start)
                    + "\n" + this.message.substr(end, this.message.length);

                // Set new location of selection to start of old selection
                // Wait until next tick to ensure the new message gets rendered
                Vue.nextTick(() =>
                    e.target.setSelectionRange(start + 1, start + 1)
                );

                return; // Full stop
            }

            // If message is empty, we're done
            if (this.message.length <= 0 && !this.$store.state.loaded_media)
                return false;

            // Send message to handler
            this.onSend(this.message);

            // Clear message
            this.message = "";
        },

        /**
         * Removes media from store
         */
        removeMedia () {
            if (this.$store.state.loaded_media)
                this.$store.commit('loaded_media', null);
        },

        /**
         * Attach media
         * Get media from event and puts it in the store
         * @param e - event object (optional)
         */
        attachMedia () {
            this.destroyAutoComplete();

            // Create input to attach file
            const input = document.createElement('input');
            input.setAttribute("type", "file");

            // Add event listener
            input.addEventListener('change', (e) => {
                let file;

                // Get file from event
                if (e.dataTransfer)
                    file = e.dataTransfer.files[0];
                else
                    file = e.target.files[0];

                // Load file into cache
                Api.messages.media.compress(file);
            });

            // Simulate Click to open file input menu
            const event = document.createEvent("MouseEvents");
            event.initMouseEvent("click", true, true, window, 1, 0, 0, 0, 0,
                false, false, false, false, 0, null);

            // Dispatch click event
            input.dispatchEvent(event);
        },

        /**
         * Toggle emoji menu
         * @param toggle - toggle override (default: null)
         */
        toggleEmoji (toggle=null) {
            this.destroyAutoComplete();

            // Update emoji wrapper margin
            this.updateEmojiMargin(true);

            // If no toggle given, toggle the show_emoji value
            if(typeof toggle != "boolean")
                return this.show_emoji = !this.show_emoji;

            // Otherwise set to provided toggle
            return this.show_emoji = toggle;

        },

        /**
         * Updates margin of the emoji box
         * Updates margin to match edge of the message box
         * Note: only updates when emoji box is open
         * @param force - force update
         */
        updateEmojiMargin (force=false) {

            if (!this.show_emoji && !force)
                return;

            // Calculate Margin (again...)
            const MAIN_CONTENT_SIZE = 950;
            const width = document.documentElement.clientWidth;
            let margin = 0;

            // Handles left side offset - same alg as wrapper margin
            if (width > MAIN_CONTENT_SIZE) {
                margin = (width - MAIN_CONTENT_SIZE) / 2;
            }

            let sidebar = this.$store.state.full_theme ? 270 : 0;
            this.emojiStyle.left = (sidebar + margin) + "px";
        },
        /**
         * Inserts Emoji to curser location
         * @param e emoji event
         */
        insertEmoji(e) {
            this.destroyAutoComplete();

            // Get start/end of selection for insert location
            const start = this.$sendbar.selectionStart;
            const end =  this.$sendbar.selectionEnd;

            // Overwrite selection with emoji
            this.message = this.message.substr(0,start)
                + e.native + this.message.substr(end, this.message.length);

            // Set new location of selection to start of old selection
            // Wait until next tick to ensure the new message gets rendered
            Vue.nextTick(() =>
                this.$sendbar.setSelectionRange(start + e.native.length, start + e.native.length)
            );
        },

        selectAutocompleteEmoji(emoji) {
            this.destroyAutoComplete();

            // Get start/end of selection for insert location
            const cursorContextMessage = this.message.substr(0, this.$sendbar.selectionStart);
            const start = cursorContextMessage.lastIndexOf(":");
            const end = cursorContextMessage.length;

            // Overwrite selection with emoji
            this.message = this.message.substr(0,start)
                + emoji + this.message.substr(end, this.message.length);

            // Set new location of selection to start of old selection
            // Wait until next tick to ensure the new message gets rendered
            Vue.nextTick(() =>
                this.$sendbar.setSelectionRange(start + emoji.length, start + emoji.length)
            );
        },

        onArrowDown() {
            if (this.autocomplete_emoji && this.emojiSelectedIndex > 0) {
                this.emojiSelectedIndex = this.emojiSelectedIndex - 1;
            }
        },

        onArrowUp() {
            if (this.autocomplete_emoji && this.emojiSelectedIndex < this.emojiAutocompleteSuggestions.length) {
                this.emojiSelectedIndex = this.emojiSelectedIndex + 1;
            }
        },

        destroyAutoComplete () {
            this.emojiAutocompleteSuggestions = [];
            this.emojiSelectedIndex = 0;
        }
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
@import "../../assets/scss/_vars.scss";

#emoji {
  background: url("../../assets/images/ic_mood.png") no-repeat;
  background-size: cover;
}

#attach {
  background: url("../../assets/images/ic_attach.png") no-repeat;
  background-size: cover;
  margin-top: 18px;
  width: 24px;
  height: 24px;
}

body.dark {
  #emoji {
    background: url("../../assets/images/ic_mood_white.png") no-repeat;
    background-size: cover;
  }

  #attach {
    background: url("../../assets/images/ic_attach_white.png") no-repeat;
    background-size: cover;
  }
}

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
    border-radius: 15px;
    margin-bottom: 10px;
    box-shadow: -0px -0px 3px rgba(0, 0, 0, 0.15);

    .overlay {
      background: linear-gradient(
        to bottom,
        rgba(250, 250, 250, 0) 95%,
        rgba(250, 250, 250, 1) 100%
      );
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
      width: 450px;
    }
  }
  @media (min-width: 800px) {
    & {
      width: 490px;
    }
  }
  @media (min-width: 820px) {
    & {
      width: 505px;
    }
  }
  @media (min-width: 850px) {
    & {
      width: 530px;
    }
  }
  @media (min-width: 870px) {
    & {
      width: 550px;
    }
  }
  @media (min-width: 890px) {
    & {
      width: 570px;
    }
  }
  @media (min-width: 920px) {
    & {
      width: 600px;
    }
  }
  @media (min-width: 950px) {
    & {
      width: 630px;
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
  background-color: rgba(0, 0, 0, 0);
  bottom: 1px;
  height: 1px;
}

.send-bar-inner {
  background: #fafafa;
  height: 100%;
  margin: auto;
  padding-left: 16px;
  padding-right: 16px;
  padding-top: 4px;
  padding-bottom: 4px;
  border-radius: 16px 16px 0px 0px;
  box-shadow: -0px -0px 3px rgba(0, 0, 0, 0.15);

  .entry {
    width: calc(100% - 124px);
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
    opacity: 0.56;
    margin-right: 8px;
  }

  .emoji-button {
    float: left;
    text-align: center;
    margin-top: 18px;
    min-width: 0px;
    width: 24px;
    height: 24px;
    opacity: 0.56;
    margin-right: 16px;
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
    background: rgb(32, 32, 36);

    .overlay {
      background: linear-gradient(
        to bottom,
        rgba(32, 32, 36, 0) 95%,
        rgba(32, 32, 36, 1) 100%
      );
    }
  }

  .send-bar-inner {
    background: #202024;
    color: #fff;
  }

  .mdl-textfield__label {
    color: #fff !important;
  }
}

body.black {
  .preview {
    background: rgb(0, 0, 0);

    .overlay {
      background: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0) 95%,
        rgba(0, 0, 0, 1) 100%
      );
    }
  }

  .send-bar-inner {
    background: #000000;
  }
}
</style>
