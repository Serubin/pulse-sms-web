<template>
    <div>
        <div class="click-item" :id="id" v-mdl @click="menu.toggle()">{{ name }}</div>
        <ul class="mdl-menu mdl-js-menu mdl-js-ripple-effect mdl-menu--unaligned"
            id="folder-menu" :data-mdl-for="id">
            <li class="mdl-menu__item" @click="deleteFolder">Delete</li>
        </ul>
    </div>
</template>

<script>

import store from '@/store/'
import { Api, Util } from '@/utils'
import { componentHandler } from '@/lib/material.js'

export default {
    name: 'folder-item',
    props: [ 'folderData' ],

    mounted () {
        let menu_el = this.$el.querySelector("#folder-menu");
        componentHandler.upgradeElement(menu_el);

        this.menu = menu_el.MaterialMenu;
    },

    data () {
        return {
            id: this.folderData.device_id,
            name: this.folderData.name,
            menu: null,
        }
    },

    methods: {
        deleteFolder () {
            Util.snackbar("Deleted folder: " + this.name);
            Api.folders.delete(this.id);
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
