<template>
    <div class="message-wrapper" :title="stringTime" @mouseover="showOptions" @mouseleave="hideOptions">
        <div id="offset-marker" v-if="this.messageData.marker"></div>

        <transition name="fade">
            <div :class="style_class" :style="styleGenerator" :id="id" v-if="!this.messageData.marker">
                <div v-show="message_from"> <b> {{ message_from }} </b> <br /> </div>
                <div v-html="content"></div>
                <!-- Content is inserted via v-html -->

                <!-- Media -->
                <a :href="media_link" target="_blank" v-show="is_media">
                    <img class="media" :src="media_thumb" alt="Thumbnail" @click="openImage">
                    <div class="article-title" v-show="is_article"> {{ media_title }} </div>
                    <div class="article-snippet" v-show="is_article"> {{ media_content }} </div>
                </a>
            </div>
        </transition>

        <transition name="fade">
            <button id="delete-button" :class="options_class" class="message_options menu_icon refresh mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect" tag="button" v-if="displayOptions" @click="deleteMessage">
               <i class="material-icons">delete</i>
            </button>
        </transition>

        <div class="date-wrapper" v-if="dateLabel">
            <div :class="dateType" class="mdl-color-text--grey-500"> {{ dateLabel }}</div>
        </div>

        <transition name="slide-out">
            <div class="sent-wrapper" v-if="sending">
                <div class="sending mdl-color-text--grey-500">Sending...</div>
            </div>
        </transition>
    </div>
</template>

<script>
import { Util, Api, SessionCache } from '@/utils';
import linkify from 'linkifyjs/html';

export default {
    name: 'message',
    props: [ 'messageData', 'threadColor', 'textColor' ],

    mounted () {
        if ( this.messageData.marker )
            return;

        this.$store.state.msgbus.$on('updateMessageType',
            (payload) => this.updateType(payload.id, payload.message_type));

        const MediaLoader = this.$store.state.media_loader; // get loader
        this.style_class.push('message');

        switch ( this.mime.split("/")[0] ) {
            /* SMS Text message */
            case "text": {
                break;
            }

            /* MMS Image Message */
            case "image": {
                this.content = "<i style='line-height:250px;'> Loading MMS </i>";
                this.is_media = true;

                // Fetch media
                MediaLoader.getMedia(this.id, this.mime)
                    .then(blob => this.loadImage(blob));
                break;
            }

            case "video": {
                this.content = "<i>Video not yet supported.</i>";
                break;
            }

            case "audio": {
                this.content = "<i>Audio not yet supported.</i>";
                break;
            }

            case "media": {
                this.is_media = true;
                this.is_article = true;

                this.style_class.push('media-preview');

                const media = JSON.parse(this.content);

                if (this.mime == "media/map") {
                    let map = "https://maps.googleapis.com/maps/api/staticmap" +
                          "?size=600x400" +
                          "&markers=color:red%7C" + media.latitude + "," + media.longitude +
                          "&key=AIzaSyAHq1IIIdGz01rEbEtUtDwEFJWwvAI_lww"
                    let googleMaps = "https://maps.google.com/maps/@" + media.latitude + "," + media.longitude + ",16z";

                    this.media_thumb = map;
                    this.media_link = googleMaps;
                    this.media_title = "";
                    this.media_content = "";
                } else if (this.mime == "media/youtube-v2") {
                    this.media_thumb = media.thumbnail;
                    this.media_link = media.url;
                    this.media_title =  media.title;
                    this.media_content = "";
                } else if (this.mime == "media/web") {
                    this.media_thumb = media.image_url;
                    this.media_link = media.web_url;
                    this.media_title =  media.title;
                    this.media_content = media.description;
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

        let linkClass = 'link-sent'
        if (!this.is_article) {
            switch ( this.type ) {
                case 0:
                case 6: {
                    linkClass = 'link-received'
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
                    this.style_class.push('sent') //TODO add text color from global theme
                    this.options_class.push('sent_options');
                }
            }
        }

        // Add links
        this.content = linkify(this.content, { className: linkClass })
    },

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
            media_link: "",
            media_thumb: "",
            media_title: "",
            media_content: "",
            dateLabel: this.messageData.dateLabel,

            options_class: [ ],
            displayOptions: false
        }
    },
    methods: {
        showOptions () {
            this.displayOptions = true;
        },
        hideOptions () {
            this.displayOptions = false;
        },
        deleteMessage() {
            Api.removeMessage(this.id);
            SessionCache.invalidateMessages(this.messageData.device_conversation_id);

            this.$store.state.msgbus.$emit('deletedMessage', this.id);
        },
        loadImage (blob) {
            this.content = ""; // Don't set content

            // Construct data url
            const data_prefix = "data:" + this.mime + ";base64,";

            // Set data
            this.media_thumb = data_prefix + blob;
            this.media_link = data_prefix + blob;
        },
        updateType (id, type) {
            if (this.id != id)
                return;

            this.type = type;
        },
        openImage (e) {
            if (this.mime.indexOf('image') > -1) {
                const MediaLoader = this.$store.state.media_loader; // get loader
                Util.displayImage(MediaLoader, this.id, this.mime);

                e.stopPropagation();
                e.preventDefault();
            }
        }

    },

    computed: {
        sending () {
            return this.type == 2 && (new Date().getTime() - this.timestamp) < 1000 * 60 ? true : false;
        },
        stringTime () {
            return new Date(this.timestamp).toLocaleString()
        },
        styleGenerator () {
            // Only style recieved and media
            if (this.type != 0 && this.type != 6)
                return "";

            let media = "";
            if (this.is_article || this.is_media)
                media = "padding-bottom:10px;"

            return "background: " + this.color + ";"
                + "border-color: " + this.color
                + " transparent;" + media
                + "color:" + this.textColor + ";";
        },
        dateType () {
            if (this.type == 0 || this.type == 6)
                return "date-received"
            return "date-sent"
        }
    }
}
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
            .message {
                max-width: 200px;
            }
        }

        @media screen and (max-width: 450px) {
            .message {
                max-width: 270px;
            }
        }

        @media screen and (min-width: 150px) {
            .media {
                width: 310px;
            }
        }

        @media screen and (min-width: 150px) {
            .media {
                width: 310px;
            }
        }

        @media screen and (min-width: 350px) {
            .media {
                width: 310px;
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
    }

</style>
