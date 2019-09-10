<template>
    <div>
        <div id="create-blacklist-phone-pane" v-mdl class="mdl-card mdl-shadow--6dp">
            <div class="mdl-card__title">
                <h2 class="mdl-card__title-text">
                    {{ $t('blacklist.create_phone') }}
                </h2>
            </div>
            <div class="mdl-card__supporting-text">
                <form>
                    <div class="mdl-textfield mdl-js-textfield">
                        <input id="phone" v-model="phone" class="mdl-textfield__input" autofocus>
                        <label class="mdl-textfield__label" for="phone">{{ $t('blacklist.phone') }}</label>
                    </div>
                </form>
            </div>
            <div class="mdl-card__actions mdl-card--border">
                <button id="create-phone" class="mdl-button mdl-js-button mdl-js-ripple-effect" @click="createPhone">
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

        <div id="create-blacklist-phrase-pane" v-mdl class="mdl-card mdl-shadow--6dp">
            <div class="mdl-card__title">
                <h2 class="mdl-card__title-text">
                    {{ $t('blacklist.create_phrase') }}
                </h2>
            </div>
            <div class="mdl-card__supporting-text">
                <form>
                    <div class="mdl-textfield mdl-js-textfield">
                        <input id="phrase" v-model="phrase" class="mdl-textfield__input" autofocus>
                        <label class="mdl-textfield__label" for="phrase">{{ $t('blacklist.phrase') }}</label>
                    </div>
                </form>
            </div>
            <div class="mdl-card__actions mdl-card--border">
                <button id="create-phrase" class="mdl-button mdl-js-button mdl-js-ripple-effect" @click="createPhrase">
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
    name: 'CreateBlacklist',

    components: {
        Spinner
    },

    data () {
        return {
            title: "",
            phone: "",
            phrase: "",
            loading: false,
        };
    },

    mounted () {
        this.$store.commit("loading", false);
        this.$store.commit('title', this.title);
    },

    methods: {
        createPhone () {
            if (this.phone == '')
                return;

            this.loading = true;

            Api.blacklist.create.phone(this.phone)
                .then((data) => this.handleCreated(data.data));
        },

        createPhrase () {
            if (this.phrase == '')
                return;

            this.loading = true;

            Api.blacklist.create.phrase(this.phrase)
                .then((data) => this.handleCreated(data.data));
        },

        handleCreated () {
            this.loading = false;
            this.$router.push({ name: 'blacklists'});
        },

        cancel () {
            this.$router.push({ name: 'blacklists'});
        }
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
    @import "../../assets/scss/_vars.scss";

    #create-blacklist-phone-pane {
        position: relative;
        width: 330px;
        height: 100%;
        margin: 5em auto;
    }

    #create-blacklist-phrase-pane {
        position: relative;
        width: 330px;
        height: 100%;
        margin: 5em auto;
    }

    .loading-center {
        position: absolute;
        margin: 57px auto;
        background: #fff;

        height: 100%;
        width: 100%;

        text-align: center;
        vertical-align: middle;

        .spinner {
            margin: 35% auto;
            translate: scale(2);
        }
    }

    /* loading-fade transition */
    .loading-fade-enter-active {
        transition-delay: 1s;
        transition: all $anim-time ease;
    }
    .loading-fade-leave-active {
        transition-delay: 1s;
        transition: all $anim-time ease;
    }
    .loading-fade-enter, .loading-fade-leave-to {
        transform: translateY(70%);
        opacity: 0;
    }

</style>
