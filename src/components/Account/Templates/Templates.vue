<template>
    <div id="template-list" class="page-content">

        <!-- Spinner On load -->
        <spinner class="spinner" v-if="templates.length == 0"></spinner>

        <!-- Conversation items -->
        <transition-group name="flip-list" tag="div">
            <component v-for="template in templates" :is="'TemplateItem'" :template-data="template" :key="template.hash"/>
        </transition-group>
    </div>
</template>

<script>
import Vue from 'vue';
import Hash from 'object-hash'
import { Util, Api } from '@/utils'
import TemplateItem from './TemplateItem.vue'
import Spinner from '@/components/Spinner.vue'

export default {
    name: 'templates',

    mounted () {
        this.$store.state.msgbus.$on('refresh-btn', this.refresh);

        this.fetchTemplates();

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

        fetchTemplates () {
            Api.templates.get()
                .then(response => this.processTemplates(response));
        },

        processTemplates (response) {
            const renderList = [];

            for(let i = 0; i < response.length; i++) {
                const item = response[i];
                item.hash = Hash(item);

                renderList.push(item);
            }

            this.templates = renderList;

            this.$store.commit("loading", false);
            this.$store.commit('title', this.title);
        },

        refresh () {
            this.fetchTemplates();
        }
    },

    data () {
        return {
            title: "Templates",
            templates: [],
        }
    },

    components: {
        TemplateItem,
        Spinner
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
    @import "../../../assets/scss/_vars.scss";

    #template-list {
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
</style>
