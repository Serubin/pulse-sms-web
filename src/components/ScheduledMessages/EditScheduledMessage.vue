<template>
    <div id="edit-scheduled-pane" v-mdl class="mdl-card mdl-shadow--6dp">
        <div class="mdl-card__title">
            <h2 class="mdl-card__title-text">
                Edit Scheduled Message
            </h2>
        </div>

        <div class="mdl-card__supporting-text">
            <div class="mdl-textfield mdl-js-textfield">
                <textarea id="message" v-model="message" class="mdl-textfield__input" autofocus></textarea>
                <label class="mdl-textfield__label" for="message">Message text...</label>
            </div>
            Time: <flat-pickr v-model="timestamp" class="time-picker" :config="config" placeholder="Select a date" />
            <select v-model="repeat" class="repeat">
                <option v-for="option in repeatOptions" :key="option.value" :value="option.value">
                    {{ option.text }}
                </option>
            </select>
        </div>

        <div class="mdl-card__actions mdl-card--border">
            <button id="create" class="mdl-button mdl-js-button mdl-js-ripple-effect" @click="save">
                Save
            </button>
            <button id="cancel" class="mdl-button mdl-js-button mdl-js-ripple-effect" @click="cancel">
                Cancel
            </button>
        </div>


        <transition name="loading-fade">
            <div v-if="loading" class="loading-center">
                <spinner />
            </div>
        </transition>
    </div>
</template>

<script>

import 'flatpickr/dist/flatpickr.css';
import { Api } from '@/utils/';
import Spinner from '@/components/Spinner.vue';
import FlatPickr from 'vue-flatpickr-component';

export default {
    name: 'CreateScheduledMessage',

    components: {
        Spinner,
        FlatPickr
    },
    props: [ 'messageId', 'originalData', 'originalTimestamp', 'originalTo', 'originalTitle', 'originalRepeat' ],

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
            },
            repeat: this.original_repeat,
            repeatOptions: [
                { text: this.$t('scheduled.repeat.never'), value: '0' },
                { text: this.$t('scheduled.repeat.daily'), value: '1' },
                { text: this.$t('scheduled.repeat.weekly'), value: '2' },
                { text: this.$t('scheduled.repeat.monthly'), value: '3' },
                { text: this.$t('scheduled.repeat.yearly'), value: '4' }
            ]
        };
    },

    mounted () {
        this.$store.commit("loading", false);
        this.$store.commit('title', "");
    },

    methods: {
        save () {
            if (this.to == '' || this.message == '')
                return;

            this.loading = true;

            Api.scheduledMessages.delete(this.message_id);
            Api.scheduledMessages.create(this.to, this.message, Math.floor(new Date(this.timestamp)), this.title, this.repeat)
                .then((data) => this.handleSave(data.data));
        },

        handleSave () {
            this.loading = false;
            this.$router.push({ name: 'scheduled-messages'});
        },

        cancel () {
            this.$router.push({ name: 'scheduled-messages'});
        }
    }
};
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
