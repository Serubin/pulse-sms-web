import store from '@/store';

export default class SessionCache {

    static getAllConversations () {
        return store.state.session_conversations;
    }

    static getConversations (index = 'index_public_unarchived') {
        return SessionCache.getAllConversations()[index];
    }

    static getConversation (conversation_id) {
        let conversations = SessionCache.getConversations('index_public_unarchived');
        if (conversations != null) {
            for (let i = 0; i < conversations.length; i++) {
                if (conversations[i].device_id == conversation_id) {
                    return conversations[i];
                }
            }
        }

        conversations = SessionCache.getConversations('index_archived');
        if (conversations != null) {
            for (let i = 0; i < conversations.length; i++) {
                if (conversations[i].device_id == conversation_id) {
                    return conversations[i];
                }
            }
        }

        conversations = SessionCache.getConversations('index_private');
        if (conversations != null) {
            for (let i = 0; i < conversations.length; i++) {
                if (conversations[i].device_id == conversation_id) {
                    return conversations[i];
                }
            }
        }

        return null;
    }

    static getAllMessages () {
        return store.state.session_messages;
    }

    static getMessages (conversation_id) {
        return SessionCache.getAllMessages()[conversation_id];
    }

    static getContacts () {
        return store.state.compose_contacts;
    }

    static getTemplates () {
        return store.state.templates;
    }    

    static putConversations (conversations, index = 'index_public_unarchived') {
        if (index == "index_public_unread") {
            // We want to just always read these from the backend, when the user goes to this section of the app.
            return;
        }

        let sessionConversations = SessionCache.getAllConversations();
        // Deepy copy conversation to avoid weird side effects
        sessionConversations[index] = JSON.parse(JSON.stringify(conversations));

        store.commit('session_conversations', sessionConversations);
    }

    static putMessages (messages, conversation_id) {
        let sessionMessages = SessionCache.getAllMessages();
        sessionMessages[conversation_id] = JSON.parse(JSON.stringify(messages));

        store.commit('session_messages', sessionMessages);
    }

    static putContacts (contacts) {
        try {
            store.commit('compose_contacts', contacts);
        } catch (err) {
            // Too many contacts:
            // https://app.bugsnag.com/pulsesms/pulse-sms-web/errors/5e656685fbc7df001873d3a4?event_id=5e656685005836c0067a0000&i=sk&m=nw
        }
    }

    static putTemplates (templates) {
        store.commit('templates', templates);
    }

    static hasConversations (index = 'index_public_unarchived') {
        return SessionCache.getConversations(index) != null;
    }

    static hasMessages (conversation_id) {
        let conversation = SessionCache.getConversation(conversation_id);
        let messages = SessionCache.getMessages(conversation_id);

        if (conversation == null || messages == null || messages.length == 0) {
            return false;
        }

        return messages[0].timestamp >= conversation.timestamp - 2000;
    }

    static hasContacts () {
        return SessionCache.getContacts().length > 0;
    }

    static hasTemplates() {
        return (SessionCache.getTemplates()||{}).length > 0;
    }

    static invalidateConversations (index = 'index_public_unarchived') {
        SessionCache.putConversations(null, index);
    }

    static invalidateMessages (conversation_id) {
        SessionCache.putMessages(null, conversation_id);
    }

    static invalidateTemplates() {
        SessionCache.putTemplates(null);
    }

    static invalidateAllConversations() {
        store.commit('session_conversations', { });
    }

    static invalidateAllMessages() {
        store.commit('session_messages', { });
    }

    static invalidateContacts() {
        store.commit('compose_contacts', { });
    }

    static removeConversation (conversation_id, index = 'index_public_unarchived') {
        if (!SessionCache.hasConversations(index)) {
            return;
        }

        let conversations = SessionCache.getConversations(index);
        for (let i = 0; i < conversations.length; i++) {
            if (conversations[i].device_id == conversation_id) {
                conversations.splice(i, 1);
                break;
            }
        }

        SessionCache.putConversations(conversations, index);
    }

    static readConversation (conversation_id, index = 'index_public_unarchived', read = true) {
        if (!SessionCache.hasConversations(index)) {
            return;
        }

        let conversations = SessionCache.getConversations(index);
        for (let i = 0; i < conversations.length; i++) {
            if (conversations[i].device_id == conversation_id) {
                conversations[i].read = read;
                break;
            }
        }

        SessionCache.putConversations(conversations, index);
    }

    static updateConversationSnippet (conversation_id, snippet, index = 'index_public_unarchived') {
        if (!SessionCache.hasConversations(index)) {
            return;
        }

        let conversations = SessionCache.getConversations(index);
        for (let i = 0; i < conversations.length; i++) {
            if (conversations[i].device_id == conversation_id) {
                conversations[i].snippet = snippet;
                break;
            }
        }

        SessionCache.putConversations(conversations, index);
    }

    static updateConversationTitle (conversation_id, title, index = 'index_public_unarchived') {
        if (!SessionCache.hasConversations(index)) {
            return;
        }

        let conversations = SessionCache.getConversations(index);
        for (let i = 0; i < conversations.length; i++) {
            if (conversations[i].device_id == conversation_id) {
                conversations[i].title = title;
                break;
            }
        }

        SessionCache.putConversations(conversations, index);
    }

    static cacheMessage (message) {
        if (!SessionCache.hasMessages(message.conversation_id)) {
            return;
        }

        let messages = SessionCache.getMessages(message.conversation_id);
        messages.unshift(message);

        SessionCache.putMessages(messages, message.conversation_id);
    }

    static deleteMessage (message_id) {
        let messages = SessionCache.getAllMessages();
        if (messages == null) {
            return;
        }

        for (var conversation_id in messages) {
            if (messages.hasOwnProperty(conversation_id)) {
                for (let i = 0; i < messages[conversation_id].length; i++) {
                    if (messages[conversation_id][i].device_id == message_id) {
                        messages[conversation_id].splice(i, 1);
                        break;
                    }
                }
            }
        }

        store.commit('session_messages', messages);
    }

    static updateMessageType (message_id, new_type) {
        let messages = SessionCache.getAllMessages();
        if (messages == null) {
            return;
        }

        for (var conversation_id in messages) {
            if (messages.hasOwnProperty(conversation_id)) {
                for (let i = 0; i < messages[conversation_id].length; i++) {
                    if (messages[conversation_id][i].device_id == message_id) {
                        messages[conversation_id][i].message_type = new_type;
                        break;
                    }
                }
            }
        }

        store.commit('session_messages', messages);
    }

    static updateConversation (message) {
        let conversations = SessionCache.getConversations('index_public_unarchived');
        if (conversations != null) {
            for (let i = 0; i < conversations.length; i++) {
                if (conversations[i].device_id == message.conversation_id) {
                    conversations[i].read = message.read;
                    conversations[i].timestamp = message.timestamp;
                    conversations[i].snippet = message.mime_type.indexOf("text") > -1 ? message.data : "";
                    this.putConversations(this.resortConversations(conversations), 'index_public_unarchived');
                    return;
                }
            }
        }

        conversations = SessionCache.getConversations('index_archived');
        if (conversations != null) {
            for (let i = 0; i < conversations.length; i++) {
                if (conversations[i].device_id == message.conversation_id) {
                    conversations[i].read = message.read;
                    conversations[i].timestamp = message.timestamp;
                    conversations[i].snippet = message.mime_type.indexOf("text") > -1 ? message.data : "";
                    this.putConversations(this.resortConversations(conversations), 'index_archived');
                    return;
                }
            }
        }

        conversations = SessionCache.getConversations('index_private');
        if (conversations != null) {
            for (let i = 0; i < conversations.length; i++) {
                if (conversations[i].device_id == message.conversation_id) {
                    conversations[i].read = message.read;
                    conversations[i].timestamp = message.timestamp;
                    conversations[i].snippet = message.mime_type.indexOf("text") > -1 ? message.data : "";
                    this.putConversations(this.resortConversations(conversations), 'index_private');
                    return;
                }
            }
        }
    }

    static resortConversations(convos) {
        var pinned = [];
        var normal = [];

        for (let i = 0; i < convos.length; i++) {
            if (convos[i].pinned) {
                pinned.push(convos[i]);
            } else {
                normal.push(convos[i]);
            }
        }

        pinned.sort(compare);
        normal.sort(compare);

        for (let i = 0; i < normal.length; i++) {
            pinned.push(normal[i]);
        }

        return pinned;

        function compare(a, b) {
            if (a.timestamp > b.timestamp) {
                return -1;
            }

            if (a.timestamp < b.timestamp) {
                return 1;
            }

            return 0;
        }
    }
}
