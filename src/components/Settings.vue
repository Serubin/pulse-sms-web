<template>
     <div id="settings" >
         <div class="page-content" id="account-list" v-mdl>
             <!-- Refresh Settings Button -->
            <div class="click-item mdl-js-button mdl-js-ripple-effect" id="refresh_settings">
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

            <label for="colored-toolbar" class="mdl-switch mdl-js-switch mdl-js-ripple-effect mdl-js-ripple-effect--ignore-events">
                <input id="colored-toolbar" class="mdl-switch__input" type="checkbox" v-model="colored_toolbar">
                <span class="mdl-switch__label mdl-color-text--grey-900">
                    Use colored toolbar
                </span>
            </label>

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
export default {
    name: 'settings',
    mounted () {
        this.$store.dispatch("loading", false);
    },
    data () {
        return {
            base_theme: false,
            round_bubbles: false,
            global_colors: false,
            use_global_theme: false,
            colored_toolbar: false,
            show_notifications: false,
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
