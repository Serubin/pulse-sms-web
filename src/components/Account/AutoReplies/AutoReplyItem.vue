<template>
    <div>
        <div class="click-item mdl-js-button mdl-js-ripple-effect" @click="menu.toggle()">
            <div class="mdl-color-text--grey-900">{{ response }}</div>
            <div class="mdl-color-text--grey-600">Type: {{ reply_type }}</div>
        </div>
        <ul class="mdl-menu mdl-js-menu mdl-js-ripple-effect mdl-menu--unaligned"
            id="reply-menu" :data-mdl-for="id">
            <li class="mdl-menu__item" @click="deleteReply">Delete</li>
        </ul>
    </div>
</template>

<script>

import store from '@/store/'
import { Util, Api } from '@/utils'
import { componentHandler } from '@/lib/material.js'

export default {
    name: 'AutoReplyItem',
    props: [ 'replyData' ],

    mounted () {
        let menu_el = this.$el.querySelector("#reply-menu");
        componentHandler.upgradeElement(menu_el);

        this.menu = menu_el.MaterialMenu;
    },

    data () {
        return {
            id: this.replyData.device_id,
            response: this.replyData.response,
            reply_type: this.replyData.reply_type,
            menu: null,
        }
    },

    methods: {
        deleteReply () {
            Util.snackbar("Deleted auto reply: " + this.response);
            Api.autoReplies.delete(this.id);
            store.state.msgbus.$emit('refresh-btn');
        }
    },

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
    @import "../../../assets/scss/_vars.scss";

    .item, .click-item {
        position: relative;
        width: 100%;
        padding: 12px;
        line-height: 18px;

        -webkit-user-select: text;
        -moz-user-select: text;
        -ms-user-select: text;
        user-select: text;
    }

    .item:hover, .click-item:hover {
        background: #E0E0E0;
    }

    .click-item:hover {
        cursor: pointer;
    }

    body.dark {
        .item:hover, .click-item:hover {
            background: #202020;
        }
    }

</style>
