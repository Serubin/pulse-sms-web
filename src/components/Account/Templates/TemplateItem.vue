<template>
    <div>
        <div :id="id" v-mdl class="click-item" @click="menu.toggle()">
            {{ text }}
        </div>
        <ul v-show="allowEdit || allowDelete"
            id="template-menu"
            class="mdl-menu mdl-js-menu mdl-js-ripple-effect mdl-menu--unaligned" :data-mdl-for="id"
        >
            <li v-show="allowEdit" class="mdl-menu__item" @click="editTemplate">
                Edit
            </li>
            <li v-show="allowDelete" class="mdl-menu__item" @click="deleteTemplate">
                Delete
            </li>
        </ul>
    </div>
</template>

<script>

import { Api, Util } from '@/utils';
import { componentHandler } from '@/lib/material.js';

export default {
    name: 'TemplateItem',
    props: {
        templateData: Object,
        allowEdit: {
            type: Boolean,
            default: true
        },
        allowDelete: {
            type: Boolean,
            default: true
        } 
    },

    data () {
        return {
            id: this.templateData.device_id,
            text: this.templateData.text,
            menu: null,
        };
    },

    mounted () {
        let menu_el = this.$el.querySelector("#template-menu");
        componentHandler.upgradeElement(menu_el);

        this.menu = menu_el.MaterialMenu;
    },

    methods: {
        editTemplate(){
            this.$router.push({ name: 'edit-template', params: {
                templateId: this.id,
                originalText: this.text
            }
            });
        },
        deleteTemplate () {
            Util.snackbar("Deleted template: " + this.text);
            Api.templates.delete(this.id);
            this.$store.state.msgbus.$emit('refresh-btn');
        }
    },

};
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
