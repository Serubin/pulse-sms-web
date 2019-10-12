<template>
    <div>
        <div :class="classes" @click="onClick">
            <div class="mdl-color-text--grey-900">
                {{ emojiImage }} {{ emojiCode }}
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "EmojiAutocompleteSuggestion",
    props: ["emoji", "onSelected", "isActive"],

    data() {
        return {
            emojiImage: this.emoji.emoji,
            emojiCode: `:${this.emoji.code}`
        };
    },

    computed: {
        classes () {
            let base = "click-item mdl-js-button mdl-js-ripple-effect";
            if (this.isActive) {
                base = base + " is-active";
            }

            return base;
        }
    },

    methods: {
        onClick() {
            this.onSelected(this.emojiImage);
        }
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
@import "../../assets/scss/_vars.scss";

.click-item {
    background: #fafafa;
    position: relative;
    width: 100%;
    padding: 12px;
    line-height: 18px;
    border-radius: 3px;
    margin-top: -3px;
    -webkit-user-select: text;
    -moz-user-select: text;
    -ms-user-select: text;
    user-select: text;
}

.click-item:hover,
.is-active {
    background: #e0e0e0;
    cursor: pointer;
}

body.dark {
    .click-item {
        background: #202024;
    }
    .click-item:hover,
    .is-active {
        background: #282828;
    }
}
</style>
