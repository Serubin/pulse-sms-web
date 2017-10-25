import Vue from 'vue'
import store from '@/store/'
import emojione from 'emojione'
import ReconnectingWebsocket from 'reconnecting-websocket'

import { Util, Url, Crypto } from '@/utils/'

//TODO This should be API manager or something.
export default class MessageManager {

    constructor () {
        this.socket = null;
        this.openWebSocket();
        
        this.has_disconnected = false;
    }

    openWebSocket() {

        let this_ = this;


        this.socket = new ReconnectingWebsocket(Url.get('websocket') + Url.getAccountParam());

        this.socket.addEventListener('open', () => {
            
            if (this.has_disconnected) {
                store.state.msgbus.$emit('refresh-btn');
                Util.snackbar("And we're back!");
            }

            this.has_disconnected = false;

            let subscribe = JSON.stringify({
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

    closeWebSocket() {
        this.socket.close(1000, '', {keepClosed: true});

    }

    handleMessage (e) {
        

        if (e.data.indexOf("ping") != -1)  // Is keep alive event
            return;

        let json = JSON.parse(e.data);

        if (typeof json.message == "undefined") 
            return;

        if (typeof json.message.content.data != "undefined")
            json.message.content.data = emojione.unicodeToImage(
                    json.message.content.data
                );
        
        if (json.message.operation == "added_message") {
            let message = Crypto.decryptMessage(json.message.content)

            store.state.msgbus.$emit('newMessage', message);
        } else if (json.message.operation == "read_conversation") {
            store.state.msgbus.$emit('conversationRead', json.message.content.id);
        }

    }
    
    static fetchSettings () {
        let constructed_url = Url.get('settings') + Url.getAccountParam();
        const promise = new Promise((resolve, reject) => {
            Vue.http.get( constructed_url )
                .then( response => {
                    MessageManager.processSettings(response);
                    resolve(response);

                })
                .catch( response => MessageManager.rejectHandler(response, reject) );
        });

        return promise
    }
    static processSettings (response) {
        response = response.data

        store.commit('theme_base', response.base_theme);
        store.commit('theme_round', response.rounder_bubbles);
        store.commit('theme_global_colors', {
            default: Util.expandColor(response.color),
            dark: Util.expandColor(response.color_dark),
            accent: Util.expandColor(response.color_accent),
        });
        store.commit('theme_use_global', response.use_global_theme);
    }

    static fetchConversations (index) {
        const constructed_url = 
            Url.get('conversations') + index + Url.getAccountParam()

        const promise = new Promise((resolve, reject) => {
            Vue.http.get( constructed_url )
                .then(response => {
                    response = response.data
                    // Decrypt Conversations items
                    for(var i = 0; i < response.length; i++)
                        response[i] = Crypto.decryptConversation(response[i]);

                    resolve(response); // Resolve response
                })
                .catch( response => MessageManager.rejectHandler(response, reject) );
        });

        return promise
    }

    static fetchThread (conversation_id) {

        const limit = 70;

        const constructed_url = 
            Url.get('messages') + Url.getAccountParam() 
                + "&conversation_id=" + conversation_id + "&limit=" + limit + "&web=true";

        const promise = new Promise((resolve, reject) => {
            Vue.http.get( constructed_url )
                .then(response => { 
                    response = response.data
                    // Decrypt Conversations items
                    for(var i = 0; i < response.length; i++)
                        response[i] = Crypto.decryptMessage(response[i]);

                    resolve(response); // Resolve response
                })
                .catch( response => MessageManager.rejectHandler(response, reject) );
        });

        return promise
    }

    static sendMessage (data, mime_type, thread_id) {

        let account_id = store.state.account_id;

        let id = MessageManager.generateId();

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

    static markAsRead (thread_id) {
        
        // Read conversation
        let constructed_url = Url.get('read') + thread_id + Url.getAccountParam();
        Vue.http.post(constructed_url)
            .catch((e) => MessageManager.rejectHandler(e));

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
