<template>
    <div v-mdl class="spinner" id="loading">
        <div class="mdl-spinner mdl-spinner--single-color mdl-js-spinner is-active"></div>
    </div>
</template>

<script>
export default {
    name: 'spinner'
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
    @import "../assets/scss/_vars.scss";

    .spinner {
        margin: auto;
        width: 48px;
        margin-top: 100px;
    }

</style>
