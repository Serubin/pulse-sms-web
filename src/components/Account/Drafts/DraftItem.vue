<template>
    <div>
        <div class="click-item mdl-js-button mdl-js-ripple-effect" @click="menu.toggle()">
            <div class="mdl-color-text--grey-900">{{ data }}</div>
            <div class="mdl-color-text--grey-600">Type: {{ mime_type }}</div>
        </div>
        <ul class="mdl-menu mdl-js-menu mdl-js-ripple-effect mdl-menu--unaligned"
            id="draft-menu" :data-mdl-for="id">
            <li class="mdl-menu__item" @click="deleteDraft">Delete</li>
        </ul>
    </div>
</template>

<script>

import store from '@/store/'
import { Api, Util } from '@/utils'
import { componentHandler } from '@/lib/material.js'

export default {
    name: 'draft-item',
    props: [ 'draftData' ],

    mounted () {
        let menu_el = this.$el.querySelector("#draft-menu");
        componentHandler.upgradeElement(menu_el);

        this.menu = menu_el.MaterialMenu;
    },

    data () {
        return {
            id: this.draftData.device_id,
            conversation_id: this.draftData.device_conversation_id,
            data: this.draftData.data,
            mime_type: this.draftData.mime_type,
            menu: null,
        }
    },

    methods: {
        deleteDraft () {
            Util.snackbar("Deleted draft: " + this.data);
            Api.drafts.delete(this.conversation_id);
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
