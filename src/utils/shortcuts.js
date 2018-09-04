import hotkeys from 'hotkeys-js';
import store from '@/store/';
import router from '@/router/';

export default class ShortcutKeys {

    constructor () {
        this.initializeKeys();
        this.performedShortcut = false;
    }

    initializeKeys () {
        let _this = this;

        hotkeys('control+shift+left,command+shift+left,alt+shift+left,ctrl+shift+left', function(event) {
            store.commit('hotkey_navigation', true);
            _this.finish(event, "page to previous conversation", () => { store.state.msgbus.$emit("hotkey-page-previous") });
        });

        hotkeys('control+shift+right,command+shift+right,alt+shift+right,ctrl+shift+right', function(event) {
            store.commit('hotkey_navigation', true);
            _this.finish(event, "page to next conversation", () => { store.state.msgbus.$emit("hotkey-page-next") });
        });

        hotkeys('control+backspace,command+backspace,alt+backspace,ctrl+backspace', function(event) {
            _this.finish(event, "back to conversation list", () => { router.push('/') });
        });

        hotkeys("control+n,alt+n,ctrl+n", function(event) {
            _this.finish(event, "open compose page", () => { router.push('/compose') });
        });

        hotkeys("control+shift+s,command+shift+s,alt+shift+s,ctrl+shift+s", function(event) {
            _this.finish(event, "open search bar", () => { store.state.msgbus.$emit("search-btn") });
        });

        hotkeys('control+e,command+e,alt+e,ctrl+e', function(event) {
            _this.finish(event, "opened the emoji input", () => { store.state.msgbus.$emit("hotkey-emoji") });
        });

        hotkeys('esc', function(event) {
            _this.finish(event, "exiting image", () => { store.state.msgbus.$emit("hotkey-esc") });
        });
    }

    finish (event, description, action) {
        if (this.performedShortcut) {
            return;
        }

        console.log(description);
        action();

        this.performedShortcut = true;

        let _this = this;
        setTimeout(function() {
            _this.performedShortcut = false;
        }, 300);

        event.preventDefault();
        event.stopPropagation();
    }
}
