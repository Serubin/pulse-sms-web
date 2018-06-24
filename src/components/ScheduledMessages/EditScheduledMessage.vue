<template>
    <div class="mdl-card mdl-shadow--6dp" id="edit-scheduled-pane" v-mdl>
        <div class="mdl-card__title">
            <h2 class="mdl-card__title-text">Edit Scheduled Message</h2>
        </div>
        <div class="mdl-card__supporting-text">
            <form>
                <div class="mdl-textfield mdl-js-textfield">
                    <input class="mdl-textfield__input" id="to" v-model="to" autofocus/>
                    <label class="mdl-textfield__label" for="to">Contact names...</label>
                </div>
                <div class="mdl-textfield mdl-js-textfield">
                    <input class="mdl-textfield__input" id="message" v-model="message" autofocus/>
                    <label class="mdl-textfield__label" for="message">Message text...</label>
                </div>
            </form>
        </div>
        <div class="mdl-card__actions mdl-card--border">
            <button class="mdl-button mdl-js-button mdl-js-ripple-effect" id="create" @click="save">Save</button>
            <button class="mdl-button mdl-js-button mdl-js-ripple-effect" id="cancel" @click="cancel">Cancel</button>
        </div>


        <transition name="loading-fade">
            <div class="loading-center" v-if="loading">
                <spinner></spinner>
            </div>
        </transition>
    </div>
</template>

<script>

import Vue from 'vue'
import { Crypto, Url, Api } from '@/utils/'
import Spinner from '@/components/Spinner.vue'

export default {
    name: 'create-scheduled-message',
    props: [ 'message_id' ],

    mounted () {
        this.$store.commit("loading", false);
        this.$store.commit('title', this.title);
    },

    data () {
        return {
            title: "",
            to: "",
            message: "",
            loading: false,
        }
    },

    methods: {
        save () {
            if (this.to == '' || this.message == '')
                return;

            this.loading = true;

            Api.removeScheduledMessage(this.message_id)
            Api.createScheduledMessage(this.to, this.message, Date.now(), "Title")
                .then((data) => this.handleCreated(data.data));
        },

        handleSave () {
            this.loading = false;
            this.$router.push({ name: 'scheduled-messages'});
        },

        cancel () {
            this.$router.push({ name: 'scheduled-messages'});
        }
    },

    components: {
        Spinner
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
    @import "../../assets/scss/_vars.scss";

    #edit-scheduled-pane {
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
