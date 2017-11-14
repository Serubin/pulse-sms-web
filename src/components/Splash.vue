<template>
    <div v-mdl class="splash">
        <div class="splash-center">
            <img src="../assets/images/android-desktop.png" />
            <h3> {{ $store.state.title }} </h3>
        </div>
    </div>
</template>

<script>
export default {
    name: 'splash'
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
    @import "../assets/scss/_vars.scss";

    .splash {
        background: $bg-light;
        color: #666666;
        position: fixed;
        z-index: 1000;
        left: 0px;
        top: 0px;
        height: 100vh;
        width: 100%;
        margin: auto;

        .splash-center {
            text-align: center;
            vertical-align: middle;
            margin: 30vh auto;
        }

        .splash-subtext {
            text-align: center;
            margin: 80vh auto;
        }
    }

    body.dark .splash {
        background: $bg-dark;
        color: #fff;
    }

</style>
