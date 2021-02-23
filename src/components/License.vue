<template>
    <div id="license-display" v-mdl :class="isCurrentPage && 'page-content'">
        <h1>Licenses & Notices</h1>
        <div class="item">
            <div class="mdl-color-text--grey-900">
                PulseSMS Web is Open Source and community created.
            </div>
            <div class="mdl-color-text--grey-600">
                Required notices and changelog can be found below.
            </div>
        </div>

        <a class="click-item" :href="urls.changelog" @click.stop.prevent="routeTo(urls.changelog)">Changelog</a>
        <a class="click-item" :href="urls.notices" @click.stop.prevent="routeTo(urls.notices)">Notices</a>
        <a class="click-item" :href="urls.license" @click.stop.prevent="routeTo(urls.license)">Full License</a>

        <h1><!-- No CSS spacer --></h1>
        <div class="item">
            <div class="license">
                <p>Copyright 2018 Luke Klinker and Solomon Rubin</p>
                <p>Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at</p>
                <p>http://www.apache.org/licenses/LICENSE-2.0</p>
                <p>Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.</p>
            </div>
            <p id="and">AND</p>
            <div class="license">
                <p>Copyright 2018 Solomon Rubin</p>
                <p>Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:</p>
                <p>The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.</p>
                <p>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.</p>
            </div>
        </div>
    </div>
</template>

<script>

export default {
    name: 'License',

    data () {
        return {
            title: 'License and Notices',
            loading: false,
            urls: {
                changelog: 'https://github.com/serubin/pulse-sms-web/',
                license: 'https://github.com/Serubin/pulse-sms-web/blob/master/LICENSE',
                notices: 'https://github.com/Serubin/pulse-sms-web/blob/master/NOTICES'
            }
        };
    },

    computed: {
        isCurrentPage () {
            return this.$route.name.toLowerCase() === this.$options.name.toLowerCase();
        }
    },

    mounted () {
        this.$store.commit('title', this.title);
    },

    methods: {
        routeTo (route) {
            window.open(route, '_blank');
        }
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
    @import "../assets/scss/_vars.scss";
    h1 {
        font-size: 24px;
        line-height: 32px;
        margin: 24px 0 16px;
    }

    .item, .click-item {
        position: relative;
        width: 100%;
        padding: 12px;
        line-height: 18px;
    }

    .item:hover, .click-item:hover {
         background: #E0E0E0;
    }

    .click-item:hover {
        cursor: pointer;
    }

    a.click-item {
        display: block;
        text-decoration: none;
        color: inherit;
    }

    .license {
        font-family: monospace;
        :first-child {
            text-align: center;
        }
    }
    #and {
        font-weight: bold;
        text-align: center;
    }

    body.dark {
        .item:hover, .click-item:hover {
            background: #202020;
        }
    }

</style>
