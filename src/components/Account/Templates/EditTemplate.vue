<template>
    <div>
        <div id="edit-template" v-mdl class="mdl-card mdl-shadow--6dp">
            <div class="mdl-card__title">
                <h2 class="mdl-card__title-text">
                    {{ $t('templates.edit') }}
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
                <button id="create-template-text" class="mdl-button mdl-js-button mdl-js-ripple-effect" @click="saveTemplateText">
                    {{ $t('dialog.save') }}
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
        
    name: 'EditTemplate',

    components: {
        Spinner
    },
        
    props: ['templateId', 'originalText'],
        
    data() {
        return {
            loading: false,
            templateText: this.originalText
        };
    },

    mounted() {
        this.$store.commit("loading", false);
        this.$store.commit('title', "");
    },

    methods: {
            
        saveTemplateText() {
                
            if(this.templateText == '')
                return; 
                
            this.loading = true;

            Api.templates.update(this.templateId, this.templateText)
                .then((data) => this.handleData(data));
            
        },
            
        cancel() {
            this.$router.push({ name: 'templates' });
        },

        handleData() {
            this.loading = false;
            this.$router.push({ name: 'templates' });
        }

    }
    
};
</script>

<style lang="scss" scoped>
    #edit-template {
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