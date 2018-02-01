<template>
    <li class="mdl-card mdl-js-button mdl-js-ripple-effect" @click="() => onClick(contact)" v-mdl>
        <div class="inline">
            <span id="name">{{ contact.name }}</span>
            <span id="phone">{{ contact.phone }}</span>
        </div>
    </li>
</template>

<script>

export default {
    name: 'SelectionItem',
    props: [ 'contact', 'onClick'],
    components: {
        
    }
}
</script>

<style lang="scss" scoped>
    @import "../../assets/scss/_vars.scss";
    
    li {
        min-height: 2em;
        width: 100%;
        border-bottom: rgba(0, 0, 0, 0.12) 1px solid;
        padding: 1em;

        .inline {
            display: inline;
        }

        #name {
            color: black;
            font-size: 16px;
            padding: 24px 16px 0px 0px;
            white-space: nowrap;
            overflow: hidden;
        }

        #phone {
            color: rgba(0,0,0,.54);
            font-size: 1rem;
            line-height: 18px;
            overflow: hidden;
            padding: 16px;
            width: 90%;
        }
    }


</style>
