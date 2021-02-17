<template>
    <div id="template-list" class="page-content">
        <!-- Spinner On load -->
        <spinner v-if="templates.length == 0 && loading" class="spinner" />

        <!-- If no Templates -->
        <p v-if="templates.length == 0 && !loading" class="empty-message">
            {{ $t('templates.none') }}
        </p>

        <!-- Conversation items -->
        <transition-group name="flip-list" tag="div">
            <component :is="'TemplateItem'" v-for="template in templates" :key="template.hash" :template-data="template" :allow-edit="allowEdit" :allow-delete="allowDelete" @template-selected="selectTemplate" />
        </transition-group>

        <button v-show="allowAdd" v-mdl tag="button" class="create-template mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored" :style="{ background: $store.state.colors_accent }" @click="createTemplate">
            <i class="material-icons md-light">add</i>
        </button>
    </div>
</template>

<script>
import Hash from 'object-hash';
import { Api, SessionCache } from '@/utils';
import TemplateItem from './TemplateItem.vue';
import Spinner from '@/components/Spinner.vue';

export default {
    name: 'Templates',

    components: {
        TemplateItem,
        Spinner
    },

    props: {
        allowEdit: {
            type: Boolean,
            default: true
        },
        allowAdd: {
            type: Boolean,
            default: true
        },
        allowDelete: {
            type: Boolean,
            default: true
        },
        setTitle: {
            type: Boolean,
            default: true
        }
    },

    data () {
        return {
            loading: true,
            templates: [],
            selectedTemplate: null
        };
    },

    watch: {
        'selectedTemplate' () {
            this.$emit('selected-template-text', this.selectedTemplate.text);
        }
    },

    mounted () {
        this.$store.state.msgbus.$on('refresh-btn', this.refresh);
        if (this.setTitle) {
            this.$store.commit('title', 'Templates');
        }
        this.fetchTemplates();
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

            for (let i = 0; i < response.length; i++) {
                const item = response[i];
                item.hash = Hash(item);

                renderList.push(item);
            }

            this.templates = renderList;
            this.loading = false;

            this.$store.commit('loading', false);
        },

        refresh () {
            this.templates = [];
            this.loading = true;
            SessionCache.invalidateTemplates();
            this.fetchTemplates();
        },

        createTemplate () {
            this.$router.push({ name: 'create-template' });
        },

        selectTemplate (id) {
            this.selectedTemplate = this.templates.find(template => template.device_id == id);
        }

    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
    @import "../../../assets/scss/_vars.scss";

    .empty-message {
        color: rgba(0, 0, 0, 0.54);
        margin: 6em auto;
        width: 11.5em;
    }

    #template-list {
        width: 100%;

        .spinner {
            margin-top: 100px;
        }
    }

    .create-template {
        position: fixed;
        bottom: 0%;
        right: 0%;
        z-index: 3;
        margin: 24px;
    }

    .flip-list-enter, .flip-list-leave-to {
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
