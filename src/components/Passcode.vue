<template>
    <div class="mdl-card mdl-shadow--6dp" id="passcode-pane" v-mdl>
        <div class="mdl-card__title">
            <h2 class="mdl-card__title-text">Enter Passcode</h2>
        </div>
        <div class="mdl-card__supporting-text">
            <form>
                <div class="mdl-textfield mdl-js-textfield">
                    <input class="mdl-textfield__input" type="password" id="passcode" v-model="passcode" autofocus @keydown.shift.enter.stop @keydown.enter.prevent.stop="continueClicked"/>
                    <label class="mdl-textfield__label" for="passcode">Passcode</label>
                </div>
            </form>
        </div>
        <div class="mdl-card__actions mdl-card--border">
            <button class="mdl-button mdl-js-button mdl-js-ripple-effect" id="continue" @click="continueClicked">Continue</button>
            <button class="mdl-button mdl-js-button mdl-js-ripple-effect" id="cancel" @click="cancelClicked">Cancel</button>
        </div>
    </div>
</template>

<script>

import Vue from 'vue'
import { Crypto, Util, Api } from '@/utils/'

export default {
    name: 'passcode',

    mounted () {
        this.$store.commit("loading", false);
        this.$store.commit('title', this.title);

        Api.fetchSettings().then(response => {
            this.stored_passcode = Crypto.decrypt(response.data.passcode);
        })
    },

    data () {
        return {
            title: "",
            passcode: "",
            stored_passcode: null
        }
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
}
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
