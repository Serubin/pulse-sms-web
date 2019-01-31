<template>
    <div class="mdl-card mdl-shadow--6dp" id="create-scheduled-pane" v-mdl>
        <div class="mdl-card__title">
            <h2 class="mdl-card__title-text">Create Scheduled Message</h2>
        </div>

        <div class="mdl-card__supporting-text">
            <RecipientBar :onContactListChanged="onContactListChanged"/>
            <div class="mdl-textfield mdl-js-textfield">
                <textarea class="mdl-textfield__input" id="message" v-model="message"/>
                <label class="mdl-textfield__label" for="message">Message text...</label>
            </div>
            Time: <flat-pickr class="time-picker" v-model="timestamp" :config="config" placeholder="Select a date"></flat-pickr>
            <select class="repeat" v-model="repeat">
                <option v-for="option in repeatOptions" v-bind:value="option.value">
                    {{ option.text }}
                </option>
            </select>
        </div>

        <div class="mdl-card__actions mdl-card--border">
            <button class="mdl-button mdl-js-button mdl-js-ripple-effect" id="create" @click="create">Create</button>
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
import { Crypto, Url, Api, Util } from '@/utils/'
import FlatPickr from 'vue-flatpickr-component'
import Spinner from '@/components/Spinner.vue'
import RecipientBar from '../Compose/RecipientBar.vue'

export default {
    name: 'create-scheduled-message',

    mounted () {
        this.$store.commit("loading", false);
        this.$store.commit('title', "");
    },

    data () {
        return {
            to: "",
            title: "",
            message: "",
            loading: false,
            timestamp: Date.now(),
            config: {
                enableTime: true,
                defaultDate: Math.floor(Date.now())
            },
            repeat: '0',
            repeatOptions: [
                { text: this.$t('scheduled.repeat.never'), value: '0' },
                { text: this.$t('scheduled.repeat.daily'), value: '1' },
                { text: this.$t('scheduled.repeat.weekly'), value: '2' },
                { text: this.$t('scheduled.repeat.monthly'), value: '3' },
                { text: this.$t('scheduled.repeat.yearly'), value: '4' }
            ]

        }
    },

    methods: {
        onContactListChanged (list) {
            this.to = "";
            this.title = "";

            list.forEach((item, index) => {
                if (index == list.length - 1) {
                    this.to += item.phone;
                    this.title += item.name;
                } else {
                    this.to += item.phone + ", ";
                    this.title += item.name + ", ";
                }
            });
        },
        create () {
            if (this.to == '') {
                Util.snackbar("Please input a contact!");
                return;
            } else if (this.message == '') {
                Util.snackbar("Please input a message!");
                return;
            }

            this.loading = true;

            Api.createScheduledMessage(this.to, this.message, Math.floor(new Date(this.timestamp)), this.title, this.repeat)
                .then((data) => this.handleCreated(data.data));
        },

        handleCreated () {
            this.loading = false;
            this.$router.push({ name: 'scheduled-messages'});
        },

        cancel () {
            this.$router.push({ name: 'scheduled-messages'});
        }
    },

    components: {
        Spinner,
        FlatPickr,
        RecipientBar
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
    @import "../../assets/scss/_vars.scss";

    #create-scheduled-pane {
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

    .repeat {
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
        #create-scheduled-pane {
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
