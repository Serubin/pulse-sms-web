import Vue from 'vue'
import store from '@/store/'

class Messages {
    static sendMessage (data, mime_type, thread_id) {

        let account_id = store.state.account_id;

        let snippet = mime_type == "text/plain" ? ("You: " + data) : "<i>Photo</i>";

        let encrypted = encrypt(data);
        let snippetEncrypted = encrypt(snippet);

        let timestamp = new Date().getTime();

        // Add to page
        add_to_page(id, $message);
        scrollToBottom(250);

        // Define request
        let request = {
            account_id: account_id,
            device_id: id,
            device_conversation_id: thread_id,
            message_type: 2,
            data: encrypted,
            timestamp: timestamp,
            mime_type: encrypt(mime_type),
            read: true,
            seen: true
        };


        let conversationRequest = {
            account_id: account_id,
            read: true,
            timestamp: timestamp,
            snippet: snippetEncrypted
        };

        // TODO convert to querier
        $.post(getBaseUrl() + "/api/v1/messages/add", request, "json")
            .fail(failed);
        $.post(getBaseUrl() + "/api/v1/conversations/update/" + thread_id, conversationRequest, "json");

        let event_object = {
            thread_id: thread_id,
            timestamp: timestamp,
            mime_type: mime_type,
            data: data,
            snippet: snippet
        }

        vue_bus.emit('new-message', event_object);

    }

    static generateId () {
        let min = 1;
        let max = 922337203685477;

        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
