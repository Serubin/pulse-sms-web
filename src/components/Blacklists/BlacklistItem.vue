<template>
    <div class="item" :id="id" v-mdl @click="clickedBlacklist">{{ phone_number }}</div>
</template>

<script>

import { Util } from '@/utils'

export default {
    name: 'blacklist-item',
    props: [ 'blacklistData' ],

    data () {
        return {
            id: this.blacklistData.device_id,
            phone_number: this.blacklistData.phone_number
        }
    },

    methods: {
        clickedBlacklist () {
            // TODO: present an option to delete
        }

    },

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
    @import "../../assets/scss/_vars.scss";

    body.dark {
        .item:hover, .click-item:hover {
        	  background: #202020;
        }
    }

    .item, .click-item {
    	height: 40px;
    	line-height: 40px;
    	width: 100%;
    	padding-left: 16px;
    }

    .item:hover, .click-item:hover {
    	background: #E0E0E0;
    	cursor: pointer;
    }

    .click-item:hover {
      cursor: pointer;
    }


</style>
