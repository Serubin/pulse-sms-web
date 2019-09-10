<template>
    <div id="folders-list" class="page-content">
        <!-- Spinner On load -->
        <spinner v-if="folders.length == 0 && loading" class="spinner" />

        <!-- If no Folders -->
        <p v-if="folders.length == 0 && !loading" class="empty-message">
            No Folders
        </p>

        <!-- Conversation items -->
        <transition-group name="flip-list" tag="div">
            <component :is="'FolderItem'" v-for="folder in folders" :key="folder.hash" :folder-data="folder" />
        </transition-group>
    </div>
</template>

<script>

import Hash from 'object-hash'
import { Api } from '@/utils'
import FolderItem from './FolderItem.vue'
import Spinner from '@/components/Spinner.vue'

export default {
    name: 'Folders',

    mounted () {
        this.$store.state.msgbus.$on('refresh-btn', this.refresh);

        this.fetchFolders();

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

        fetchFolders () {
            Api.folders.get()
                .then(response => this.processFolders(response));
        },

        processFolders (response) {
            const renderList = [];

            for(let i = 0; i < response.length; i++) {
                const item = response[i];
                item.hash = Hash(item);

                renderList.push(item);
            }

            this.folders = renderList;
            this.loading = false;

            this.$store.commit("loading", false);
            this.$store.commit('title', this.title);
        },

        refresh () {
            this.loading = true;
            this.fetchFolders();
        }
    },

    data () {
        return {
            title: "",
            loading: true,
            folders: [],
        }
    },

    components: {
        FolderItem,
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
        width: 5.5em;
    }

    #folders-list {
        width: 100%;
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
</style>
