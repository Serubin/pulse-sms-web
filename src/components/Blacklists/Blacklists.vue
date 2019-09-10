<template>
    <div id="blacklists-list" class="page-content">
        <!-- Spinner On load -->
        <spinner v-if="blacklists.length == 0 && loading" class="spinner" />

        <!-- If no Folders -->
        <p v-if="blacklists.length == 0 && !loading" class="empty-message">
            {{ $t('blacklist.none') }}
        </p>

        <!-- Conversation items -->
        <transition-group name="flip-list" tag="div">
            <component :is="'BlacklistItem'" v-for="blacklist in blacklists" :key="blacklist.hash" :blacklist-data="blacklist" />
        </transition-group>

        <button v-mdl tag="button" class="create-blacklist mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored" :style="{ background: $store.state.colors_accent }" @click="createBlacklist">
            <i class="material-icons md-light">add</i>
        </button>
    </div>
</template>

<script>

import Hash from 'object-hash';
import { Api } from '@/utils';
import BlacklistItem from './BlacklistItem.vue';
import Spinner from '@/components/Spinner.vue';

export default {
    name: 'Blacklists',

    components: {
        BlacklistItem,
        Spinner
    },

    data () {
        return {
            title: "",
            loading: true,
            blacklists: [],
        };
    },

    mounted () {
        this.$store.state.msgbus.$on('refresh-btn', this.refresh);

        this.fetchBlacklists();

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

        fetchBlacklists () {
            Api.blacklist.get()
                .then(response => this.processBlacklists(response));
        },

        processBlacklists (response) {
            const renderList = [];

            for(let i = 0; i < response.length; i++) {
                const item = response[i];
                item.hash = Hash(item);

                renderList.push(item);
            }

            this.blacklists = renderList;
            this.loading = false;

            this.$store.commit("loading", false);
            this.$store.commit('title', this.title);
        },

        refresh () {
            this.loading = true;
            this.fetchBlacklists();
        },

        createBlacklist () {
            this.$router.push({ name: 'create-blacklist'});
        }
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
    @import "../../assets/scss/_vars.scss";

    .empty-message {
        color: rgba(0, 0, 0, 0.54);
        margin: 6em auto;
        width: 11.5em;
    }

    .create-blacklist {
        position: fixed;
        bottom: 0%;
        right: 0%;
        z-index: 3;
        margin: 24px;
    }

    #blacklists-list {
        width: 100%;

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
