<template>
    <transition name="fade">
        <div class="lightbox-wrapper" v-if="display">
            <div class="lightbox-toolbar">
                <button id="close-button" class="mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect" tag="button" @click="close">
                    <i class="material-icons material-icons-white">cancel</i>
                </button>
                <button id="download-button" class="menu_icon add mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect" @click="download">
                    <i class="material-icons material-icons-white">save</i>
                </button>
            </div>

            <div class="lightbox-overlay" @click="close()">
                <img class="full-image" :src="image_data" alt="Image">
            </div>
        </div>
  </transition>
</template>

<script>

import Vue from 'vue'
import store from '@/store/'

export default {
    name: 'imageviewer',

    mounted () {
        store.state.msgbus.$on('showImage', this.showImage);
    },

    data () {
        return {
            image_data: "",
            display: false,
        }
    },

    methods: {
        close () {
            this.display = false;
            this.image_data = "";
        },

        download () {
            var link = document.createElement("a");
            link.download = "pulse-image.jpg";
            link.href = document.querySelector('.full-image').src;
            document.body.appendChild(link);

            link.click();
            document.body.removeChild(link);
        },

        downloadUri (uri, name) {

        },

        showImage (event_obj) {
            const MediaLoader = store.state.media_loader;
            MediaLoader.getMedia(event_obj.messageId, event_obj.type)
                .then((blob) => {
                    this.display = true;

                    const data_prefix = "data:" + this.mime + ";base64,";
                    this.image_data = data_prefix + blob;
                });
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
    .lightbox-toolbar {
        position: fixed;
        top: 0;
        right: 0;
        z-index: 1001;
    }

    .lightbox-wrapper {
        height: 100%;
    }

    .lightbox-overlay {
        text-align: center;
        background-color: rgba(0,0,0,0.7);
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1000;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .full-image {
        display: flex;
        height: auto;
        width: auto;
        max-height: 100%;
        max-width: 100%;
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
