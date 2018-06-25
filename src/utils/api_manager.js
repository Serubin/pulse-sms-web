import Vue from 'vue'
import router from '@/router/'
import store from '@/store/'
import emojione from 'emojione'
import * as firebase from 'firebase';
import ImageCompressor from '@xkeshi/image-compressor';
import ReconnectingWebsocket from 'reconnecting-websocket'

import { Util, Url, Crypto, SessionCache } from '@/utils/'

export default class Api {

    constructor () {
        this.socket = null;
        this.openWebSocket();

        this.has_disconnected = false;
    }

    /**
     * Open reconnecting websocket.
     */
    openWebSocket () {
        const this_ = this;

        this.socket = new ReconnectingWebsocket(Url.get('websocket') + Url.getAccountParam());

        this.socket.addEventListener('open', () => {
            if (this.has_disconnected) {
                store.state.msgbus.$emit('refresh-btn');
                Util.snackbar("And we're back!");
            }

            this.has_disconnected = false;

            const subscribe = JSON.stringify({
                "command": "subscribe",
                "identifier": JSON.stringify({
                    "channel": "NotificationsChannel"
                })
            });

            this.socket.send(subscribe);
        });

        this.socket.addEventListener('message', (e) => this.handleMessage(e));

        this.socket.addEventListener('close', (e) => {
            if (e.wasClean || e.code == 1001) // If not an error, ignore
                return

            if (!this.has_disconnected)
                Util.snackbar("You've been disconnected. We're trying to reconnect you...");

            this.has_disconnected = true;
        });
    }

    /**
     * Perminently close socket
     */
    closeWebSocket() {
        this.socket.close(1000, '', { keepClosed: true });
    }

    /**
     * Handle incoming socket data
     * @param e - socket event
     */
    handleMessage (e) {
        if (e.data.indexOf("ping") != -1) { // Is keep alive event
            // Store last ping to maintain data connection
            store.commit('last_ping', Date.now() / 1000 >> 0);
            return;
        }

        // Parse out JSON
        const json = JSON.parse(e.data);

        // Ignore bad messages
        if (typeof json.message == "undefined")
            return;

        const operation = json.message.operation;

        // Parse any emojis
        if (typeof json.message.content.data != "undefined")
            json.message.content.data = emojione.unicodeToImage(
                json.message.content.data
            );


        if (operation == "added_message") {
            let message = json.message.content;
            message.message_from = message.from;
            message = Crypto.decryptMessage(message);

            this.notify(message);
            SessionCache.cacheMessage(message);
            store.state.msgbus.$emit('newMessage', message);
        } else if (operation == "read_conversation") {
            const id = json.message.content.id;

            SessionCache.readConversation('index_unarchived');
            SessionCache.readConversation('index_archived');

            store.state.msgbus.$emit('conversationRead', id);
        } else if (operation == "update_message_type") {
            const id = json.message.content.id;
            const message_type = json.message.content.message_type;

            SessionCache.updateMessageType(id, message_type);
            store.state.msgbus.$emit('updateMessageType', { id, message_type });
        } else if (operation == "added_conversation") {
            const id = json.message.content.id;

            SessionCache.invalidateConversations('index_unarchived');
            store.state.msgbus.$emit('addedConversation', { id });
        } else if (operation == "removed_conversation") {
            const id = json.message.content.id;

            SessionCache.removeConversation(id, 'index_unarchived');
            store.state.msgbus.$emit('removedConversation', { id });
        } else if (operation == "archive_conversation") {
            const id = json.message.content.id;

            if (json.message.content.archive) {
                SessionCache.removeConversation(id, 'index_unarchived');
                SessionCache.invalidateConversations('index_archived');
            } else {
                SessionCache.removeConversation(id, 'index_archived');
                SessionCache.invalidateConversations('index_unarchived');
            }

            store.state.msgbus.$emit('removedConversation', { id });
        }
    }

    /**
     * Submit notification for message
     * @param message  - message object
     */
    notify(message) {
        if (Notification.permission != "granted" && !store.state.notifications)
            return

        if (message.type != 0)
            return;

        const contact = store.getters.getConversationData(message.conversation_id);

        if (contact != null && contact.mute)
            return;

        const title = contact.name;
        const snippet = contact.private_notifications
                            ? "" : Util.generateSnippet(message);

        const link = "/thread/" + message.conversation_id;

        const notification = new Notification(title, {
            icon: '/static/images/android-desktop.png',
            body: snippet
        });

        notification.onclick = () => {
            window.focus()
            router.push(link);
        }
    }

    static login (username, password) {
        const promise = new Promise((resolve, reject) => {
            const constructed_url = Url.get('login')
            const request = {
                username,
                password
            };

            Vue.http.post(constructed_url, request, {'Content-Type': 'application/json'})
                .then((response) => resolve(response))
                .catch((error) =>reject(error));

        });

        return promise
    }

    static fetchConversations (index, folderId) {
        if (typeof index == 'undefined') {
            index = "index_unarchived"
        }

        if (index == 'folder') {
            index = index + "/" + folderId;
        }

        let constructed_url =
            Url.get('conversations') + index + Url.getAccountParam() + "&limit=75"

        const promise = new Promise((resolve, reject) => {
            if (!SessionCache.hasConversations(index)) {
                Vue.http.get( constructed_url )
                    .then(response => {
                        response = response.data

                        if (response != null) {
                            // Decrypt Conversations items
                            for(let i = 0; i < response.length; i++) {
                                const convo = Crypto.decryptConversation(response[i]);
                                if (convo != null)
                                    response[i] = convo;
                            }

                            SessionCache.putConversations(response, index);
                        }

                        resolve(response); // Resolve response
                    })
                    .catch( response => Api.rejectHandler(response, reject) );
            } else {
                resolve(SessionCache.getConversations(index));
            }
        });

        return promise
    }

    static fetchThread (conversation_id, offset = 0) {
        const limit = 70;
        const constructed_url =
            Url.get('messages') + Url.getAccountParam()
                + "&conversation_id=" + conversation_id + "&limit=" + limit
                + "&web=true&offset=" + offset;

        const promise = new Promise((resolve, reject) => {
            if (!SessionCache.hasMessages(conversation_id) || offset > 0) {
                Vue.http.get( constructed_url )
                    .then(response => {
                        response = response.data

                        // Decrypt Conversations items
                        for(let i = 0; i < response.length; i++) {
                            const message = Crypto.decryptMessage(response[i]);
                            if (message != null)
                                response[i] = message;
                        }

                        if (offset == 0) {
                            SessionCache.putMessages(response, conversation_id);
                        }

                        resolve(response);
                    })
                    .catch( response => Api.rejectHandler(response, reject) );
            } else {
                resolve(SessionCache.getMessages(conversation_id));
            }
        });

        return promise
    }

    static createThread (to, message) {
        const constructed_url = Url.get("new_thread");

        const request = {
            account_id: store.state.account_id,
            to: to,
            message: message
        }

        const promise = new Promise((resolve, reject) => {
            Vue.http.post(constructed_url, request, {'Content-Type': 'application/json'})
            .then( response  => resolve(response) )
            .catch( response => Api.rejectHandler(response, reject) )
        });

        return promise;
    }

    static sendMessage (data, mime_type, thread_id, message_id=null) {
        let account_id = store.state.account_id;

        let id = message_id || Api.generateId();

        let snippet = mime_type == "text/plain" ? ("You: " + data) : "<i>Picture Message</i>";

        let encrypted = Crypto.encrypt(data);
        let snippetEncrypted = Crypto.encrypt(snippet);

        let timestamp = new Date().getTime();

        // Define request
        let request = {
            account_id: account_id,
            device_id: id,
            device_conversation_id: thread_id,
            message_type: 2,
            data: encrypted,
            timestamp: timestamp,
            mime_type: Crypto.encrypt(mime_type),
            read: true,
            seen: true
        };

        let conversationRequest = {
            account_id: account_id,
            read: true,
            timestamp: timestamp,
            snippet: snippetEncrypted
        };

        // Update on servers
        let constructed_url = Url.get('add_message');
        Vue.http.post(constructed_url, request, {'Content-Type': 'application/json'})
            .catch(response => console.log(response));

        constructed_url = Url.get('update_conversation') + thread_id;
        Vue.http.post(constructed_url, conversationRequest, {'Content-Type': 'application/json'})
            .catch(response => console.log(response));

        // Submit event
        let event_object = {
            device_id: id,
            conversation_id: thread_id,
            timestamp: timestamp,
            mime_type: mime_type,
            message_type: 2,
            data: emojione.unicodeToImage(Util.entityEncode(data)),
            read: true,
            snippet: snippet
        }

        store.state.msgbus.$emit('newMessage', event_object);
    }

    static loadFile(file, compress=null) {
        if (!file.type.startsWith("image/"))
            return Util.snackbar("File type not supported")

        if (compress < 0.05 && compress != null)
            return Util.snackbar("Image too large")

        if (compress == null)
            compress = 0.6

         // Disallow large non-image files
        if ((file.type.startsWith("image/") || !file.type === "image/gif")
            && file.size > 1024 * 1024) {
            return new ImageCompressor(file, {
                quality: compress,
                maxWidth: 1500,
                maxHeight: 1500,
                success: (result) => Api.loadFile(result, compress * 0.7),
                error: (e) => null
            });
        }

        store.commit('loaded_media', file);
        Vue.nextTick(() => Util.scrollToBottom(250))
    }

    static sendFile(file, thread_id) {
        store.commit('media_sending', true);

        const reader = new FileReader()
        reader.onload = (e) => {
            let encryptedFile = Crypto.encryptData(new Uint8Array(e.target.result));
            encryptedFile = new TextEncoder('utf-8').encode(encryptedFile);

            const id = Api.generateId();
            const account_id = store.state.account_id;

            const storageRef = firebase.storage().ref();
            const accountRef = storageRef.child(account_id);
            const messageRef = accountRef.child(id + "");

            // Add to firebase
            messageRef.put(encryptedFile).then((snapshot) => {
                // Send message
                Api.sendMessage("firebase -1", file.type, thread_id, id);

                // Make url
                const constructed_url = Url.get('media') + id + Url.getAccountParam();
                Vue.http.get(constructed_url);

                // Empty loaded media
                store.commit('loaded_media', null)
                store.commit('media_sending', false);
            });
        }

        reader.readAsArrayBuffer(file);
    }

    static markAsRead (thread_id) {
        // Read conversation
        let constructed_url = Url.get('read') + thread_id + Url.getAccountParam();
        Vue.http.post(constructed_url)
            .catch((e) => Api.rejectHandler(e));

        // Dismiss notifiction
        constructed_url = Url.get('dismiss') + Url.getAccountParam()
                + "&id=" + thread_id;
        Vue.http.post(constructed_url);
    }

    static archiver (archive, conversation) {
        let constructed_url;

        if (archive)
            constructed_url = Url.get('archive')
        else
            constructed_url = Url.get('unarchive')

        constructed_url += conversation + Url.getAccountParam();

        Vue.http.post(constructed_url);
    }

    static deleter (conversation) {
        let constructed_url = Url.get('delete') + conversation + Url.getAccountParam();
        Vue.http.post(constructed_url);
    }

    static fetchFolders () {
        let constructed_url = Url.get('folders') + Url.getAccountParam();
        const promise = new Promise((resolve, reject) => {
            Vue.http.get( constructed_url )
                .then( response => {
                    response = response.data

                    // Decrypt Folder items
                    for(let i = 0; i < response.length; i++) {
                        const folder = Crypto.decryptFolder(response[i]);
                        if (folder != null)
                            response[i] = folder;
                    }

                    resolve(response);
                })
                .catch( response => Api.rejectHandler(response, reject) );
        });

        return promise
    }

    static fetchBlacklists () {
        let constructed_url = Url.get('blacklists') + Url.getAccountParam();
        const promise = new Promise((resolve, reject) => {
            Vue.http.get( constructed_url )
                .then( response => {
                    response = response.data

                    // Decrypt Blacklist items
                    for(let i = 0; i < response.length; i++) {
                        const blacklist = Crypto.decryptBlacklist(response[i]);
                        if (blacklist != null)
                            response[i] = blacklist;
                    }

                    resolve(response);
                })
                .catch( response => Api.rejectHandler(response, reject) );
        });

        return promise
    }

    static removeBlacklist (id) {
        let constructed_url = Url.get('remove_blacklist') + id + Url.getAccountParam();
        Vue.http.post(constructed_url);
    }

    static createBlacklist (phone_number) {
        let request = {
            account_id: store.state.account_id,
            device_id: Api.generateId(),
            phone_number: Crypto.encrypt(phone_number)
        };

        let constructed_url = Url.get('create_blacklist');

        const promise = new Promise((resolve, reject) => {
            Vue.http.post(constructed_url, request, {'Content-Type': 'application/json'})
                .then(response => { resolve(response); });
        });

        return promise;
    }

    static fetchScheduledMessages () {
        let constructed_url = Url.get('scheduled') + Url.getAccountParam();
        const promise = new Promise((resolve, reject) => {
            Vue.http.get( constructed_url )
                .then( response => {
                    response = response.data

                    // Decrypt Scheduled Message items
                    for(let i = 0; i < response.length; i++) {
                        const message = Crypto.decryptScheduledMessage(response[i]);
                        if (message != null)
                            response[i] = message;
                    }

                    resolve(response);
                })
                .catch( response => Api.rejectHandler(response, reject) );
        });

        return promise
    }

    static removeScheduledMessage (id) {
        let constructed_url = Url.get('remove_scheduled') + id + Url.getAccountParam();
        Vue.http.post(constructed_url);
    }

    static createScheduledMessage (to, message, time, title) {
        let request = {
            account_id: store.state.account_id,
            device_id: Api.generateId(),
            to: Crypto.encrypt(to),
            data: Crypto.encrypt(message),
            mime_type: Crypto.encrypt("text/plain"),
            title: Crypto.encrypt(title.trim().length == 0 ? to : title.trim()),
            timestamp: time
        };

        let constructed_url = Url.get('create_scheduled');

        const promise = new Promise((resolve, reject) => {
            Vue.http.post(constructed_url, request, {'Content-Type': 'application/json'})
                .then(response => { resolve(response); });
        });

        return promise;
    }

    static fetchAccount () {
        const constructed_url = Url.get('account_stats') + Url.getAccountParam();
        const promise = new Promise((resolve, reject) => {
            Vue.http.get(constructed_url)
                .then((response) => resolve(response))
                .catch((error) =>reject(error));
        });

        return promise
    }

    static fetchDrafts () {
        let constructed_url = Url.get('drafts') + Url.getAccountParam();
        const promise = new Promise((resolve, reject) => {
            Vue.http.get( constructed_url )
                .then( response => {
                    response = response.data

                    // Decrypt draft items
                    for(let i = 0; i < response.length; i++) {
                        const draft = Crypto.decryptDraft(response[i]);
                        if (draft != null)
                            response[i] = draft;
                    }

                    resolve(response);
                })
                .catch( response => Api.rejectHandler(response, reject) );
        });

        return promise
    }

    static removeDraftForConversation (conversation_id) {
        let constructed_url = Url.get('remove_draft') + conversation_id + Url.getAccountParam();
        Vue.http.post(constructed_url);
    }

    static fetchDevices () {
        let constructed_url = Url.get('devices') + Url.getAccountParam();
        const promise = new Promise((resolve, reject) => {
            Vue.http.get( constructed_url )
                .then(response => {
                    resolve(response.data);
                })
                .catch( response => Api.rejectHandler(response, reject) );
        });

        return promise
    }

    static removeDevice (id) {
        let constructed_url = Url.get('remove_device') + id + Url.getAccountParam();
        Vue.http.post(constructed_url);
    }

    static fetchSettings () {
        let constructed_url = Url.get('settings') + Url.getAccountParam();
        const promise = new Promise((resolve, reject) => {
            Vue.http.get( constructed_url )
                .then( response => {
                    Api.processSettings(response);
                    resolve(response);

                })
                .catch( response => Api.rejectHandler(response, reject) );
        });

        return promise
    }

    static processSettings (response) {
        response = response.data

        const colors = {
            'default': Util.expandColor(response.color),
            'dark': Util.expandColor(response.color_dark),
            'accent': Util.expandColor(response.color_accent),
        };

        if (colors.default == 'rgba(255,255,255,1)' && colors.dark == 'rgba(255,255,255,1)' && colors.accent == 'rgba(255,255,255,1)') {
            colors.default = store.theme_global_default;
            colors.dark = store.theme_global_dark;
            colors.accent = store.theme_global_default_accent;
        }

        store.commit('theme_base', response.base_theme);
        store.commit('theme_use_global', response.use_global_theme);
        store.commit('theme_use_global', response.use_global_theme);
        store.commit('theme_global', colors);
        store.commit('colors', colors);
    }

    static updateSetting (setting, type, value) {
        let constructed_url = Url.get("update_setting") +
            "?pref=" + setting
            + "&type=" + type
            + "&value=" + value;

        const promise = new Promise((resolve, reject) => {
            Vue.http.post( constructed_url, Url.getAccountPayload(),
                {'Content-Type': 'application/json'})
                .then( response => resolve(true) )
                .catch( response => Api.rejectHandler(resposne, reject) );
        });
    }

    static fetchContacts () {
        let constructed_url = Url.get("contacts") + Url.getAccountParam();
        const promise = new Promise((resolve, reject) => {
            Vue.http.get( constructed_url )
                .then( response => {
                    response = response.data

                    // Decrypt contact items
                    for(let i = 0; i < response.length; i++) {
                        const contact = Crypto.decryptContact(response[i]);
                        if (contact != null)
                            response[i] = contact;
                    }

                    response.sort(function(a, b) {
                        var nameA = a.name.toUpperCase();
                        var nameB = b.name.toUpperCase();

                        if (nameA < nameB) {
                            return -1;
                        } else if (nameA > nameB) {
                            return 1;
                        } else {
                            return 0;
                        }
                    });

                    resolve(response);
                })
                .catch( response => Api.rejectHandler(response, reject) );
        });

        return promise
    }

    static removeContact (id) {
        let constructed_url = Url.get('remove_contact') + id + Url.getAccountParam();
        Vue.http.post(constructed_url);
    }

    static fetchImage (image_id) {
        const constructed_url = Url.get('media') + image_id + Url.getAccountParam();
        const promise = new Promise((resolve, reject) => {
            Vue.http.get(constructed_url)
                .then( response => resolve(response) )
                .catch( response => Api.rejectHandler(response, reject) );
        });

        return promise
    }

    static generateId () {
        let min = 1;
        let max = 922337203685477;

        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static rejectHandler(e, callback=null) {
        if (e.status == 401)
            return store.state.msgbus.$emit('logout-btn');

        if (callback)
            return callback(e);
    }
}
