import store from '@/store/';

import {
    Account,
    AutoReply,
    Blacklist,
    Contacts,
    Conversations,
    Devices,
    Drafts,
    Folders,
    Messages,
    ScheduledMessages,
    Stream,
    Templates
} from '@/utils/api/';

export default class Api {

    static Stream = Stream

    static account = Account
    static autoReplies = AutoReply
    static blacklist = Blacklist
    static contacts = Contacts
    static conversations = Conversations
    static devices = Devices
    static drafts = Drafts
    static folders = Folders
    static messages = Messages
    static scheduledMessages = ScheduledMessages
    static templates = Templates

    static generateId() {
        let min = 1;
        let max = 922337203685477;

        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static rejectHandler(e, callback = null) {
        if (e.response && e.response.status == 401)
            return store.state.msgbus.$emit('logout-btn');

        if (callback)
            return callback(e);
    }
}
