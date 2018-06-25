<template>
     <div id="settings" >
         <div class="page-content" id="account-list" v-mdl>

            <div class="click-item mdl-js-button mdl-js-ripple-effect" @click="color_dialog.showModal();"> <!-- Global Colors -->
                <div class="mdl-color-text--grey-900">Primary Color, Primary Color Dark, Accent Color</div>
                <div class="mdl-color-text--grey-600">{{ hex.default }}, {{ hex.dark }}, {{ hex.accent }}</div>
            </div>

            <dialog class="mdl-dialog">
                <div class="mdl-dialog__content">
                    <h4>Update Theme Colors</h4>
                    <div class="mdl-textfield mdl-js-textfield">
                        Primary Color
                        <input class="mdl-textfield__input" type="text" id="theme-default" v-model="hex.default"/>
                        <label class="mdl-textfield__label" for="theme-default"></label>
                    </div>
                    <div class="mdl-textfield mdl-js-textfield">
                        Dark Color
                        <input class="mdl-textfield__input" type="text" id="theme-dark" v-model="hex.dark"/>
                        <label class="mdl-textfield__label" for="theme-dark"></label>
                    </div>
                    <div class="mdl-textfield mdl-js-textfield">
                        Accent Color
                        <input class="mdl-textfield__input" type="text" id="theme-accent" v-model="hex.accent"/>
                        <label class="mdl-textfield__label" for="theme-accent"></label>
                    </div>
                </div>
                <div class="mdl-dialog__actions">
                    <button type="button" class="mdl-button close" @click="saveColors()">Save</button>
                    <button type="button" class="mdl-button close" @click="color_dialog.close()">Close</button>
                </div>
            </dialog>

            <br />

            <div class="label-item">
                <label for="pin" :class="pin_class" class="mdl-switch mdl-js-switch mdl-js-ripple-effect mdl-js-ripple-effect--ignore-events">
                    <input id="pin" class="mdl-switch__input" type="checkbox" v-model.lazy="pin">
                    <span class="mdl-switch__label mdl-color-text--grey-900">
                        Pin Conversation
                    </span>
                </label>
            </div>

            <div class="label-item">
                <label for="mute" :class="mute_class" class="mdl-switch mdl-js-switch mdl-js-ripple-effect mdl-js-ripple-effect--ignore-events">
                    <input id="mute" class="mdl-switch__input" type="checkbox" v-model="mute">
                    <span class="mdl-switch__label mdl-color-text--grey-900">
                        Mute Conversation
                    </span>
                </label>
            </div>

            <div class="label-item">
                <label for="private" :class="private_class" class="mdl-switch mdl-js-switch mdl-js-ripple-effect mdl-js-ripple-effect--ignore-events">
                    <input id="private" class="mdl-switch__input" type="checkbox" v-model="private">
                    <span class="mdl-switch__label mdl-color-text--grey-900">
                        Private Conversation
                    </span>
                </label>
            </div>

        </div>
    </div>
</template>

<script>
import { Api, Util, SessionCache } from '@/utils/'
import dialogPolyfill from 'dialog-polyfill'

export default {
    name: 'conversation-settings',
    props: [ 'conversation_title', 'conversation_id' ],

    mounted () {
        SessionCache.invalidateAllConversations();

        Api.fetchConversation(this.conversation_id)
            .then(response => this.processConversation(response))

        this.$store.commit("loading", false);
        this.$store.commit('title', this.title);

        this.color_dialog = this.$el.querySelector(".mdl-dialog");
        if (! this.color_dialog.showModal)
            dialogPolyfill.registerDialog(this.color_dialog)
    },

    data () {
        return {
            title: "Settings - " + this.conversation_title,
            phone_numbers: null,
            pin: false,
            mute: false,
            private: false,
            colors: { },
            hex: { },
            pin_class: "",
            mute_class: "",
            private_class: "",
            color_dialog: null
        }
    },

    methods: {

        processConversation (data) {
            this.phone_numbers = data.phone_numbers;
            this.title = "Settings - " + data.title;
            this.$store.commit('title', this.title);

            this.pin = data.pinned;
            this.mute = data.mute;
            this.private = data.private_notifications;

            this.colors = {
                default: data.color,
                dark: Util.expandColor(data.color_dark),
                accent: Util.expandColor(data.color_accent)
            }

            this.hex = {
                default: this.rgbaToHex(this.colors.default),
                dark: this.rgbaToHex(this.colors.dark),
                accent: this.rgbaToHex(this.colors.accent)
            }

            if (this.pin) {
                this.pin_class = "is-checked";
            }

            if (this.mute) {
                this.mute_class = "is-checked";
            }

            if (this.private) {
                this.private_class = "is-checked";
            }
        },

        /**
         * rgbaToHex
         * Converts rgba (css value, str) to string hex value (css)
         * @param string - rgba(x, y, z, aa)
         * @return #0x0y0z
         */
        rgbaToHex (rgba) {
            let color_comps = rgba.match(/[0-9]+/g);
            let str_16;
            let hex = [];

            for( let c of color_comps) {
                // Parse to b16
                str_16 = parseInt(c).toString(16);
                // Normalize
                str_16 = str_16.length == 1 ? "0" + str_16 : str_16;

                hex.push(str_16);
            }

            return "#" + hex.slice(0, (hex.length - 1)).join("")
        },
        hexToRgb(hex) {
            let r = parseInt(hex.slice(1, 3), 16),
                g = parseInt(hex.slice(3, 5), 16),
                b = parseInt(hex.slice(5, 7), 16),
                a = 255 & 0xFF;

            return (r << 16) + (g << 8) + (b << 0) + (a << 24);
        },

        saveColors () {
            // Convert hex to RGB Int
            const theme_default = this.hexToRgb(this.hex.default);
            const theme_dark = this.hexToRgb(this.hex.dark);
            const theme_accent = this.hexToRgb(this.hex.accent);

            let request = {
                account_id: this.$store.state.account_id,
                color: theme_default,
                color_dark: theme_dark,
                color_accent: theme_accent
            };

            Api.updateConversation(request, this.conversation_id);

            this.color_dialog.close()
        }

    },

    computed: {

        colors_string () {
            if (this.colors.default == null) {
                return "Loading...";
            } else {
                const defaultHex = this.rgbaToHex(this.colors.default);
                const darkHex = this.rgbaToHex(this.colors.dark);
                const accentHex = this.rgbaToHex(this.colors.accent);

                return defaultHex + ", " + darkHex + ", " + accentHex;
            }
        },

    },

    watch: {
        'pin' () {
            let request = {
                account_id: this.$store.state.account_id,
                pinned: this.pin,
            };
            Api.updateConversation(request, this.conversation_id);
        },
        'mute' () {
            let request = {
                account_id: this.$store.state.account_id,
                mute: this.mute
            };
            Api.updateConversation(request, this.conversation_id);
        },
        'private' () {
            let request = {
                account_id: this.$store.state.account_id,
                private_notifications: this.private
            };
            Api.updateConversation(request, this.conversation_id);
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
    @import "../assets/scss/_vars.scss";

    .label-item {
        padding-left: 15px;
    }

    .item, .click-item {
        position: relative;
        width: 100%;
        padding: 16px;
        line-height: 18px;
    }

    .item:hover, .click-item:hover {
    	  background: #E0E0E0;
    }

    .click-item:hover {
        cursor: pointer;
    }

    dialog {
        position: fixed;
        top: 50%;
        transform: translate(0, -50%);
    }

</style>
