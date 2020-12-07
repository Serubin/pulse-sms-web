<template>
    <div>
        <div id="create-template" v-mdl class="mdl-card mdl-shadow--6dp">
            <div class="mdl-card__title">
                <h2 class="mdl-card__title-text">
                    {{ $t('templates.create') }}
                </h2>
            </div>
            <div v-show="!loading" class="mdl-card__supporting-text">
                <form>
                    <div class="mdl-textfield mdl-js-textfield">
                        <input id="template-text" v-model="templateText" class="mdl-textfield__input" autofocus>
                        <label class="mdl-textfield__label" for="template-text">{{ $t('dialog.typeHere') }}</label>
                    </div>
                </form>
            </div>
            <div v-show="!loading" class="mdl-card__actions mdl-card--border">
                <button id="create-template-text" class="mdl-button mdl-js-button mdl-js-ripple-effect" @click="createTemplateText">
                    {{ $t('dialog.create') }}
                </button>
                <button id="cancel" class="mdl-button mdl-js-button mdl-js-ripple-effect" @click="cancel">
                    {{ $t('dialog.cancel') }}
                </button>
            </div>


            <transition name="loading-fade">
                <div v-if="loading" class="loading-center">
                    <spinner />
                </div>
            </transition>
        </div>
    </div>
</template>

<script>

import { Api } from '@/utils/';
import Spinner from '@/components/Spinner.vue';

export default {

    name: 'CreateTemplate',

    components: {
        Spinner
    },
    
    data() {
        return {
            templateText: '',
            title: '',
            loading: false,
        };
    },

    mounted() {
        this.$store.commit("loading", false);
        this.$store.commit('title', this.title);
    },

    methods: {
        createTemplateText() {
            
            if(this.templateText == '')
                return;
            
            this.loading = true;
            
            Api.templates.create(this.templateText)
                .then((data) => this.handleCreated(data.data));
        },
        handleCreated() {
            this.loading = false;
            this.$router.push({ name: 'templates' });
        },
        cancel() {
            this.$router.push({ name: 'templates' });
        }
    }

};
</script>

<style lang="scss" scoped>
    #create-template {
        position: relative;
        width: 330px;
        height: 100%;
        margin: 5em auto;
        .loading-center {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translateX(-50%);
        }
    }
</style>
