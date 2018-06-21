<template>
    <div class="fullscreen-image">
        <img class="full-image" alt="Image">
    </div>
</template>

<script>

import Vue from 'vue'

export default {
    name: 'imageviewer',

    data () {
        return {
            image_data: ""
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>

    .fullscreen-image {
        text-align: center;
        background-color: black;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1000;
        display: none;
    }

    .full-image {
        margin: auto;
        margin-top: 100px;
        max-height: 70%;
    }

</style>
