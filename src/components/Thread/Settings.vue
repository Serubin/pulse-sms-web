<template>
    <div id="settings">
        <div id="account-list" v-mdl class="page-content">
            <div class="click-item mdl-js-button mdl-js-ripple-effect" @click="showColorDialog">
                <!-- Global Colors -->
                <div class="mdl-color-text--grey-900">
                    {{ $t('settings.primary') }}, {{ $t('settings.darkprimary') }}, {{ $t('settings.accent') }}
                </div>
                <div class="mdl-color-text--grey-600">
                    {{ hex.default }}, {{ hex.dark }}, {{ hex.accent }}
                </div>
            </div>

            <div v-if="showColorSettings" class="mdl-dialog">
                <div class="mdl-dialog__content mdl-dialog-card mdl-card">
                    <h4>{{ $t('thread.settings.updatecolors') }}</h4>
                    <div class="mdl-textfield mdl-js-textfield">
                        {{ $t('settings.primary') }}
                        <input id="theme-default" v-model="hex.default" class="mdl-textfield__input" type="text">
                        <label class="mdl-textfield__label" for="theme-default"></label>
                    </div>
                    <div class="mdl-textfield mdl-js-textfield">
                        {{ $t('settings.darkprimary') }}
                        <input id="theme-dark" v-model="hex.dark" class="mdl-textfield__input" type="text">
                        <label class="mdl-textfield__label" for="theme-dark"></label>
                    </div>
                    <div class="mdl-textfield mdl-js-textfield">
                        {{ $t('settings.accent') }}
                        <input id="theme-accent" v-model="hex.accent" class="mdl-textfield__input" type="text">
                        <label class="mdl-textfield__label" for="theme-accent"></label>
                    </div>
                    <div class="mdl-dialog__actions">
                        <button type="button" class="mdl-button close" @click="saveColors">
                            {{ $t('dialog.save') }}
                        </button>
                        <button type="button" class="mdl-button close" @click="closeColorDialog">
                            {{ $t('dialog.close') }}
                        </button>
                    </div>
                </div>
            </div>

            <br>

            <div class="label-item">
                <label for="pin" :class="pin_class" class="mdl-switch mdl-js-switch mdl-js-ripple-effect mdl-js-ripple-effect--ignore-events">
                    <input id="pin" v-model.lazy="pin" class="mdl-switch__input" type="checkbox">
                    <span class="mdl-switch__label mdl-color-text--grey-900">
                        {{ $t('thread.settings.pin') }}
                    </span>
                </label>
            </div>

            <div class="label-item">
                <label for="mute" :class="mute_class" class="mdl-switch mdl-js-switch mdl-js-ripple-effect mdl-js-ripple-effect--ignore-events">
                    <input id="mute" v-model="mute" class="mdl-switch__input" type="checkbox">
                    <span class="mdl-switch__label mdl-color-text--grey-900">
                        {{ $t('thread.settings.mute') }}
                    </span>
                </label>
            </div>

            <div class="label-item">
                <label for="private" :class="private_class" class="mdl-switch mdl-js-switch mdl-js-ripple-effect mdl-js-ripple-effect--ignore-events">
                    <input id="private" v-model="private_notifications" class="mdl-switch__input" type="checkbox">
                    <span class="mdl-switch__label mdl-color-text--grey-900">
                        {{ $t('thread.settings.private') }}
                    </span>
                </label>
            </div>
        </div>
    </div>
</template>

<script>
import { Api, Util, SessionCache } from '@/utils/';

export default {
    name: 'ConversationSettings',
    props: [ 'conversationTitle', 'conversationId' ],

    data () {
        return {
            title: "Settings - " + this.conversation_title,
            phone_numbers: null,
            pin: false,
            mute: false,
            private_notifications: false,
            colors: { },
            hex: { },
            pin_class: "",
            mute_class: "",
            private_class: "",
            showColorSettings: false
        };
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
            Api.conversations.update(this.conversation_id, request);
        },
        'mute' () {
            let request = {
                account_id: this.$store.state.account_id,
                mute: this.mute
            };
            Api.conversations.update(this.conversation_id, request);
        },
        'private_notifications' () {
            let request = {
                account_id: this.$store.state.account_id,
                private_notifications: this.private_notifications
            };
            Api.conversations.update(this.conversation_id, request);
        }
    },

    mounted () {
        SessionCache.invalidateAllConversations();

        Api.conversations.getById(this.conversation_id)
            .then(response => this.processConversation(response));

        this.$store.commit("loading", false);
        this.$store.commit('title', this.title);
    },

    methods: {
        showColorDialog () {
            this.showColorSettings = true;
        },

        closeColorDialog () {
            this.showColorSettings = false;
        },

        processConversation (data) {
            this.phone_numbers = data.phone_numbers;
            this.title = "Settings - " + data.title;
            this.$store.commit('title', this.title);

            this.pin = data.pinned;
            this.mute = data.mute;
            this.private_notifications = data.private_notifications;

            this.colors = {
                default: data.color,
                dark: Util.expandColor(data.color_dark),
                accent: Util.expandColor(data.color_accent)
            };

            this.hex = {
                default: this.rgbaToHex(this.colors.default),
                dark: this.rgbaToHex(this.colors.dark),
                accent: this.rgbaToHex(this.colors.accent)
            };

            // This is a bit of a hack. I couldn't get the checkboxes to be checked, without
            // manually changing their class.

            if (this.pin) {
                this.pin_class = "is-upgraded is-checked";
            }

            if (this.mute) {
                this.mute_class = "is-upgraded is-checked";
            }

            if (this.private_notifications) {
                this.private_class = "is-upgraded is-checked";
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

            return "#" + hex.slice(0, (hex.length - 1)).join("");
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

            Api.conversations.update(this.conversation_id, request);
            this.closeColorDialog();
        }

    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
    @import "../../assets/scss/_vars.scss";

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

    .mdl-dialog {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10;
    }

    .mdl-dialog-card {
        width: 300px;
        min-height: 120px;
        margin: auto;
        margin-top: 100px;
        text-align: left;
    }

    .mdl-dialog-button-bar {
          margin-left: auto;
          margin-right: 24px;
    }

    body.dark {
        .item:hover, .click-item:hover {
            background: #202020;
        }
    }

</style>
