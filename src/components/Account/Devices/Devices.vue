<template>
    <div id="device-list" class="page-content">

        <!-- Spinner On load -->
        <spinner class="spinner" v-if="devices.length == 0"></spinner>

        <!-- Conversation items -->
        <transition-group name="flip-list" tag="div">
            <component v-for="device in devices" :is="'DeviceItem'" :device-data="device" :key="device.hash"/>
        </transition-group>
    </div>
</template>

<script>

import Hash from 'object-hash'
import { Api } from '@/utils'
import DeviceItem from './DeviceItem.vue'
import Spinner from '@/components/Spinner.vue'

export default {
    name: 'Devices',

    mounted () {
        this.$store.state.msgbus.$on('refresh-btn', this.refresh);

        this.fetchDevices();

        // Construct colors object from saved global theme
        const colors = {
            'default': this.$store.state.theme_global_default,
            'dark': this.$store.state.theme_global_dark,
            'accent': this.$store.state.theme_global_accent,
        };

        // Commit them to current application colors
        this.$store.commit('colors', colors);
    },

    beforeDestroy () {
        this.$store.state.msgbus.$off('refresh-btn', this.refresh);
    },

    methods: {

        fetchDevices () {
            Api.devices.get()
                .then(response => this.processDevices(response));
        },

        processDevices (response) {
            const renderList = [];

            for(let i = 0; i < response.length; i++) {
                const item = response[i];
                item.hash = Hash(item);

                renderList.push(item);
            }

            this.devices = renderList;

            this.$store.commit("loading", false);
            this.$store.commit('title', this.title);
        },

        refresh () {
            this.fetchDevices();
        }
    },

    data () {
        return {
            title: "Devices",
            devices: [],
        }
    },

    components: {
        DeviceItem,
        Spinner
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
    @import "../../../assets/scss/_vars.scss";

    #device-list {
        width: 100%;

        .spinner {
            margin-top: 100px;
        }
    }

    .flip-list-enter, .flip-list-leave-to  {
        opacity: 0;
    }

    .flip-list-leave-active {
        position: absolute;
    }

    .flip-list-move {
        transition: transform $anim-time;
    }
</style>
