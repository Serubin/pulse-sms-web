<template>
    <div class="label mdl-color-text--grey-500"> {{conversationData.label}} </div>
</template>

<script>
export default {
    name: 'conversation-title',
    props: ['conversationData']
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
    @import "../../assets/scss/_vars.scss";
    
    .label {
        margin-left: 6px;
        font-size: 12px;
        margin-top: 8px;
        margin-bottom: 8px;
    }
</style>
