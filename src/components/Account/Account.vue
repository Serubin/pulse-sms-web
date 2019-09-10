<template>
    <div id="account">
        <div id="account-list" v-mdl class="page-content">
            <div v-if="showSubscriptionUpgrade" class="mdl-color-text--grey-600">
                {{ $t('account.upgrade_subscription') }}
            </div>
            <h4>Account Statistics</h4>
            <div v-mdl class="click-item" @click="routeTo('statistics')">
                View Account Statistics
            </div>
            <div v-mdl class="item">
                {{ account_counts.message_count }} Messages
            </div>
            <div v-mdl class="item">
                {{ account_counts.conversation_count }} Conversations
            </div>
            <div v-mdl class="item">
                {{ account_counts.scheduled_count }} Scheduled Messages
            </div>
            <div v-mdl class="item">
                {{ account_counts.blacklist_count }} Blacklisted Numbers
            </div>

            <h4>Account Managment</h4>
            <div v-mdl class="click-item" @click="routeTo('password')">
                Update Email or Password
            </div>
            <div v-mdl class="click-item" @click="routeTo('devices')">
                {{ account_counts.device_count }} Devices
            </div>
            <div v-mdl class="click-item" @click="routeTo('drafts')">
                {{ account_counts.draft_count }} Drafts
            </div>
            <div v-mdl class="click-item" @click="routeTo('contacts')">
                {{ account_counts.contact_count }} Contacts
            </div>
            <div v-mdl class="click-item" @click="routeTo('templates')">
                {{ account_counts.template_count }} Templates
            </div>
            <div v-mdl class="click-item" @click="routeTo('auto-replies')">
                {{ account_counts.auto_reply_count }} Auto Replies
            </div>
            <div v-mdl class="click-item" @click="routeTo('account-folders')">
                {{ account_counts.folder_count }} Folders
            </div>
        </div>
    </div>
</template>

<script>
import { Api } from '@/utils/'

export default {
    name: 'Account',

    components: {
    },

    data () {
        return {
            title: "My Account",
            loading: true,

            account_counts: {
                message_count: '',
                conversation_count: '',
                scheduled_count: '',
                blacklist_count: '',

                device_count: '',
                draft_count: '',
                contact_count: '',
                template_count: '',
                auto_reply_count: '',
                folder_count: ''
            }
        }
    },

    computed: {
        showSubscriptionUpgrade () {
            // If the user has the lifetime subscription, we shouldn't show this.
            return this.$store.state.subscription_type != 3;
        }
    },

    mounted () {
        this.fetchAccount()

        this.$store.commit('title', this.title);
        this.$store.state.msgbus.$on('refresh-btn', this.fetchAccounnt);
    },

    beforeDestroy () {
        this.$store.state.msgbus.$off('refresh-btn', this.fetchAccount);
    },

    methods: {
        fetchAccount () {
            Api.account.get().then(response => this.processAccount(response));
        },

        processAccount (response) {
            this.account_counts = response.data;
            this.$store.commit("loading", false);
        },

        routeTo (route) {
            if (route == 'password') {
                window.open('https://messenger.klinkerapps.com/forgot_password.html','_blank');
            } else if (route == 'statistics') {
                window.open('https://messenger.klinkerapps.com/account_statistics.html','_blank');
            } else {
                this.$router.push({ name: route });
            }
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
    @import "../../assets/scss/_vars.scss";

    .item, .click-item {
        position: relative;
        width: 100%;
        padding: 8px;
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
