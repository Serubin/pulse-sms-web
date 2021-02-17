<template>
    <div id="settings">
        <div id="account-list" v-mdl class="page-content">
            <h4>{{ $t('settings.theme') }}</h4>

            <!-- Refresh Settings Button -->
            <div v-if="showSettingsRefresh" id="refresh_settings" class="click-item mdl-js-button mdl-js-ripple-effect" @click="refreshSettings">
                <div class="mdl-color-text--grey-900">
                    {{ $t('settings.refresh') }}
                </div>
                <div class="mdl-color-text--grey-600">
                    {{ $t('settings.explanatory_intro') }}
                </div>
            </div>
            <!-- End Refresh settings button -->

            <div id="base-theme" class="click-item mdl-js-button mdl-js-ripple-effect" @click="theme_menu.toggle()">
                <!-- Base theme -->
                <div class="mdl-color-text--grey-900">
                    {{ $t('settings.base') }}
                </div>
                <div class="mdl-color-text--grey-600">
                    {{ base_theme }}
                </div>
            </div>

            <ul id="base-theme-menu"
                class="mdl-menu mdl-js-menu mdl-js-ripple-effect mdl-menu--unaligned" data-mdl-for="base-theme"
            >
                <li class="mdl-menu__item" @click="theme='day_night'">
                    {{ $t('settings.daynight') }}
                </li>
                <li class="mdl-menu__item" @click="theme='light'">
                    {{ $t('settings.light') }}
                </li>
                <li class="mdl-menu__item" @click="theme='dark'">
                    {{ $t('settings.dark') }}
                </li>
                <li class="mdl-menu__item" @click="theme='black'">
                    {{ $t('settings.black') }}
                </li>
            </ul><!-- End Base Theme -->

            <div class="click-item mdl-js-button mdl-js-ripple-effect" @click="showColorDialog">
                <!-- Global Colors -->
                <div class="mdl-color-text--grey-900">
                    {{ $t('settings.primary') }}, {{ $t('settings.darkprimary') }}, {{ $t('settings.accent') }}
                </div>
                <div class="mdl-color-text--grey-600">
                    {{ global_colors }}
                </div>
            </div> <!-- End Global Colors -->

            <div v-if="showColorSettings" class="mdl-dialog">
                <div class="mdl-dialog__content mdl-dialog-card mdl-card">
                    <h4>Update Theme Colors</h4>
                    <div class="container">
                        <div class="mdl-textfield mdl-js-textfield horizontal">
                            {{ $t('settings.primary') }}
                            <sketch-picker v-model="themeDefault" :disable-alpha="true" :preset-colors="presetColors" />
                        </div>
                        <div class="mdl-textfield mdl-js-textfield horizontal">
                            {{ $t('settings.darkprimary') }}
                            <sketch-picker v-model="themeDark" :disable-alpha="true" :preset-colors="presetColors" />
                        </div>
                        <div class="mdl-textfield mdl-js-textfield horizontal">
                            {{ $t('settings.accent') }}
                            <sketch-picker v-model="themeAccent" :disable-alpha="true" :preset-colors="presetColors" />
                        </div>
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

            <!-- Use Global Theme -->
            <div class="label-item">
                <label for="global-theme" class="mdl-switch mdl-js-switch mdl-js-ripple-effect mdl-js-ripple-effect--ignore-events">
                    <input id="global-theme" v-model="global_theme" class="mdl-switch__input" type="checkbox">
                    <span class="mdl-switch__label mdl-color-text--grey-900">
                        {{ $t('settings.applyeverywhere') }}
                    </span>
                </label>
            </div> <!-- End Global Theme -->

            <br>

            <!-- Apply Primary Color to App Bar -->
            <div class="label-item">
                <label for="theme-appbar" class="mdl-switch mdl-js-switch mdl-js-ripple-effect mdl-js-ripple-effect--ignore-events">
                    <input id="theme-appbar" v-model="theme_appbar" class="mdl-switch__input" type="checkbox">
                    <span class="mdl-switch__label mdl-color-text--grey-900">
                        {{ $t('settings.applyprimary') }}
                    </span>
                </label>
            </div>
            <!-- End Apply Primary Color to App Bar -->

            <br>

            <!-- Display Timestamp on Every Message -->
            <div class="label-item">
                <label for="theme-message-timestamp" class="mdl-switch mdl-js-switch mdl-js-ripple-effect mdl-js-ripple-effect--ignore-events">
                    <input id="theme-message-timestamp" v-model="theme_message_timestamp" class="mdl-switch__input" type="checkbox">
                    <span class="mdl-switch__label mdl-color-text--grey-900">
                        {{ $t('settings.messagetimestamp') }}
                    </span>
                </label>
            </div>
            <!-- End Display Timestamp on Every Message -->

            <br>

            <!-- Display Conversations in Date Categories -->
            <div class="label-item">
                <label for="theme-conversation-categories" class="mdl-switch mdl-js-switch mdl-js-ripple-effect mdl-js-ripple-effect--ignore-events">
                    <input id="theme-conversation-categories" v-model="theme_conversation_categories" class="mdl-switch__input" type="checkbox">
                    <span class="mdl-switch__label mdl-color-text--grey-900">
                        {{ $t('settings.conversationcategories') }}
                    </span>
                </label>
            </div>
            <!-- End Display Conversations in Date Categories -->

            <br>
            <h4>{{ $t('settings.webspecific') }}</h4>
            <br>
            <div v-if="showNotification" class="label-item">
                <label for="show-notifications" class="mdl-switch mdl-js-switch mdl-js-ripple-effect mdl-js-ripple-effect--ignore-events">
                    <input id="show-notifications" v-model="show_notifications" class="mdl-switch__input" type="checkbox">
                    <span class="mdl-switch__label mdl-color-text--grey-900">
                        {{ $t('settings.shownotifs') }}
                    </span>
                </label>
            </div>

            <br>

            <div class="label-item">
                <label for="enter-to-send" class="mdl-switch mdl-js-switch mdl-js-ripple-effect mdl-js-ripple-effect--ignore-events">
                    <input id="enter-to-send" v-model="enter_to_send" class="mdl-switch__input" type="checkbox">
                    <span class="mdl-switch__label mdl-color-text--grey-900">
                        {{ $t('settings.entersend') }}
                    </span>
                </label>
            </div>
        </div>
    </div>
</template>

<script>
import { Sketch } from 'vue-color';
import { Api, Util, Platform, i18n } from '@/utils/';

export default {
    name: 'Settings',
    components: {
        'sketch-picker': Sketch
    },

    data () {
        return {
            title: 'Settings',
            global_theme: this.$store.state.theme_use_global,
            theme_appbar: this.$store.state.theme_apply_appbar_color,
            theme_message_timestamp: this.$store.state.theme_message_timestamp,
            theme_conversation_categories: this.$store.state.theme_conversation_categories,
            show_notifications: this.$store.state.notifications,
            enter_to_send: this.$store.state.enter_to_send,
            theme: this.$store.state.theme_base,
            themeDefault: this.rgbaToHex(this.$store.state.theme_global_default).length > 1 ? this.rgbaToHex(this.$store.state.theme_global_default) : '#1775D2',
            themeDark: this.rgbaToHex(this.$store.state.theme_global_dark).length > 1 ? this.rgbaToHex(this.$store.state.theme_global_dark) : '#1665C0',
            themeAccent: this.rgbaToHex(this.$store.state.theme_global_accent).length > 1 ? this.rgbaToHex(this.$store.state.theme_global_accent) : '#FF6E40',
            theme_menu: null,
            showColorSettings: false,
            presetColors: ['#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#1775D2', '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FDD835', '#FFC411', '#FF9800', '#FF5722', '#9E9E9E', '#607D8B', '#374248']
        };
    },

    computed: {
        base_theme () {
            let base = this.$store.state.theme_base;
            base = base.split('_');
            base.forEach((b, i) => {
                base[i] = b.charAt(0).toUpperCase() + b.slice(1);
            });

            return base.join(' / ');
        },

        global_colors () {
            const defaul = this.$store.state.theme_global_default;
            const dark = this.$store.state.theme_global_dark;
            const accent = this.$store.state.theme_global_accent;

            if (!defaul && !dark && !accent) {
                return '#1775D2, #1665C0, #FF6E40';
            } else {
                const defaultHex = this.rgbaToHex(defaul);
                const darkHex = this.rgbaToHex(dark);
                const accentHex = this.rgbaToHex(accent);

                const defaultString = defaultHex.length > 1 ? defaultHex : '#1775D2';
                const darkString = darkHex.length > 1 ? darkHex : '#1665C0';
                const accentString = accentHex.length > 1 ? accentHex : '#FF6E40';

                return defaultString + ', ' + darkString + ', ' + accentString;
            }
        },

        use_global_theme () {
            return this.boolToStr(this.$store.state.theme_use_global);
        },

        apply_primary_color_to_appbar () {
            return this.boolToStr(this.$store.state.theme_apply_appbar_color);
        },

        showSettingsRefresh () {
            // I don't want to remove this completely, it could be useful in the future, but we are refreshing the user's settings
            // each time the app is loaded, so this isn't necessary.
            return false;
        },

        showNotification () {
            return Platform.isWebsite();
        }
    },
    watch: {
        'show_notifications' () {
            this.$store.commit('notifications', this.show_notifications);
            Util.requestNotifications();
        },
        'enter_to_send' () {
            this.$store.commit('enter_to_send', this.enter_to_send);
        },
        'global_theme' () {
            this.$store.commit('theme_use_global', this.global_theme);
            Api.account.settings.update('apply_theme_globally', 'boolean', this.global_theme);
        },
        'theme_appbar' () {
            this.$store.commit('theme_apply_appbar_color', this.theme_appbar);
            Api.account.settings.update('apply_primary_color_toolbar', 'boolean', this.theme_appbar);
        },
        'theme_conversation_categories' () {
            this.$store.commit('theme_conversation_categories', this.theme_conversation_categories);
            Api.account.settings.update('conversation_categories', 'boolean', this.theme_conversation_categories);
        },
        'theme_message_timestamp' () {
            this.$store.commit('theme_message_timestamp', this.theme_message_timestamp);
            Api.account.settings.update('message_timestamp', 'boolean', this.theme_message_timestamp);
        },
        'theme' () {
            this.$store.commit('theme_base', this.theme);
            Api.account.settings.update('base_theme', 'string', this.theme);
        },
        '$store.state.theme_global_default' () {
            const color = this.$store.state.theme_global_default;
            if (!color) {
                this.themeDefault = '#1775D2';
            } else {
                this.themeDefault = this.rgbaToHex(color);
            }
        },
        '$store.state.theme_global_dark' () {
            const color = this.$store.state.theme_global_dark;
            if (!color) {
                this.themeDark = '#1665C0';
            } else {
                this.themeDark = this.rgbaToHex(color);
            }
        },
        '$store.state.theme_global_accent' () {
            const color = this.$store.state.theme_global_accent;
            if (!color) {
                this.themeAccent = '#FF6E40';
            } else {
                this.themeAccent = this.rgbaToHex(color);
            }
        },
        'showColorSettings' () {
            if (this.showColorSettings) {
                document.querySelector('#sidebar').style['z-index'] = 0;
            } else {
                document.querySelector('#sidebar').style['z-index'] = 3;
            }
        }
    },

    mounted () {
        Api.account.settings.get()
            .then(() => {
                this.$store.commit('loading', false);
            });

        this.$store.commit('title', this.title);
        this.$store.state.msgbus.$on('refresh-btn', this.refreshSettings);

        const themeMenuEl = this.$el.querySelector('#base-theme-menu');
        this.theme_menu = themeMenuEl.MaterialMenu;
    },

    beforeDestroy () {
        this.$store.state.msgbus.$off('refresh-btn', this.refreshSettings);
    },

    methods: {
        refreshSettings () {
            Api.account.settings.get();
            Util.snackbar('Settings Refreshed');
        },

        showColorDialog () {
            this.showColorSettings = true;
        },

        closeColorDialog () {
            this.showColorSettings = false;
        },

        /**
         * rgbaToHex
         * Converts rgba (css value, str) to string hex value (css)
         * @param string - rgba(x, y, z, aa)
         * @return #0x0y0z
         */
        rgbaToHex (rgba) {
            const colorComps = rgba.match(/[0-9]+/g);
            let str16;
            const hex = [];

            for (const c of colorComps) {
                // Parse to b16
                str16 = parseInt(c).toString(16);
                // Normalize
                str16 = str16.length === 1 ? '0' + str16 : str16;

                hex.push(str16);
            }

            return '#' + hex.slice(0, (hex.length - 1)).join('');
        },
        hexToRgb (hex) {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            const a = 255 & 0xFF;

            return (r << 16) + (g << 8) + (b << 0) + (a << 24);
        },
        /**
         * Bool to Yes/No
         */
        boolToStr (bool) {
            return bool ? i18n.t('settings.yes') : i18n.t('settings.no');
        },
        saveColors () {
            if (this.themeDefault.hex) {
                this.themeDefault = this.themeDefault.hex;
            }
            if (this.themeDark.hex) {
                this.themeDark = this.themeDark.hex;
            }
            if (this.themeAccent.hex) {
                this.themeAccent = this.themeAccent.hex;
            }

            // Convert hex to RGB Int
            const themeDefault = this.hexToRgb(this.themeDefault);
            const themeDark = this.hexToRgb(this.themeDark);
            const themeAccent = this.hexToRgb(this.themeAccent);

            // Update value on remote server
            Api.account.settings.update('global_primary_color', 'int', themeDefault);
            Api.account.settings.update('global_primary_dark_color', 'int', themeDark);
            Api.account.settings.update('global_accent_color', 'int', themeAccent);

            // // Store rgba value in store
            this.$store.commit('theme_global_default', Util.expandColor(themeDefault));
            this.$store.commit('theme_global_dark', Util.expandColor(themeDark));
            this.$store.commit('theme_global_accent', Util.expandColor(themeAccent));

            this.$store.commit('colors_default', Util.expandColor(themeDefault));
            this.$store.commit('colors_dark', Util.expandColor(themeDark));
            this.$store.commit('colors_accent', Util.expandColor(themeAccent));

            this.closeColorDialog();
        }

    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
    @import "../assets/scss/_vars.scss";

    .horizontal {
        display: inline-block;
        position:relative;
    }

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

    body.dark {
        .item:hover, .click-item:hover {
            background: #202020;
        }
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
        width: 770px;
        min-height: 120px;
        margin: auto;
        margin-top: 100px;
        text-align: left;
    }

    .mdl-textfield {
        width: auto;
        margin: 10px;
    }

    .mdl-dialog-button-bar {
          margin-left: auto;
          margin-right: 24px;
    }

</style>
