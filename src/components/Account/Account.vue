<template>
     <div id="account" >
         <div class="page-content" id="account-list" v-mdl>
            <h4>Account Statistics</h4>
            <div class="click-item" v-mdl @click="routeTo('statistics')">View Account Statistics</div>
            <div class="item" v-mdl>{{ account_counts.message_count }} Messages</div>
            <div class="item" v-mdl>{{ account_counts.conversation_count }} Conversations</div>
            <div class="item" v-mdl>{{ account_counts.scheduled_count }} Scheduled Messages</div>
            <div class="item" v-mdl>{{ account_counts.blacklist_count }} Blacklisted Numbers</div>

            <h4>Account Managment</h4>
            <div class="click-item" v-mdl @click="routeTo('password')">Update Email or Password</div>
            <div class="click-item" v-mdl @click="routeTo('devices')">{{ account_counts.device_count }} Devices</div>
            <div class="click-item" v-mdl @click="routeTo('drafts')">{{ account_counts.draft_count }} Drafts</div>
            <div class="click-item" v-mdl @click="routeTo('contact')">{{ account_counts.contact_count }} Contacts</div>
            <div class="click-item" v-mdl @click="routeTo('templates')">{{ account_counts.template_count }} Templates</div>
            <div class="click-item" v-mdl @click="routeTo('auto_replies')">{{ account_counts.auto_reply_count }} Auto Replies</div>
            <div class="click-item" v-mdl @click="routeTo('folders')">{{ account_counts.folder_count }} Folders</div>
        </div>

    </div>
</template>

<script>
import { Api, Util } from '@/utils/'
import Spinner from '@/components/Spinner.vue'

export default {
    name: 'account',

    mounted () {
        this.fetchAccount()

        this.$store.commit('title', this.title);
        this.$store.state.msgbus.$on('refresh-btn', this.fetchAccounnt);
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

    methods: {
        fetchAccount () {
            Api.fetchAccount().then(response => this.processAccount(response));
        },

        processAccount (response) {
            this.account_counts = response.data;
            this.$store.commit("loading", false);
        },

        routeTo (route) {

        }
    },

    components: {
        Spinner
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
