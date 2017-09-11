import Vue from 'vue'
import store from '@/store/'
import Util from '@/utils/util.js'
import Url from '@/utils/url.js'
import Crypto from '@/utils/crypto.js'

export default class MessageManager {

    constructor () {
        this.openWebSocket();
    }

    openWebSocket() {
        let socket = new WebSocket( Url.get('websocket') + Url.getAccountParam());

        socket.onopen = () => {
            let subscribe = JSON.stringify({
                "command": "subscribe",
                "identifier": JSON.stringify({
                    "channel": "NotificationsChannel"
                })
            });

            socket.send(subscribe);
        };

        socket.onmessage = (e) => this.handleMessage(e);

        socket.onclose = () => {
            setTimeout(this.openWebSocket, 50);
        };
    }

    handleMessage (e) {
        

        if (e.data.indexOf("ping") != -1)  // Is keep alive event
            return;

        let json = JSON.parse(e.data);

        if (typeof json.message == "undefined") 
            return;
        
        if (json.message.operation == "added_message") {
            let message = Crypto.decryptMessage(json.message.content)

            store.state.msgbus.$emit('newMessage', message);
        } else if (json.message.operation == "read_conversation") {
            store.state.msgbus.$emit('conversationRead', json.message.content.id);
        }

    }

    static sendMessage (data, mime_type, thread_id) {

        let account_id = store.state.account_id;

        let id = MessageManager.generateId();

        if (mime_type == "text/plain") 
            data =  Util.entityEncode(data)

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

    static generateId () {
        let min = 1;
        let max = 922337203685477;

        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
