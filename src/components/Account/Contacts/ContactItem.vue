<template>
    <div>
        <div class="click-item mdl-js-button mdl-js-ripple-effect" @click="menu.toggle()">
            <div class="mdl-color-text--grey-900">{{ name }}</div>
            <div class="mdl-color-text--grey-600">Phone Number: {{ phone_number }}</div>
        </div>
        <ul class="mdl-menu mdl-js-menu mdl-js-ripple-effect mdl-menu--unaligned"
            id="contact-menu" :data-mdl-for="id">
            <li class="mdl-menu__item" @click="deleteContact">Delete</li>
        </ul>
    </div>
</template>

<script>

import store from '@/store/'
import { Api, Util } from '@/utils'
import { componentHandler } from '@/lib/material.js'

export default {
    name: 'contact-item',
    props: [ 'contactData' ],

    mounted () {
        let menu_el = this.$el.querySelector("#contact-menu");
        componentHandler.upgradeElement(menu_el);

        this.menu = menu_el.MaterialMenu;
    },

    data () {
        return {
            id: this.contactData.id,
            name: this.contactData.name,
            phone_number: this.contactData.phone_number,
            menu: null,
        }
    },

    methods: {
        deleteContact () {
            Util.snackbar("Deleted contact: " + this.name);
            Api.contacts.delete(this.id);
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
