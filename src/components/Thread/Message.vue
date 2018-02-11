<template>
    <div class="message-wrapper" :title="stringTime">
        <div :class="style_class"  :style="styleGenerator" :id="id">
            <div v-show="message_from"> <b> {{ message_from }} </b> <br /> </div>
            <div v-html="content"></div>
            <!-- Content is inserted via v-html -->

            <!-- Media -->
            <a :href="media_link" target="_blank" v-show="is_media">
                <img class="media" :src="media_thumb" alt="Thumbnail">
                <div class="article-title"> {{ media_title }} </div>
                <div class="article-snippet"> {{ media_content }} </div>
            </a>
        </div>

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
import { Util } from '@/utils';
import linkify from 'linkifyjs/html';

export default {
    name: 'message',
    props: [ 'messageData', 'threadColor', 'textColor' ],

    mounted () {

        this.$store.state.msgbus.$on('updateMessageType',
            (payload) => this.updateType(payload.id, payload.message_type));

        const MediaLoader = this.$store.state.media_loader; // get loader
        this.style_class.push(this.round);

        switch ( this.mime.split("/")[0] ) {
            /* SMS Text message */
            case "text": {
                this.content = Util.entityEncode(this.content);
                break;
            }

            /* MMS Image Message */
            case "image": { 
                this.content = "<i> Loading MMS </i>";
                this.is_media = true;
    
                // Fetch media
                MediaLoader.getMedia(this.id, this.mime)
                    .then(blob => this.loadImage(blob));
                break;
            }
            
            case "media": {
                this.is_media = true;

                if (this.mime == "media/youtube") { // Legacy Youtube
                    const video_id = this.content
                        .replace("https://img.youtube.com/vi/", "")
                        .replace("/maxresdefault.jpg", "");

                    this.media_link = "https://youtube.com/watch?v=" + this.video_id;
                    this.media_thumb = this.content;
                    break;
                }
                
                // Process Web/Youtube-v2
                const media = JSON.parse(this.content);
                
                // Set media values
                this.media_thumb = media.thumbnail || media.image_url ||"";
                this.media_link = media.url || media.web_url || "";
                this.media_title =  media.title || "";
                this.media_content = media.description || "";

                // Remove content
                this.content = ""; 

                this.media_thumb = this.media_thumb.replace("http", "https");
                
                break;
            }

            default: {
                this.content = "<i>Not yet supported</i>";
                break;
            }
        }

        switch ( this.type ) {
            case 0:
            case 6: { 
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
            }
        }
        
        // Add links
        this.content = linkify(this.content)

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
            media_link: "",
            media_thumb: "",
            media_title: "",
            media_content: "",
            dateLabel: this.messageData.dateLabel
        }
    },
    methods: {
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
        }

    },

    computed: {
        sending () {
            return this.type == 2 ? true : false;
        },
        round () {
            return this.$store.state.round ? 'message-round' : 'message';
        },
        stringTime () {
            return new Date(this.timestamp).toLocaleString()
        },
        styleGenerator () {
            // Only style recieved and media
            if (this.type != 0 && this.type != 6) 
                return "";
            
            let media = "";
            if (this.is_media)
                media = "padding-bottom:4px;"

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

        .message, .message-round {
            position: relative;
            padding: 16px;
            margin: 4px 8px 4px 8px;
            max-width: 310px;
            border-radius: 2px;
            overflow-wrap: break-word;
            word-wrap: break-word;
            min-width: 18px;

            &:after {
                content: "";
                position: absolute;
                bottom: -20px;
                left: 50px;
                border-style: solid;
                display: block;
                top: 0px;
                bottom: auto;
            }
        }

        .received {
            float: left;
            color: #fff;
            margin-left: 28px;
            background: #fff;
            border-color: red transparent;

            &:after {
                left: -18px;
                border-width: 15px 0 0 20px;
                border-color: inherit;
            }
            a {
                color: #fff;
            }
        }

        .sent {
            float: right;
            color: black;
            margin-right: 28px;
            background: #fff;

            &:after {
                right: -18px;
                border-width: 15px 20px 0 0;
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
                right: -18px;
                border-width: 15px 20px 0 0;
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

        @media screen and (min-width: 150px) {
            .media {
                width: 310px;
            }
        }

        @media screen and (min-width: 350px) {
            .media {
                width: 310px;
            }
            .mdl-layout-title {
                max-width: 160px;
            }
        }

        @media screen and (min-width: 600px) {
            .message, .message-round {
                max-width: 372px;
            }
            .media {
                width: 372px;
            }
        }

        @media screen and (min-width: 720px) {
            .message, .message-round {
                max-width: 436px;
            }
            .media {
                width: 436px;
            }
        }
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
