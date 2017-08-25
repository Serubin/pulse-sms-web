<template>
    <div class="message-wrapper" :title="stringTime">
        <div :class="{'message-round': round, 'message': !round}" :class="msgType" :style="{background: color, borderColor: color transparent}" :id="id">
            {{ message }}
        </div>
    </div>
</template>

<script>
export default {
    name: 'message',
    props: [],
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
    @import "../assets/scss/_vars.scss";

</style>
