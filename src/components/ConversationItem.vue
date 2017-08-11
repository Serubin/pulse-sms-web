<template>
    <div class="conversation-card mdl-card mdl-js-button mdl-js-ripple-effect conversation-card-small" :class="{ small: small }" :id="conversation_id" :data-timestamp="timestamp" v-mdl>
        <!-- Contact image -->
        <svg class="contact-img contact-img-small" height="24" width="24">
            <circle cx="12" cy="12" r="12" shape-rendering="auto" fill="rgba(224,63,251,1)"></circle>
            <text style="text-anchor: middle;font-size: 16px;fill: #fff;font-weight: 300;" x="12" y="17.5">{{ name.split('')[0].toUpperCase() }} </text>
        </svg>

        <!-- Conversation Item content -->
        <p class="conversation-text conversation-text-small">
            <span class="conversation-title mdl-card__supporting-text conversation-title-small">{{ name }}</span>
            <br>
            <span class="conversation-snippet mdl-card__supporting-text conversation-snippet-small">{{ snippet }}</span>
        </p>
    </div>
</template>

<script>
export default {
    name: 'conversation-item',
    props: [ 'small', 'data' ]

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
    @import "../assets/scss/_vars.scss";

    .conversation-card {
        &.mdl-card {
            display: block;
            min-height: 80px;
            width: 100%;
            cursor: pointer;
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
