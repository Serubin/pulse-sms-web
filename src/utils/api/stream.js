import ReconnectingWebsocket from 'reconnecting-websocket';
import joypixels from 'emoji-toolkit';
import router from '@/router/';
import store from '@/store/';
import { Api, Util, Url, Crypto, Notifications, SessionCache, Platform, i18n } from '@/utils';

export default class Stream {
    constructor() {
        this.socket = null;
        this.open();

        this.has_disconnected = false;
        this.disconnected_timeout = null;
    }

    /**
     * Open reconnecting websocket.
     */
    open() {
        this.socket = new ReconnectingWebsocket(Url.get('websocket') + Url.getAccountParam());

        this.socket.addEventListener('open', () => {
            if (this.has_disconnected) {
                store.state.msgbus.$emit('refresh-btn');
                Util.snackbar(i18n.t('api.back'));
            }

            if (this.disconnected_timeout != null) {
                clearTimeout(this.disconnected_timeout);
                this.disconnected_timeout = null;
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
                return;

            // if the websocket reconnects within 5 seconds, we won't show anything to the user
            // if it takes longer than that, then we will notify the user that we are
            // trying to reconnect.
            this.disconnected_timeout = setTimeout(() => {
                if (!this.has_disconnected)
                    Util.snackbar(i18n.t('api.disconnected'));

                this.has_disconnected = true;
            }, 5 * 1000);
        });
    }

    /**
     * Perminently close socket
     */
    close() {
        this.socket.close(1000, '', { keepClosed: true });
    }

    /**
     * Handle incoming socket data
     * @param e - socket event
     */
    handleMessage(e) {
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
            json.message.content.data = joypixels.toImage(
                json.message.content.data
            );


        if (operation == "added_message") {
            let message = json.message.content;
            message.message_from = message.from;
            message = Crypto.decryptMessage(message);

            this.notify(message);

            SessionCache.cacheMessage(message);
            SessionCache.updateConversation(message);

            store.state.msgbus.$emit('newMessage', message);
        } else if (operation == "removed_message") {
            let message = json.message.content;

            SessionCache.deleteMessage(message.id);

            store.state.msgbus.$emit('deletedMessage', message.id);
        } else if (operation == "read_conversation") {
            const id = json.message.content.id;

            SessionCache.readConversation(id, 'index_public_unarchived');
            SessionCache.readConversation(id, 'index_archived');

            store.state.msgbus.$emit('conversationRead', id);
        } else if (operation == "updated_conversation") {
            const message = Crypto.decryptConversation(json.message.content);
            message.conversation_id = message.id; // Normalize ID

            if (message.snippet) {
                SessionCache.updateConversationSnippet(message.id, message.snippet, 'index_public_unarchived');
                SessionCache.updateConversationSnippet(message.id, message.snippet, 'index_archived');
                SessionCache.updateConversationSnippet(message.id, message.snippet, 'index_private');
            }

            SessionCache.readConversation(message.id, 'index_public_unarchived', message.read);
            SessionCache.readConversation(message.id, 'index_archived', message.read);

            store.state.msgbus.$emit('newMessage', message);
        } else if (operation == "update_message_type") {
            const id = json.message.content.id;
            const message_type = json.message.content.message_type;

            SessionCache.updateMessageType(id, message_type);
            store.state.msgbus.$emit('updateMessageType-' + id, { message_type });
        } else if (operation == "added_conversation") {
            const id = json.message.content.id;

            SessionCache.invalidateConversations('index_public_unarchived');
            store.state.msgbus.$emit('addedConversation', { id });
        } else if (operation == "removed_conversation") {
            const id = json.message.content.id;

            SessionCache.removeConversation(id, 'index_public_unarchived');
            SessionCache.removeConversation(id, 'index_archived');
            SessionCache.removeConversation(id, 'index_private');
            store.state.msgbus.$emit('removedConversation', { id });
        } else if (operation == "archive_conversation") {
            const id = json.message.content.id;

            if (json.message.content.archive) {
                SessionCache.removeConversation(id, 'index_public_unarchived');
                SessionCache.invalidateConversations('index_archived');
            } else {
                SessionCache.removeConversation(id, 'index_archived');
                SessionCache.invalidateConversations('index_public_unarchived');
            }

            store.state.msgbus.$emit('removedConversation', { id });
        }
    }

    /**
     * Submit notification for message
     * @param message  - message object
     */
    notify(message) {
        if (Notifications.needsPermission() && !store.state.notifications)
            return;

        if (message.type != 0)
            return;

        if (!Platform.isWebsite()) {
            return;
        }

        // fetch through the API instead of the session cache, since the session
        // cache doesn't know about the mute/private settings
        Api.conversations.getById(message.conversation_id).then(conversation => {
            if (conversation == null || conversation.mute) {
                return;
            }

            const title = conversation.title;
            const snippet = conversation.private_notifications ? "" : Util.generateSnippet(message);

            const link = "/thread/" + message.conversation_id;

            const notification = Notifications.notify(title, {
                icon: require('@/../public/images/android-desktop.png'),
                body: snippet
            });

            notification.onclick = () => {
                window.focus();
                router.push(link).catch(() => {});
            };
        });
    }
}
