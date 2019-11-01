<template>
    <div id="account-list" v-mdl class="page-content">
        <h4>Get Help</h4>
        <div class="item">
            <div class="mdl-color-text--grey-600">
                I have created a very extensive FAQ section for the app.<br>As a one-man crew, I get a significant amount of emails, and they cut heavily into my development time. Before sending an email, do a quick search to free up time for both of us. You will probably find your answer, very easily.<br><br>If you don't find what you are looking for, feel free to reach out and I will be more than happy to get back to you as quickly as I am able.
            </div>
        </div>
        <div class="click-item" @click="routeTo('https://messenger.klinkerapps.com/help')">
            <div class="mdl-color-text--grey-900">
                Help Page
            </div>
            <div class="mdl-color-text--grey-600">
                Search here, first!
            </div>
        </div>
        <div class="click-item" @click="routeTo('https://twitter.com/klinkerapps')">
            <div class="mdl-color-text--grey-900">
                Twitter
            </div>
            <div class="mdl-color-text--grey-600">
                @KlinkerApps
            </div>
        </div>
        <div class="click-item" @click="routeTo('mailto:luke@klinkerapps.com?subject=Pulse%20SMS')">
            <div class="mdl-color-text--grey-900">
                Email
            </div>
            <div class="mdl-color-text--grey-600">
                luke@klinkerapps.com
            </div>
        </div>

        <h4>Information</h4>
        <div class="click-item mdl-color-text--grey-900" @click="routeTo('https://github.com/klinker24/messenger-web/releases')">
            Web App Changelog
        </div>
        <div class="click-item mdl-color-text--grey-900" @click="routeTo('https://messenger.klinkerapps.com/overview/')">
            Pulse's Features
        </div>
        <div class="click-item mdl-color-text--grey-900" @click="routeTo('https://messenger.klinkerapps.com/overview/')">
            Supported Platforms
        </div>
        <div class="click-item mdl-color-text--grey-900" @click="routeTo('https://github.com/klinker-apps/messenger-issues/issues/344')">
            Web Shortcut Keys
        </div>
        <div class="click-item mdl-color-text--grey-900" @click="routeTo('https://messenger.klinkerapps.com/privacy.html')">
            Privacy Policy
        </div>

        <h4>Contributions</h4>
        <div class="item">
            <div class="mdl-color-text--grey-900">
                © 2019 Luke and Jake Klinker
            </div>
        </div>
        <div class="click-item" @click="routeTo('https://github.com/klinker24/messenger-web/')">
            <div class="mdl-color-text--grey-900">
                Pulse's web app is open-source
            </div>
            <div class="mdl-color-text--grey-600">
                Thanks to everyone that has contributed their ideas and code!
            </div>
        </div>
        <div class="item">
            <div class="mdl-color-text--grey-900">
                Special Thanks
            </div>
            <div class="mdl-color-text--grey-600">
                Solomon Rubin for creating the base for this web app.
            </div>
        </div>
    </div>
</template>

<script>

export default {
    name: 'HelpFeedback',

    data () {
        return {
            title: "Help and Feedback",
            loading: false,
        };
    },

    mounted () {
        this.$store.commit('title', this.title);
    },

    methods: {
        routeTo (route) {
            window.open(route,'_blank');
        }
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
    @import "../assets/scss/_vars.scss";

    .item, .click-item {
        position: relative;
        width: 100%;
        padding: 12px;
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

</style>
