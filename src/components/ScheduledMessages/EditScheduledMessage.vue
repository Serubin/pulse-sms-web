<template>
    <div class="mdl-card mdl-shadow--6dp" id="edit-scheduled-pane" v-mdl>
        <div class="mdl-card__title">
            <h2 class="mdl-card__title-text">Edit Scheduled Message</h2>
        </div>

        <div class="mdl-card__supporting-text">
            <div class="mdl-textfield mdl-js-textfield">
                <textarea class="mdl-textfield__input" id="message" v-model="message" autofocus/>
                <label class="mdl-textfield__label" for="message">Message text...</label>
            </div>
            Time: <flat-pickr class="time-picker" v-model="timestamp" :config="config" placeholder="Select a date"></flat-pickr>
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
import 'flatpickr/dist/flatpickr.css'
import { Crypto, Url, Api } from '@/utils/'
import Spinner from '@/components/Spinner.vue'
import FlatPickr from 'vue-flatpickr-component'

export default {
    name: 'create-scheduled-message',
    props: [ 'message_id', 'original_data', 'original_timestamp', 'original_to', 'original_title' ],

    mounted () {
        this.$store.commit("loading", false);
        this.$store.commit('title', "");
    },

    data () {
        return {
            loading: false,
            timestamp: this.original_timestamp,
            message: this.original_data,
            to: this.original_to,
            title: this.original_title,
            config: {
                enableTime: true,
                defaultDate: Math.floor(Date.now())
            }
        }
    },

    methods: {
        save () {
            if (this.to == '' || this.message == '')
                return;

            this.loading = true;

            Api.removeScheduledMessage(this.message_id)
            Api.createScheduledMessage(this.to, this.message, Math.floor(new Date(this.timestamp)), this.title)
                .then((data) => this.handleSave(data.data));
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
        Spinner,
        FlatPickr
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

    .time-picker {
        border: transparent;
        font-size: 15px;
        margin-left: 12px;
        margin-top: 10px;
        margin-bottom: 10px;
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

    body.dark {
        #edit-scheduled-pane {
            background: $bg-darker;

            .mdl-card__title {
                color: #fff;
            }

            .mdl-textfield__input, .mdl-textfield__label, .mdl-card__supporting-text {
                color: #fff;
            }

            .time-picker {
                background: $bg-darker;
                color: #fff;
            }

            .mdl-button {
                color: #fff;
            }
        }

        .loading-center {
            background: $bg-darker;
        }
    }

</style>
