<template>
    <span class="mdl-chip mdl-chip--deletable contact-chip" :title="contact.phone">
        <span class="mdl-chip__text">{{ contact.name }}</span>
        <button type="button" class="mdl-chip__action" @click="() => onDelete(contact)"><i class="material-icons">cancel</i></button>
    </span>
</template>

<script>

export default {
    name: 'ContactChip',
    components: {

    },
    props: [ 'contact', 'onDelete']
};
</script>

<style lang="scss" scoped>
    @import "../../assets/scss/_vars.scss";

</style>
