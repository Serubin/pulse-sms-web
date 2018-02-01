<template>
    <span class="mdl-chip mdl-chip--deletable contact-chip">
        <span class="mdl-chip__text">{{ contact.name }}</span>
        <button type="button" class="mdl-chip__action" @click="() => onDelete(contact)"><i class="material-icons">cancel</i></button>
    </span>
</template>

<script>

export default {
    name: 'ContactChip',
    props: [ 'contact', 'onDelete'],
    components: {
        
    }
}
</script>

<style lang="scss" scoped>
    @import "../../assets/scss/_vars.scss";

</style>
