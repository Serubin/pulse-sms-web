<template>
    <div id="account-list" v-mdl class="page-content">
        <h4>Get Help</h4>
        <div class="item">
            <div class="mdl-color-text--grey-600">
                I have created a very extensive FAQ section for the app.<br>As a one-man crew, I get a significant amount of emails, and they cut heavily into my development time. Before sending an email, do a quick search to free up time for both of us. You will probably find your answer, very easily.<br><br>If you don't find what you are looking for, feel free to reach out and I will be more than happy to get back to you as quickly as I am able.
            </div>
        </div>
        <div class="click-item" :href="urls.help" @click.stop.prevent="routeTo(urls.help)">
            <div class="mdl-color-text--grey-900">
                Help Page
            </div>
            <div class="mdl-color-text--grey-600">
                Search here, first!
            </div>
        </div>
        <div class="click-item" :href="urls.twitter" @click.stop.prevent="routeTo(urls.twitter)">
            <div class="mdl-color-text--grey-900">
                Twitter
            </div>
            <div class="mdl-color-text--grey-600">
                @PulseSMS
            </div>
        </div>
        <div class="click-item" :href="urls.email" @click.stop.prevent="routeTo(urls.email)">
            <div class="mdl-color-text--grey-900">
                Email
            </div>
            <div class="mdl-color-text--grey-600">
                pulsesmsapp@gmail.com
            </div>
        </div>

        <h4>Information</h4>
        <div class="click-item mdl-color-text--grey-900" :href="urls.overview" @click.stop.prevent="routeTo(urls.overview)">
            Features & Supported Platforms
        </div>
        <div class="click-item mdl-color-text--grey-900" @click="routeTo('https://github.com/klinker-apps/pulse-sms-issues/issues/344')">
            Web Shortcut Keys
        </div>
        <div class="click-item mdl-color-text--grey-900" :href="urls.privacy" @click.stop.prevent="routeTo(urls.privacy)">
            Privacy Policy
        </div>
        <div class="click-item mdl-color-text--grey-900" :href="urls.tos" @click.stop.prevent="routeTo(urls.tos)">
            Terms of Service
        </div>

        <License />
    </div>
</template>

<script>
import License from '@/components/License';

export default {
    name: 'HelpFeedback',
    components: {
        License
    },

    data () {
        return {
            title: 'Help and Feedback',
            loading: false,
            urls: {
                help: 'https://home.pulsesms.app/help/',
                overview: 'https://home.pulsesms.app/overview/',
                twitter: 'https://twitter.com/pulsesms',
                email: 'mailto:pulsesmsapp@gmail.com?subject=Pulse%20SMS',
                privacy: 'https://home.pulsesms.app/privacy.html',
                tos: 'https://home.pulsesms.app/tos.html'
            }
        };
    },

    mounted () {
        this.$store.commit('title', this.title);
    },

    methods: {
        routeTo (route) {
            window.open(route, '_blank');
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
