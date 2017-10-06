<template>
    <div class="conversation-card mdl-card mdl-js-button mdl-js-ripple-effect conversation-card-small" :class="{ small: small, 'mdl-shadow--2dp': !small }" :id="conversation_id" :data-timestamp="timestamp" v-mdl @click="routeToThread">
        <!-- Contact image -->
        <svg class="contact-img contact-img-small" :height="iconSize" :width="iconSize">
            <circle :cx="circleSize" :cy="circleSize" :r="circleSize" shape-rendering="auto" :fill="color"></circle>
            <text :style="{ fontSize: textLocation.size + 'px' }" style="text-anchor: middle;fill: #fff;font-weight: 300;" :x="textLocation.x" :y="textLocation.y">{{ titleFirstLetter }} </text>
        </svg>

        <!-- Conversation Item content -->
        <p class="conversation-text conversation-text-small" :class="{ unread: !read }">
            <span class="conversation-title mdl-card__supporting-text conversation-title-small">{{ title }}</span>
            <br>
            <span class="conversation-snippet mdl-card__supporting-text conversation-snippet-small" v-html="snippet"><!-- Raw html insert --></span>
        </p>
    </div>
</template>

<script>

import { Util } from '@/utils'

export default {
    name: 'conversation-item',
    props: [ 'conversationData', 'archive', 'small'],

    data () {
        return {
            conversation_id: this.conversationData.device_id,
            title: this.conversationData.title,
            snippet: this.conversationData.snippet,
            read: this.conversationData.read,
            color: this.conversationData.color,
            timestamp: this.conversationData.timestamp,
        }
    },

    methods: {
        routeToThread () {
            
            this.$router.push({ 
                name: !this.archive ? 'thread' : 'thread-archived', params: { threadId: this.conversation_id, isRead: this.read }
            })
        }
    },

    computed: {

        iconSize () {
            if (this.small)
                return 24
            else
                return 48
        },

        circleSize () {
            if (this.small)
                return 12
            else
                return 24
        },

        textLocation () {
            if (this.small)
                return { x: 12, y: 17.5, size: 16}
            else
                return { x: 24, y: 34, size: 30}
        },

        titleFirstLetter () {
            try { 
                return this.title.split('')[0].toUpperCase()
            } catch (e) { // Edge case for message with no title ??
                return ""
            }
        }
    },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
    @import "../../assets/scss/_vars.scss";

    .conversation-card {
        &.mdl-card {
            display: block;
            min-height: 80px;
            width: 100%;
            cursor: pointer;
            border-bottom: 1px solid #f3f3f3;
        }

        .contact-img {
            width: 48px;
            height: 48px;
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

            .conversation-snippet {
                font-size: 14px;
                padding: 0px 16px 24px 0px;
            }
        }

        &.small {
            min-height: 56px;
            height: 56px;
            background: #f3f3f3;

            .contact-img {
                width: 24px;
                height: 24px;
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
    }
</style>
