<template>
    <div id="draft-list" class="page-content">

        <!-- Spinner On load -->
        <spinner class="spinner" v-if="drafts.length == 0"></spinner>

        <!-- Conversation items -->
        <transition-group name="flip-list" tag="div">
            <component v-for="draft in drafts" :is="'DraftItem'" :draft-data="draft" :key="draft.hash"/>
        </transition-group>
    </div>
</template>

<script>
import Vue from 'vue';
import Hash from 'object-hash'
import { Util, Api } from '@/utils'
import DraftItem from './DraftItem.vue'
import Spinner from '@/components/Spinner.vue'

export default {
    name: 'drafts',

    mounted () {
        this.$store.state.msgbus.$on('refresh-btn', this.refresh);

        this.fetchDrafts();

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

        fetchDrafts () {
            Api.fetchDrafts()
                .then(response => this.processDrafts(response));
        },

        processDrafts (response) {
            const renderList = [];

            for(let i = 0; i < response.length; i++) {
                const item = response[i];
                item.hash = Hash(item);

                renderList.push(item);
            }

            this.drafts = renderList;

            this.$store.commit("loading", false);
            this.$store.commit('title', this.title);
        },

        refresh () {
            this.fetchDrafts();
        }
    },

    data () {
        return {
            title: "Drafts",
            drafts: [],
        }
    },

    components: {
        DraftItem,
        Spinner
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
    @import "../../../assets/scss/_vars.scss";

    #draft-list {
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
