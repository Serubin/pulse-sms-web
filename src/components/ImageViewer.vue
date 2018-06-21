<template>
  <transition name="fade">
    <div class="fullscreen-image">
        <img class="full-image" alt="Image">
        <button id="close-button" class="mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect" tag="button" @click="close">
            <i class="material-icons material-icons-white">cancel</i>
        </button>
        <button id="download-button" class="menu_icon add mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect" @click="download">
            <i class="material-icons material-icons-white">save</i>
        </button>
    </div>
  </transition>
</template>

<script>

import Vue from 'vue'

export default {
    name: 'imageviewer',

    data () {
        return {
            image_data: ""
        }
    },

    methods: {
        close () {
            document.querySelector('.fullscreen-image').style.display = 'none';
        },

        download () {
            let uri = document.querySelector('.full-image').src;
            this.downloadUri(uri, "pulse-image.jpg")
        },

        downloadUri (uri, name) {
            var link = document.createElement("a");
            link.download = name;
            link.href = uri;
            document.body.appendChild(link);

            link.click();
            document.body.removeChild(link);
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
        max-height: 100%;
    }

    #download-button {
        float: right;
        margin-right: 10px;
        margin-top: 20px;
        color: white;
        z-index: 1001;
    }

    #close-button {
        float: right;
        margin-right: 20px;
        margin-top: 20px;
        color: white;
        z-index: 1001;
    }

</style>
