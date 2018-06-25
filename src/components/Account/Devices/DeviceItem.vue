<template>
    <div>
        <div class="click-item mdl-js-button mdl-js-ripple-effect" @click="menu.toggle()">
            <div class="mdl-color-text--grey-900">{{ name }}</div>
            <div class="mdl-color-text--grey-600">Id: {{ id }}</div>
        </div>
        <ul class="mdl-menu mdl-js-menu mdl-js-ripple-effect mdl-menu--unaligned"
            id="device-menu" :data-mdl-for="id">
            <li class="mdl-menu__item" @click="deleteDevice">Delete</li>
        </ul>
    </div>
</template>

<script>

import store from '@/store/'
import { Util, Api } from '@/utils'

export default {
    name: 'device-item',
    props: [ 'deviceData' ],

    mounted () {
        let menu_el = this.$el.querySelector("#device-menu");
        componentHandler.upgradeElement(menu_el);

        this.menu = menu_el.MaterialMenu;
    },

    data () {
        return {
            id: this.deviceData.id,
            name: this.deviceData.name,
            menu: null,
        }
    },

    methods: {
        deleteDevice () {
            Util.snackbar("Deleted device: " + this.name);
            Api.removeDevice(this.id);
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
        padding: 8px;
        line-height: 18px;
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
