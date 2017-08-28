<template>
    <div class="message-wrapper" :title="stringTime">
        <div :class="style_class"  :style="{background: color, borderColor: [color, 'transparent'] }" :id="id">
            {{ content }}
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
                this.color = this.thread_color;
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


    },

    data () {
        return {
            id: this.messageData.device_id,
            mime: this.messageData.mime_type,
            content: this.messageData.data,
            type: this.messageData.message_type,
            timestamp: this.messageData.timestamp,
            color: '',
            style_class: [ ]
        }
    },

    computed: {
        round () {
            return this.$store.state.round ? 'message-round' : 'message';
        },
        stringTime () {
            return new Date(this.timestamp).toLocaleString()
        },
        msgType () {
            return '';
        },
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
    @import "../assets/scss/_vars.scss";

</style>
