<template>
    <div class="date-wrapper">
        <div :class="textType" class="mdl-color-text--grey-500"> {{ date }}</div>
    </div>
</template>

<script>
export default {
    name: 'date-label',
    props: [],
    computed: {
        messageType () {
            if( this.type == 0 || this.type == 6}
                return "
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
    @import "../assets/scss/_vars.scss";

    .date-wrapper {
        margin: auto;
        width: 48px;
    }

</style>
