<template>
    <div>
        <div class="item" :id="id" v-mdl @click="menu.toggle()">{{ data }}</div>
        <ul class="mdl-menu mdl-js-menu mdl-js-ripple-effect mdl-menu--unaligned"
            id="message-menu" :data-mdl-for="id">
            <li class="mdl-menu__item" @click="editMessage">Edit Message</li>
            <li class="mdl-menu__item" @click="deleteMessage">Delete Message</li>
        </ul>
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
            time: this.messageData.time,
            mime_type: this.messageData.mime_type,
            menu: null,
        }
    },

    methods: {
        deleteMessage () {
            Util.snackbar("Deleted Message to " + this.title);
            Api.removeScheduledMessage(this.id);
            store.state.msgbus.$emit('refresh-btn');
        },

        editMessage () {
            this.$router.push({
                name: 'edit-scheduled-message', params: { message_id: this.id }
            });
        }
    },

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
    @import "../../assets/scss/_vars.scss";

    body.dark {
        .item:hover {
        	  background: #202020;
        }
    }

    .item {
    	height: 40px;
    	line-height: 40px;
    	width: 100%;
    	padding-left: 16px;
    }

    .item:hover {
    	background: #E0E0E0;
    	cursor: pointer;
    }


</style>
