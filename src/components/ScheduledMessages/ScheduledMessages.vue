<template>
    <div id="scheduled-message-list" class="page-content">
        <!-- Spinner On load -->
        <spinner v-if="scheduled_messages.length == 0 && loading" class="spinner" />

        <!-- If no Messages -->
        <p v-if="scheduled_messages.length == 0 && !loading" class="empty-message">
            No Scheduled Messages
        </p>

        <!-- Conversation items -->
        <transition-group name="flip-list" tag="div">
            <component :is="'ScheduledMessageItem'" v-for="message in scheduled_messages" :key="message.hash" :message-data="message" />
        </transition-group>

        <button v-mdl tag="button" class="create-scheduled-message mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored" :style="{ background: $store.state.colors_accent }" @click="createScheduledMessage">
            <i class="material-icons md-light">add</i>
        </button>
    </div>
</template>

<script>

import Hash from 'object-hash'
import { Api } from '@/utils'
import ScheduledMessageItem from './ScheduledMessageItem.vue'
import Spinner from '@/components/Spinner.vue'

export default {
    name: 'ScheduledMessages',

    components: {
        ScheduledMessageItem,
        Spinner
    },

    data () {
        return {
            title: "",
            loading: true,
            scheduled_messages: [],
        }
    },

    mounted () {
        this.$store.state.msgbus.$on('refresh-btn', this.refresh);

        this.fetchScheduledMessages();

        // Construct colors object from saved global theme
        const colors = {
            'default': this.$store.state.theme_global_default,
            'dark': this.$store.state.theme_global_dark,
            'accent': this.$store.state.theme_global_accent,
        };

        // Commit them to current application colors
        this.$store.commit('colors', colors);
    },

    beforeDestroy () {
        this.$store.state.msgbus.$off('refresh-btn', this.refresh);
    },

    methods: {

        fetchScheduledMessages () {
            Api.scheduledMessages.get()
                .then(response => this.processScheduledMessages(response));
        },

        processScheduledMessages (response) {
            const renderList = [];

            for(let i = 0; i < response.length; i++) {
                const item = response[i];
                item.hash = Hash(item);

                renderList.push(item);
            }

            this.scheduled_messages = renderList;
            this.loading = false;

            this.$store.commit("loading", false);
            this.$store.commit('title', this.title);
        },

        refresh () {
            this.loading = true;
            this.fetchScheduledMessages();
        },

        createScheduledMessage () {
            this.$router.push({ name: 'create-scheduled-message'});
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
    @import "../../assets/scss/_vars.scss";

    .empty-message {
        color: rgba(0, 0, 0, 0.54);
        margin: 6em auto;
        width: 11.5em;
    }

    .create-scheduled-message {
        position: fixed;
        bottom: 0%;
        right: 0%;
        z-index: 3;
        margin: 24px;
    }

    #scheduled-message-list {
        width: 100%;
        min-height: 200px;
        margin-top: 36px !important;

        .spinner {
            margin-top: 100px;
        }
    }

    .flip-list-enter, .flip-list-leave-to	{
        opacity: 0;
    }

    .flip-list-leave-active {
        position: absolute;
    }

    .flip-list-move {
        transition: transform $anim-time;
    }

    body.dark {
        .empty-message {
            color: rgba(255, 255, 255, 0.54);
        }
    }
</style>
