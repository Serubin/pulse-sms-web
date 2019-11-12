<template>
    <div class="message-wrapper" :title="stringTime" @mouseover="showOptions" @mouseleave="hideOptions">
        <div v-if="messageData.marker" id="offset-marker"></div>

        <transition name="fade">
            <div v-if="!messageData.marker" :id="id" :class="style_class" :style="styleGenerator">
                <!-- eslint-disable vue/no-v-html -->
                <div v-html="content"></div>
                <!-- Content is inserted via v-html -->

                <!-- Media -->
                <a v-show="is_media && !media_loading" :href="media_link" target="_blank">
                    <img class="media" :src="media_thumb" alt="Thumbnail" @click="openImage">
                    <div v-show="is_article" class="article-title"> {{ media_title }} </div>
                    <div v-show="is_article" class="article-snippet"> {{ media_content }} </div>
                </a>

                <!-- Video/Audio -->
                <video v-if="video_src.length != 0 && !media_loading" controls :src="video_src"></video>
                <audio v-if="audio_src.length != 0 && !media_loading" controls :src="audio_src"></audio>
            </div>
        </transition>

        <transition name="fade">
            <button v-if="displayOptions && !is_article" id="delete-button" :class="options_class" class="message_options menu_icon refresh mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect" tag="button" @click="deleteMessage">
                <i class="material-icons">delete</i>
            </button>
        </transition>

        <div v-if="dateLabel" class="date-wrapper">
            <div :class="dateType" class="mdl-color-text--grey-500">
                {{ dateLabel }}
            </div>
        </div>

        <transition name="slide-out">
            <div v-if="sending" class="sent-wrapper">
                <div class="sending mdl-color-text--grey-500">
                    Sending...
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
import { Api, Util, TimeUtils } from '@/utils';
import linkify from 'linkifyjs/html';

export default {
    name: 'Message',
    props: [ 'messageData', 'threadColor', 'textColor' ],

    data () {
        return {
            id: this.messageData.device_id,
            mime: this.messageData.mime_type,
            content: this.messageData.data,
            type: this.messageData.message_type,
            timestamp: this.messageData.timestamp,
            message_from: this.messageData.message_from,

            color: 'rgba(255,255,255,1)',
            style_class: [ ],
            is_media: false,
            is_article: false,
            media_loading: true,
            media_link: "",
            media_thumb: "",
            media_title: "",
            media_content: "",
            video_src: "",
            audio_src: "",

            options_class: [ ],
            displayOptions: false
        };
    },

    computed: {
        sending () {
            return this.type == 2 && (new Date().getTime() - this.timestamp) < 1000 * 60 ? true : false;
        },
        stringTime () {
            return TimeUtils.fullTimestamp(new Date(this.timestamp));
        },
        styleGenerator () {
            // Only style recieved and media
            if (this.type != 0 && this.type != 6)
                return "";

            let media = "";
            if (this.is_article || this.is_media)
                media = "padding-bottom:10px;";

            return "background: " + this.color + ";"
                  + "border-color: " + this.color
                  + " transparent;" + media
                  + "color:" + this.textColor + ";";
        },
        dateType () {
            if (this.type == 0 || this.type == 6)
                return "date-received";
            return "date-sent";
        },
        dateLabel () {
            let from = this.messageData.fromLabel;
            let dateLabel = this.messageData.dateLabel;

            if (from != null && from.length > 0 && dateLabel != null) {
                return from + " - " + dateLabel;
            } else if (from != null && from.length > 0) {
                return from;
            } else {
                return dateLabel;
            }
        }
    },

    mounted () {
        if (this.messageData.marker)
            return;

        const MediaLoader = this.$store.state.media_loader; // get loader
        this.style_class.push('message');

        switch ( this.mime.split("/")[0] ) {
            /* SMS Text message */
            case "text": {
                if (this.mime.indexOf("card") > -1) {
                    this.content = "<i>Contact Card</i>";
                }

                break;
            }

            /* MMS Image Message */
            case "image": {
                this.content = `<div style="width:436px;text-align:center;">
                    <i style="line-height:254px">Loading image...</i>
                </div>`;
                this.is_media = true;

                // Fetch media
                MediaLoader.getMedia(this.id, this.mime).then(blob => this.loadImage(blob));

                break;
            }

            case "video": {
                this.content = `<div style="width:436px;text-align:center;">
                    <i style="line-height:254px">Loading video...</i>
                </div>`;
                this.is_video = true;

                // Fetch media
                MediaLoader.getMedia(this.id, this.mime).then(blob => this.loadVideo(blob));

                break;
            }

            case "audio": {
                this.content = `<div style="width:436px;text-align:center;">
                    <i style="line-height:254px">Loading audio...</i>
                </div>`;
                this.is_video = true;

                // Fetch media
                MediaLoader.getMedia(this.id, this.mime).then(blob => this.loadAudio(blob));

                break;
            }

            case "media": {
                this.is_media = true;
                this.is_article = true;

                this.style_class.push('media-preview');

                // Catch firebase errors
                let media;
                try {
                    media = JSON.parse(this.content);
                } catch (e) {
                    this.mime = "media/error";
                }

                if (this.mime == "media/map") {
                    let map = "https://maps.googleapis.com/maps/api/staticmap" +
                          "?size=600x400" +
                          "&markers=color:red%7C" + media.latitude + "," + media.longitude +
                          "&key=AIzaSyAHq1IIIdGz01rEbEtUtDwEFJWwvAI_lww";
                    let googleMaps = "https://maps.google.com/maps/@" + media.latitude + "," + media.longitude + ",16z";

                    this.media_thumb = map;
                    this.media_link = googleMaps;
                    this.media_title = "";
                    this.media_content = "";
                    this.media_loading = false;
                } else if (this.mime == "media/youtube-v2") {
                    this.media_thumb = media.thumbnail;
                    this.media_link = media.url;
                    this.media_title =  media.title;
                    this.media_content = "";
                    this.media_loading = false;
                } else if (this.mime == "media/web") {
                    this.media_thumb = media.image_url;
                    this.media_link = media.web_url;
                    this.media_title =  media.title;
                    this.media_content = media.description;
                    this.media_loading = false;
                } else if (this.mime == "media/error") {
                    this.content = `<div style="width:436px;text-align:center;">
                        <i style="line-height:254px">Media not avalible</i>
                    </div>`;
                    this.is_media = false;

                    break;
                }

                this.content = "";
                this.media_thumb = this.media_thumb.replace(/https?/, "https");

                break;
            }

            default: {
                this.content = "<i>Not yet supported</i>";
                break;
            }
        }

        let linkClass = 'link-sent';
        if (!this.is_article) {
            switch (this.type) {
                case 0:
                case 6: {
                    if (this.textColor == "#000") {
                        linkClass = 'link-received-dark';
                    } else {
                        linkClass = 'link-received';
                    }
                    this.color = this.threadColor;
                    this.style_class.push('received');
                    break;
                }
                case 3: {
                    this.style_class.push('error');
                    break;
                }
                case 5: {
                    this.style_class.push("info mdl-color-text--grey-700");
                    break;
                }
                default: {
                    this.style_class.push('sent'); //TODO add text color from global theme
                    this.options_class.push('sent_options');
                }
            }
        }

        if (this.sending) {
            this.$store.state.msgbus.$on('updateMessageType-' + this.id, this.updateType);
        }

        // Add links
        this.content = linkify(this.content, { className: linkClass });
    },

    beforeDestroy () {
        this.$store.state.msgbus.$off('updateMessageType-' + this.id, this.updateType);
    },
    methods: {
        refreshSettings () {
            Api.account.settings.get();
            Util.snackbar("Settings Refreshed");
        },
        showOptions () {
            this.displayOptions = true;
        },
        hideOptions () {
            this.displayOptions = false;
        },
        deleteMessage() {
            let options = {
                okText: this.$t('thread.delete.delete'),
                cancelText: this.$t('thread.delete.cancel'),
                animation: 'fade'
            };

            const id = this.id;
            const apiUtils = Api;

            this.$dialog
                .confirm(this.$t('thread.delete.message'), options)
                .then(() => {
                    apiUtils.messages.delete(id);
                }).catch(function() { });
        },
        loadImage (blob) {
            this.content = ""; // Don't set content

            // Construct data url
            const data_prefix = "data:" + this.mime + ";base64,";

            // Set data
            this.media_thumb = data_prefix + blob;
            this.media_link = data_prefix + blob;
            this.media_loading = false;
        },
        loadVideo (blob) {
            this.content = ""; // Don't set content

            // Construct data url
            const data_prefix = "data:" + this.mime + ";base64,";

            // Set data
            this.video_src = data_prefix + blob;
            this.media_loading = false;
        },
        loadAudio (blob) {
            this.content = ""; // Don't set content

            // Construct data url
            const data_prefix = "data:" + this.mime + ";base64,";

            // Set data
            this.audio_src = data_prefix + blob;
            this.media_loading = false;
        },
        updateType (payload) {
            this.type = payload.message_type;
        },
        openImage (e) {
            if (this.mime.indexOf('image') > -1) {
                const MediaLoader = this.$store.state.media_loader; // get loader
                Util.displayImage(MediaLoader, this.id, this.mime);

                e.stopPropagation();
                e.preventDefault();
            }
        }

    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
    @import "../../assets/scss/_vars.scss";

    .date-wrapper, .sent-wrapper {
        clear: both;

        .date-sent, .sending {
            float: right;
            margin-right: 36px;
        }

        .date-received {
            float: left;
            margin-left: 36px;
        }
    }

    .message-wrapper {
        user-select: text;
        -moz-user-select: text;
        -ms-user-select: text;
        clear: both;
        display: block;

        .message {
            position: relative;
            padding: 16px;
            margin: 4px 8px 4px 8px;
            max-width: 310px;
            border-radius: 15px;
            box-shadow: -1px 2px 4px rgba(0, 0, 0, .1);
            overflow-wrap: break-word;
            word-wrap: break-word;
            min-width: 18px;
        }

        .message_options {
            margin-top: 12px;
            color: rgba(0,0,0,.25);
        }

        .sent_options {
            float: right;
        }

        .media-preview {
            text-align: center;
            margin: auto;
            margin-top: 8px;
            margin-bottom: 8px;
            background: white;
            color: black;
            box-shadow: 1px 2px 4px rgba(0, 0, 0, .1);
        }

        .article-title, .article-snippet {
            color: black;
            text-align: left;
        }

        .message:after {
            content: "";
            position: absolute;
            bottom: -20px;
            left: 50%;
            border-style: solid;
            display: block;
            top: 0px;
            bottom: auto;
        }

        .media-preview:after {
            display: none;
        }

        .received {
            float: left;
            color: #fff;
            margin-left: 28px;
            background: #fff;
            border-color: red transparent;
            box-shadow: 1px 2px 4px rgba(0, 0, 0, .2);

            &:after {
                left: -8px;
                border-width: 37px 0 0 22px;
                border-color: inherit;
            }

            a {
                color: white;
            }
        }

        .sent {
            float: right;
            color: black;
            margin-right: 28px;
            background: #fff;

            &:after {
                right: -8px;
                border-width: 15px 10px 0 0;
                border-color: #fff transparent;
            }

            a {
                color: black;
            }
        }

        .error {
            float: right;
            color: black;
            margin-right: 28px;
            background: #F44336;
            color: #fff;

            &:after {
                right: -8px;
                border-width: 15px 10px 0 0;
                border-color: #F44336 transparent;
            }
        }

        .info {
            text-align: center;
            margin: auto;

            &:after {
                border-color: transparent transparent;
            }
        }

        .media {
            width: 250px;
            height: 250px;
            background-repeat: no-repeat;
            object-fit: cover;
        }

        a {
            text-decoration: none;
        }
        .article-title {
            margin-top: 8px;
            font-size: 15px;
            font-weight: normal;
        }

        .article-snippet {
            margin-top: 12px;
            font-size: 14px;
            font-weight: lighter;
        }

        @media screen and (max-width: 350px) {
            .message, .media {
                max-width: 200px;
            }
            .media {
                width: 200px;
            }
        }

        @media screen and (max-width: 450px) {
            .message {
                max-width: 270px;
            }
            .media {
                width: 270px;
            }
        }

        @media screen and (min-width: 600px) {
            .message {
                max-width: 372px;
            }
            .media {
                width: 372px;
            }
        }

        @media screen and (min-width: 720px) {
            .message {
                max-width: 436px;
            }
            .media {
                width: 436px;
            }
        }
    }

    img {
      padding-bottom: 4px;
    }

    video {
        object-fit: cover;
        background-repeat: no-repeat;
        height: 400px;
    }

    .slide-out-enter-active, .slide-out-leave-active {
        transition: transform .3s ease-in, opacity .3s ease-in;
        position: relative;
        z-index: -10;
    }

    .slide-out-enter, .slide-out-leave-to {
        transform: translateY(-30px);
        opacity: 0;
    }

    .fade-enter-active, .fade-leave-active {
        transition: opacity .3s;
    }

    .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
        opacity: 0;
    }

    body.dark {
        .sent {
            background: $bg-darker;
            color: #fff;

            &:after {
                border-color: $bg-darker transparent;
            }
        }

        .message_options {
            margin-top: 12px;
            color: rgba(255,255,255,.25);
        }
    }

</style>
