<template>
    <div>
        <div class="item" :id="id" v-mdl @click="routeToList">{{ name }}</div>
    </div>
</template>

<script>

export default {
    name: 'FolderItem',
    props: [ 'folderData' ],

    data () {
        return {
            id: this.folderData.device_id,
            name: this.folderData.name
        }
    },

    methods: {
        routeToList () {
            this.$router.push({
                name: 'conversations-list-folder', params: { index: 'folder', small: false, folderId: this.id, folderName: this.name }
            });
        }
    }

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
    @import "../../assets/scss/_vars.scss";

    body.dark {
        .item:hover {
            background: #202020;
        }
    }

    .item {
        height: 40px;
        line-height: 40px;
        width: 100%;
        padding-left: 16px;
    }

    .item:hover {
        background: #E0E0E0;
        cursor: pointer;
    }


</style>
