import Vue from 'vue'
import router from '@/router/'
import store from '@/store/'
import emojione from 'emojione'
import * as firebase from 'firebase';
import ImageCompressor from '@xkeshi/image-compressor';
import ReconnectingWebsocket from 'reconnecting-websocket'

import { Util, Url, Crypto } from '@/utils/'

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
        this.socket.close(1000, '', {keepClosed: true});
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
            this.cacheMessage(message);
            store.state.msgbus.$emit('newMessage', message);
        } else if (operation == "read_conversation") {
            const id = json.message.content.id;

            this.readConversation('index_unarchived');
            this.readConversation('index_archived');
            store.state.msgbus.$emit('conversationRead', id);
        } else if (operation == "update_message_type") {
            const id = json.message.content.id;
            const message_type = json.message.content.message_type;

            this.updateMessageType(id, message_type);
            store.state.msgbus.$emit('updateMessageType', { id, message_type });
        } else if (operation == "added_conversation") {
            const id = json.message.content.id;

            Api.conversations['index_unarchived'] = null;
            store.state.msgbus.$emit('addedConversation', { id });
        } else if (operation == "removed_conversation") {
            const id = json.message.content.id;

            this.removeConversation(id, 'index_unarchived');
            store.state.msgbus.$emit('removedConversation', { id });
        } else if (operation == "archive_conversation") {
            const id = json.message.content.id;

            if (json.message.content.archive) {
                this.removeConversation(id, 'index_unarchived');
                Api.conversations['index_archived'] = null;
            } else {
                this.removeConversation(id, 'index_archived');
                Api.conversations['index_unarchived'] = null;
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

        const contact = store.getters.getContact(message.conversation_id);

        if (contact != null && contact.mute)
            return;

        const title = contact.title;
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

    /**
     * Removes the cached conversation.
     * @param conversation_id - conversation to remove.
     * @param index - the index of the cached conversation list. Usually 'index_unarchived' or 'index_archived'.
     */
    removeConversation (conversation_id, index = 'index_unarchived') {
        if (Api.conversations[index] == null) {
            return;
        }

        for (var i = 0; i < Api.conversations[index].length; i++) {
            if (Api.conversations[index] != null && Api.conversations[index][i].device_id == conversation_id) {
                Api.conversations[index].splice(i, 1);
                return;
            }
        }
    }

    /**
     * Mark the conversation as read.
     * @param conversation_id - the conversation to mark read.
     * @param index - the index of the cached conversation list. Usually 'index_unarchived' or 'index_archived'.
     */
    readConversation (conversation_id, index = 'index_unarchived') {
        if (Api.conversations[index] == null) {
            return;
        }

        for (var i = 0; i < Api.conversations[index].length; i++) {
            if (Api.conversations[index] != null && Api.conversations[index][i].device_id == conversation_id) {
                Api.conversations[index][i].read = true;
                return;
            }
        }
    }

    /**
     * Add a new message to the cached data.
     * @param message - the message to add.
     */
    cacheMessage (message) {
        if (Api.messages == null || Api.messages[message.conversation_id] == null) {
            return;
        }

        Api.messages[message.conversation_id].unshift(message)
    }

    /**
     * Add a new message to the cached data.
     * @param message - the message to add.
     */
    updateMessageType (message_id, new_type) {
        if (Api.messages == null) {
            return;
        }

        for (var conversation_id in Api.messages) {
            if (Api.messages.hasOwnProperty(conversation_id)) {
                for (var i = 0; i < Api.messages[conversation_id].length; i++) {
                    if (Api.messages[conversation_id] != null && Api.messages[conversation_id][i].device_id == message_id) {
                        Api.messages[conversation_id][i].message_type = new_type;
                        return;
                    }
                }
            }
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

    static fetchConversations (index) {
        if (Api.conversations == null) {
            Api.conversations = { };
        }

        const constructed_url =
            Url.get('conversations') + index + Url.getAccountParam()

        const promise = new Promise((resolve, reject) => {
            if (Api.conversations[index] == null) {
                Vue.http.get( constructed_url )
                    .then(response => {
                        response = response.data
                        // Decrypt Conversations items
                        for(let i = 0; i < response.length; i++)
                            response[i] = Crypto.decryptConversation(response[i]);

                        Api.conversations[index] = response;
                        resolve(response); // Resolve response
                    })
                    .catch( response => Api.rejectHandler(response, reject) );
            } else {
                resolve(Api.conversations[index]);
            }
        });

        return promise
    }

    static fetchThread (conversation_id, offset = 0) {
        if (Api.messages == null) {
            Api.messages = { };
        }

        const limit = 70;

        const constructed_url =
            Url.get('messages') + Url.getAccountParam()
                + "&conversation_id=" + conversation_id + "&limit=" + limit
                + "&web=true&offset=" + offset;

        const promise = new Promise((resolve, reject) => {
            if (Api.messages[conversation_id] == null) {
                Vue.http.get( constructed_url )
                    .then(response => {
                        response = response.data
                        // Decrypt Conversations items
                        for(let i = 0; i < response.length; i++)
                            response[i] = Crypto.decryptMessage(response[i]);

                        Api.messages[conversation_id] = response;
                        resolve(response); // Resolve response
                    })
                    .catch( response => Api.rejectHandler(response, reject) );
            } else {
                resolve(Api.messages[conversation_id]);
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

        let snippet = mime_type == "text/plain" ? ("You: " + data) : "<i>Photo</i>";

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
            data: data,
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
        Vue.nextTick(() =>Util.scrollToBottom(250))

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

        store.commit('theme_base', response.base_theme);
        store.commit('theme_round', response.rounder_bubbles);
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
                .then( response => resolve(response) )
                .catch( response => Api.rejectHandler(resposne, reject) );
        });

        return promise
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
