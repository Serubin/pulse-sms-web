<template>
     <div id="settings" >
         <div class="page-content" id="account-list" v-mdl>
             <!-- Refresh Settings Button -->
            <div class="click-item mdl-js-button mdl-js-ripple-effect" id="refresh_settings" @click="refreshSettings">
                <div class="mdl-color-text--grey-900">
                    Refresh settings from phone
                </div>
                <div class="mdl-color-text--grey-600">
                    These settings are pulled from the app, when you click this preference.
                </div>
                <br>
                <div class="mdl-color-text--grey-600">
                    If they don't seem to be getting updated, change them to something else on the phone, then change them back to what you want.
                </div>
            </div>
            <!-- End Refresh settings button -->

            <div class="item mdl-js-button mdl-js-ripple-effect"> <!-- Base theme -->
                <div class="mdl-color-text--grey-900">Base Theme</div>
                <div class="mdl-color-text--grey-600">{{ base_theme }}</div>
            </div> <!-- End Base Theme -->
            <div class="item mdl-js-button mdl-js-ripple-effect"> <!-- Round Bubbles -->
                <div class="mdl-color-text--grey-900">Rounder Message Bubbles</div>
                <div class="mdl-color-text--grey-600">{{ round_bubbles }}</div>
            </div> <!-- End Round Bubbles -->
            <div class="item mdl-js-button mdl-js-ripple-effect"> <!-- Global Colors -->
                <div class="mdl-color-text--grey-900">Primary Color, Primary Color Dark, Accent Color</div>
                <div class="mdl-color-text--grey-600">{{ global_colors }}</div>
            </div> <!-- End Global Colors -->
            <div class="item mdl-js-button mdl-js-ripple-effect"> <!-- Use global theme -->
                <div class="mdl-color-text--grey-900">Apply to all Conversations</div>
                <div class="mdl-color-text--grey-600">{{ use_global_theme }}</div>
            </div> <!-- End use global Theme -->
            <br />
            <h4>Web Settings</h4>
            <br />
            <label for="colored-toolbar" class="mdl-switch mdl-js-switch mdl-js-ripple-effect mdl-js-ripple-effect--ignore-events">
                <input id="colored-toolbar" class="mdl-switch__input" type="checkbox" v-model="colored_toolbar">
                <span class="mdl-switch__label mdl-color-text--grey-900">
                    Use colored toolbar
                </span>
            </label>
            <br />
            <br />
            <label for="show-notifications" class="mdl-switch mdl-js-switch mdl-js-ripple-effect mdl-js-ripple-effect--ignore-events">
                <input id="show-notifications" class="mdl-switch__input" type="checkbox" v-model="show_notifications">
                <span class="mdl-switch__label mdl-color-text--grey-900">
                    Show Notifications
                </span>
            </label>
        </div>
    </div>
</template>

<script>
import { Api } from '@/utils/'

export default {
    name: 'settings',

    mounted () {
        Api.fetchSettings()
            .then( response => {
                this.$store.commit("loading", false);
            })
    },

    data () {
        return {
            colored_toolbar: this.$store.state.theme_toolbar,
            show_notifications: this.$store.state.notifications,
        }
    },

    computed: {
        base_theme () {
            let base = this.$store.state.theme_base;
            base = base.charAt(0).toUpperCase() + base.slice(1);

            return base;
        },

        global_colors () {
            const defaul = this.$store.state.theme_global_default;
            const dark = this.$store.state.theme_global_dark;
            const accent = this.$store.state.theme_global_accent;

            return this.rgbaToHex(defaul) 
                + ", " + this.rgbaToHex(dark) 
                + ", " + this.rgbaToHex(accent);
        },

        use_global_theme () {
            return this.boolToStr(this.$store.state.theme_use_global);
        },

        round_bubbles () {
            return this.boolToStr(this.$store.state.theme_round);
        }
    },

    methods: {
        refreshSettings () {
            Api.fetchSettings();
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
        /**
         * Bool to Yes/No
         */
        boolToStr (bool) {
            return bool ? "Yes" : "No";
        }
    },
    watch: {
        'show_notifications' () {
            this.$store.commit('notifications', this.show_notifications)
        },
        'colored_toolbar' () {
            this.$store.commit('theme_toolbar', this.colored_toolbar)
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
    @import "../assets/scss/_vars.scss";

    .item, .click-item {
        position: relative;
        width: 100%;
        padding: 16px;
        line-height: 18px;
    }

</style>
