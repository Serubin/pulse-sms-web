<template>
    <div id="scheduled-message-list" class="page-content">

        <!-- Spinner On load -->
        <spinner class="spinner" v-if="scheduled_messages.length == 0 && loading"></spinner>

        <!-- If no Messages -->
        <p class="empty-message" v-if="scheduled_messages.length == 0 && !loading">No Scheduled Messages</p>

        <!-- Conversation items -->
        <transition-group name="flip-list" tag="div">
            <component v-for="message in scheduled_messages" :is="'ScheduledMessageItem'" :message-data="message" :key="message.hash"/>
        </transition-group>

        <button tag="button" class="create-scheduled-message mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored" @click="createScheduledMessage" :style="{ background: $store.state.colors_accent }" v-mdl>
            <i class="material-icons md-light">add</i>
        </button>
    </div>
</template>

<script>
import Vue from 'vue';
import Hash from 'object-hash'
import { Util, Api } from '@/utils'
import ScheduledMessageItem from './ScheduledMessageItem.vue'
import Spinner from '@/components/Spinner.vue'

export default {
    name: 'scheduled-messages',

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
        this.$store.state.msgbus.$off('refresh-btn');
    },

    methods: {

        fetchScheduledMessages () {
            Api.fetchScheduledMessages()
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
    },

    data () {
        return {
            title: "",
            loading: true,
            scheduled_messages: [],
        }
    },

    components: {
        ScheduledMessageItem,
        Spinner
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
