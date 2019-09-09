<template>
    <div>
        <div class="item" :id="id" v-mdl @click="menu.toggle()">{{ phone_number || phrase }}</div>
        <ul class="mdl-menu mdl-js-menu mdl-js-ripple-effect mdl-menu--unaligned"
            id="blacklist-menu" :data-mdl-for="id">
            <li class="mdl-menu__item" @click="deleteBlacklist">{{ $t('blacklist.delete') }}</li>
        </ul>
    </div>
</template>

<script>

import store from '@/store/'
import { Util, Api } from '@/utils'
import { componentHandler } from '@/lib/material.js'

export default {
    name: 'blacklist-item',
    props: [ 'blacklistData' ],

    mounted () {
        let menu_el = this.$el.querySelector("#blacklist-menu");
        componentHandler.upgradeElement(menu_el);

        this.menu = menu_el.MaterialMenu;
    },

    data () {
        return {
            id: this.blacklistData.device_id,
            phone_number: this.blacklistData.phone_number,
            phrase: this.blacklistData.phrase,
            menu: null,
        }
    },

    methods: {
        deleteBlacklist () {
            Util.snackbar("Deleted blacklist: " + (this.phone_number || this.phrase));
            Api.blacklist.delete(this.id);
            store.state.msgbus.$emit('refresh-btn');
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
