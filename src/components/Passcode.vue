<template>
    <div id="passcode-pane" v-mdl class="mdl-card shadow">
        <div class="mdl-card__title">
            <h2 class="mdl-card__title-text">
                {{ $t('passcode.enter') }}
            </h2>
        </div>
        <div class="mdl-card__supporting-text">
            <form>
                <div class="mdl-textfield mdl-js-textfield">
                    <input id="passcode" v-model="passcode" class="mdl-textfield__input" type="password" autofocus @keydown.enter.prevent.stop.exact="continueClicked">
                    <label class="mdl-textfield__label" for="passcode">{{ $t('passcode.passcode') }}</label>
                </div>
            </form>
        </div>
        <div class="mdl-card__actions mdl-card--border">
            <button id="continue" class="mdl-button mdl-js-button mdl-js-ripple-effect" @click="continueClicked">
                {{ $t('dialog.continue') }}
            </button>
            <button id="cancel" class="mdl-button mdl-js-button mdl-js-ripple-effect" @click="cancelClicked">
                {{ $t('dialog.cancel') }}
            </button>
        </div>
    </div>
</template>

<script>

import { Crypto, Util, Api } from '@/utils/';

export default {
    name: 'Passcode',

    data () {
        return {
            title: "",
            passcode: "",
            stored_passcode: null
        };
    },

    mounted () {
        this.$store.commit("loading", false);
        this.$store.commit('title', this.title);

        Api.account.settings.get().then(response => {
            this.stored_passcode = Crypto.decrypt(response.passcode);
        });
    },

    methods: {
        continueClicked () {
            if (this.passcode != this.stored_passcode) {
                Util.snackbar("Incorrect passcode.");
                return;
            }

            this.$store.commit('last_passcode_entry', Date.now());
            this.$router.push({ name: 'conversations-list-private'});
        },

        cancelClicked () {
            this.$router.push({ name: 'conversations-list'});
        }
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
    @import "../assets/scss/_vars.scss";

    #passcode-pane {
        position: relative;
        width: 330px;
        height: 100%;
        margin: 5em auto;
    }

</style>
