<template>
    <div aria-atomic="true" aria-relevant="text" class="mdl-snackbar mdl-js-snackbar" v-mdl>
        <div class="mdl-snackbar__text"></div>
        <button type="button" class="mdl-snackbar__action"></button>
    </div>
</template>

<script>
export default {
    name: 'snackbar',
    // JS for this is found in utils/Util
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
    @import "../assets/scss/_vars.scss";


    .mdl-snackbar { /* Inbox style snackbar */
        display: block !important;
        transform: translate(0%,80px);
        bottom: 24px;
        left: 24px;
        position: fixed;
        z-index: 4500;

        @media (max-width: $mini_width) {
            & {
                bottom: 0;
                left: 0;
                width: 100%;
                max-width: 100%
            }
        }

        &--active {
            transform: translate(0%, 0);
        }

        &__action {
            opacity: 1;
            height: 48px;
            pointer-events: all;
        }
    }

</style>
