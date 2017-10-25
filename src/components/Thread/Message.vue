<template>
    <div class="message-wrapper" :title="stringTime">
        <div :class="style_class"  :style="styleGenerator" :id="id" v-html="content">
            <div> {{ message_from }} </div>
            <!-- Content is inserted via v-html -->

            <!-- Media -->
            <a href="media_link" target="_blank" v-show="is_media">
                <img class="media" src="media_thumb" alt="Thumbnail">
                <div class="article-title"> {{ media_title }} </div>
                <div class="article-snippet"> {{ media_content }} </div>
            </a>
        </div>

        <div class="date-wrapper" v-if="dateLabel">
            <div :class="dateType" class="mdl-color-text--grey-500"> {{ dateLabel }}</div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'message',
    props: [ 'messageData', 'threadColor' ],

    mounted () {

        this.style_class.push(this.round);

        switch ( this.mime ) {
            case "text/plain": {
                this.content = this.content.replace(/\n/g, "<br />");
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

        // Display "From" in group messages
        if ((this.message_from != null && this.message_from.length) != 0 &&
            this.type == 0) {

            this.message_from = "<b>" + this.message_from + ":</b><br/>";
            this.content = this.message_from + this.content;
        }

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

    computed: {
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

            return "background: " + this.color + ";"
                + "border-color: " + this.color
                + " transparent;"
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

    .date-wrapper {
        clear: both;

        .date-sent {
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
            color: white;
            margin-left: 28px;
            background: white;
            border-color: red transparent;

            &:after {
                left: -18px;
                border-width: 15px 0 0 20px;
                border-color: inherit;
            }
        }

        .sent {
            float: right;
            color: black;
            margin-right: 28px;
            background: white;

            &:after {
                right: -18px;
                border-width: 15px 20px 0 0;
                border-color: white transparent;
            }
        }
        
        .error {
            float: right;
            color: black;
            margin-right: 28px;
            background: #F44336;
            color: white;

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
    }

</style>
