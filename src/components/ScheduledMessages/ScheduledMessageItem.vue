<template>
  <div class="message-wrapper" :title="stringTime">
      <!-- <transition name="fade"> -->
          <div class="message scheduled shadow" :id="id">
              <div>{{ displayText }}</div>
          </div>
          <div class="date-wrapper">
              <div class="date mdl-color-text--grey-500">{{ timestampText }}</div>
          </div>
          <ul class="mdl-menu mdl-js-menu mdl-js-ripple-effect mdl-menu--right"
              id="message-menu" :data-mdl-for="id">
              <li class="mdl-menu__item" @click="editMessage">Edit Message</li>
              <li class="mdl-menu__item" @click="deleteMessage">Delete Message</li>
          </ul>
      <!-- </transition> -->
  </div>
</template>

<script>

import store from '@/store/'
import { Util, Api } from '@/utils'

export default {
    name: 'scheduled-message-item',
    props: [ 'messageData' ],

    mounted () {
        let menu_el = this.$el.querySelector("#message-menu");
        componentHandler.upgradeElement(menu_el);

        this.menu = menu_el.MaterialMenu;
    },

    data () {
        return {
            id: this.messageData.device_id,
            to: this.messageData.to,
            data: this.messageData.data,
            title: this.messageData.title,
            timestamp: this.messageData.timestamp,
            mime_type: this.messageData.mime_type,
            repeat: this.messageData.repeat || 0,
            menu: null,
        }
    },

    methods: {
        deleteMessage () {
            Util.snackbar("Deleted Message to " + this.title);
            Api.scheduledMessages.delete(this.id);
            store.state.msgbus.$emit('refresh-btn');
        },

        editMessage () {
            this.$router.push({
                name: 'edit-scheduled-message', params: { 
                    message_id: this.id, 
                    original_to: this.to, 
                    original_title: this.title, 
                    original_data: this.data, 
                    original_timestamp: this.timestamp, 
                    original_repeat: this.repeat
                }
            });
        }
    },

    computed: {
        displayText () {
            if (this.mime_type != 'text/plain') {
                return this.$t('scheduled.media');
            } else {
                return this.data
            }
        },
        timestampText () {
            const time = new Date(this.timestamp).toLocaleString();
            const name = this.title;

            if (this.repeat == 0) {
                return `${name} - ${time}`
            } else {
                let repeatText = ""
                switch (this.repeat) {
                    case 1:
                        repeatText = this.$t('scheduled.repeat.daily');
                        break;
                    case 2:
                        repeatText = this.$t('scheduled.repeat.weekly');
                        break;
                    case 3:
                        repeatText = this.$t('scheduled.repeat.monthly');
                        break;
                    case 4:
                        repeatText = this.$t('scheduled.repeat.yearly');
                        break;
                }

                return `${name} - ${time} (${repeatText})`
            }
        }
    }

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
    @import "../../assets/scss/_vars.scss";

    .date-wrapper {
        clear: both;

        .date {
            float: right;
            margin-right: 36px;
        }
    }

    .message-wrapper {
        user-select: text;
        clear: both;
        display: block;

        .message {
            position: relative;
            padding: 16px;
            margin: 4px 8px 4px 8px;
            max-width: 310px;
            border-radius: 15px;
            overflow-wrap: break-word;
            word-wrap: break-word;
            min-width: 18px;
        }

        .message:hover {
            cursor: pointer;
        }

        .message:after {
            position: absolute;
            bottom: -20px;
            left: 50%;
            border-style: solid;
            display: block;
            top: 0px;
            bottom: auto;
        }

        .scheduled {
            float: right;
            color: black;
            margin-right: 28px;
            background: #fff;

            &:after {
                right: -8px;
                border-width: 15px 10px 0 0;
                border-color: #fff transparent;
            }

            a {
                color: black;
            }
        }

        @media screen and (min-width: 600px) {
            .message {
                max-width: 372px;
            }
        }

        @media screen and (min-width: 720px) {
            .message {
                max-width: 436px;
            }
        }
    }

    body.dark {
        .scheduled {
            background: $bg-darker;
            color: #fff;

            &:after {
                border-color: $bg-darker transparent;
            }
        }
    }

</style>
