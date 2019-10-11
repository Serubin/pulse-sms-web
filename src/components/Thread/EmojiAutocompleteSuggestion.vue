<template>
    <div>
        <div class="click-item mdl-js-button mdl-js-ripple-effect" @click="onClick">
            <div class="mdl-color-text--grey-900">
                {{ emojiImage }} {{ emojiName }}
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "EmojiAutocompleteSuggestion",
    props: ["emoji", "onSelected"],

    data() {
        return {
            emojiImage: this.emoji.emoji,
            emojiName: this.emoji.title
        };
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

.item,
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

.item:hover,
.click-item:hover {
  background: #e0e0e0;
}

.click-item:hover {
  cursor: pointer;
}

body.dark {
  .item,
  .click-item {
    background: #202024;
  }

  .item:hover,
  .click-item:hover {
    background: #282828;
  }
}
</style>
