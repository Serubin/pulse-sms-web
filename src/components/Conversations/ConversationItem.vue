<template>
    <div :id="conversation_id" class="conversation-card mdl-card mdl-js-button mdl-js-ripple-effect conversation-card-small shadow" :class="{ small: small }" :data-timestamp="timestamp" @click="routeToThread">
        <!-- Contact image -->
        <svg class="contact-img contact-img-small" :height="iconSize" :width="iconSize" @click.stop="selectConversation">
            <circle :cx="circleSize" :cy="circleSize" :r="circleSize" transform="translate(1,1)" shape-rendering="auto" :fill="color"></circle>
            <text v-if="!isSelected" :style="{ fontSize: textLocation.size + 'px' }" style="text-anchor: middle;fill: #fff;font-weight: 300;" :x="textLocation.x" :y="textLocation.y">{{ titleFirstLetter }} </text>
        </svg>

        <!-- Conversation Item content -->
        <p class="conversation-text conversation-text-small" :class="{ unread: !read }">
            <img v-if="showPinned" class="conversation-pinned" src="./../../assets/images/holder.gif" width="18" height="18">
            <span class="conversation-title mdl-card__supporting-text conversation-title-small"><i v-if="!read"></i>{{ title }}</span>
            <span v-if="!small" class="conversation-date">{{ date }}</span>
            <br>
            <!-- eslint-disable vue/no-v-html -->
            <span class="conversation-snippet mdl-card__supporting-text conversation-snippet-small" v-html="snippet"><!-- Raw html insert --></span>
        </p>
    </div>
</template>

<script>

import { Util, TimeUtils } from '@/utils';

export default {
    name: 'ConversationItem',
    props: [ 'conversationData', 'archive', 'small', 'showPinned', 'isSelected', 'isSelecting' ],

    data () {
        return {
            conversation_id: this.conversationData.device_id,
            title: this.conversationData.titleNoEmoji,
            snippet: this.conversationData.snippet,
            read: this.conversationData.read,
            timestamp: this.conversationData.timestamp,
            mute: this.conversationData.mute,
            private_notifications: this.conversationData.private_notifications
        };
    },

    computed: {
        color () {
            if (this.$store.state.theme_use_global)
                return this.$store.state.theme_global_default;

            return this.conversationData.color;
        },

        iconSize () {
            if (this.small)
                return 24;
            else
                return 48;
        },

        circleSize () {
            if (this.small)
                return 12;
            else
                return 24;
        },

        textLocation () {
            if (this.small)
                return { x: 12, y: 17.5, size: 16};
            else
                return { x: 25, y: 35, size: 30};
        },

        titleFirstLetter () {
            if (this.small) {
                return "";
            }

            try {
                let letter = this.title.split('')[0].toUpperCase();
                if (!letter.match(/[A-Z]/i)) {
                    return "";
                } else {
                    return letter;
                }
            } catch (e) { // Edge case for message with no title ??
                return "";
            }
        },

        date () {
            if (this.$store.state.theme_conversation_categories) {
                return "";
            } else {
                return TimeUtils.formatConversationTimestamp(this.conversationData.timestamp, Date.now());
            }
        }
    },

    methods: {
        routeToThread () {
            if (this.isSelecting) {
                this.selectConversation();
                return;
            }

            this.close_drawer();

            let contact_data = Util.generateContact(
                this.conversation_id,
                this.title,
                this.mute,
                this.private_notifications,
                this.color,
                Util.expandColor(this.conversationData.color_accent),
                Util.expandColor(this.conversationData.color_light),
                Util.expandColor(this.conversationData.color_dark)
            );
            this.$store.commit('contacts', contact_data);

            this.$router.push({
                name: !this.archive ? 'thread' : 'thread-archived', params: { threadId: this.conversation_id, isRead: this.read }
            });
        },

        selectConversation () {
            if (!this.small) {
                this.$store.state.msgbus.$emit('selectConversation', this.conversationData);
            }
        },

        /**
         * close drawer
         * Closes drawer if closeable
         */
        close_drawer() {
            if(!this.$store.state.full_theme)
                this.$store.commit('sidebar_open', false);
        }

    },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
    @import "../../assets/scss/_vars.scss";

    .conversation-date {
        color: black;
    }

    body.dark .conversation-card {
        background: $bg-dark;

        &.mdl-card {
            background: $bg-darker;
        }

        &.small.mdl-card {
            background: $bg-dark;
        }

        &:hover {
            background: $bg-darkest;
        }

        &.small.mdl-card:hover {
            background: $bg-darker;
        }

        .conversation-text {
            .conversation-title {
                color: white;
            }

            .conversation-snippet {
                color: rgba(255,255,255,.77);
            }

            .conversation-date {
                color: rgba(255,255,255,.77);
            }

            .conversation-pinned {
                background: url(../../assets/images/vector/pin-dark.svg) 0 0 no-repeat;
                margin-right: 8px;
            }
        }
    }

    body.black .conversation-card {
        background: $bg-black;

        &.mdl-card {
            background: $bg-black;
        }

        &.small.mdl-card {
            background: $bg-black;
        }

        &:hover {
            background: $bg-darker;
        }

        &.small.mdl-card:hover {
            background: $bg-darker;
        }

        .conversation-text {
            .conversation-title {
                color: white;
            }

            .conversation-snippet {
                color: rgba(255,255,255,.77);
            }

            .conversation-date {
                color: rgba(255,255,255,.77);
            }

            .conversation-pinned {
                background: url(../../assets/images/vector/pin-dark.svg) 0 0 no-repeat;
                margin-right: 8px;
            }
        }
    }

    .conversation-card {
        &.mdl-card {
            display: block;
            min-height: 80px;
            width: 100%;
            cursor: pointer;
            margin-top: -1px;
            border-radius: 2px;
        }

        .contact-img {
            width: 49px;
            height: 49px;
            float: left;
            margin: 16px;
        }

        .conversation-text {
            margin-top: 18px;
            height: 52px;
            margin-right: 16px;
            overflow: hidden;

            &.unread {
                font-weight: bold;
            }

            .conversation-title {
                color: black;
                font-size: 16px;
                padding: 24px 16px 0px 0px;
                white-space: nowrap;
                overflow: hidden;
            }

            .conversation-title i {
                width: 8px;
                height: 8px;
                display: inline-block;
                position: relative;
                margin-right: 5px;
                border-radius: 50%;
                background-color: #2196f3;
            }

            .conversation-snippet {
                font-size: 14px;
                padding: 0px 16px 24px 0px;
            }

            .conversation-pinned {
                background: url(../../assets/images/vector/pin.svg) 0 0 no-repeat;
                margin-right: 8px;
            }

            .conversation-date {
                font-size: 14px;
                float: right;
                color: rgba(0,0,0,.54);
                margin-left: 8px;
            }
        }

        &.small {
            min-height: 56px;
            height: 56px;
            background: $bg-light;
            box-shadow: 0px 0px 0px rgba(0, 0, 0, 0);
            margin-top: 0px;

            .contact-img {
                width: 25px;
                height: 25px;
            }

            .conversation-text {
                margin-top: 9px;
                height: 48px;
                line-height: 15px;
                white-space: nowrap;

                .conversation-title {
                    font-size: 14px;
                }

                .conversation-snippet {
                    font-size: 13px;
                }
            }
        }

        &:hover {
            background: $bg-lighter;
        }

        &.small.mdl-card:hover {
            background: $bg-lightest;
        }
    }
</style>
