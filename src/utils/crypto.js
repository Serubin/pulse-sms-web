import { sjcl } from '@/lib/sjcl.js';
import { hmacSHA1 } from '@/lib/hmacsha1.js';

import Hash from 'object-hash';
import store from '@/store';
import joypixels from 'emoji-toolkit';
import { Util } from '@/utils';

export default class Crypto {
    /**
     * setupAes
     *
     * Sets up AES key and starts sjcl
     */
    static setupAes() {
        // Setup key
        const combinedKey = store.state.account_id + ":" + store.state.hash + "\n";
        const key = sjcl.misc.pbkdf2(combinedKey, store.state.salt, 10000, 256, hmacSHA1);

        store.commit('aes', new sjcl.cipher.aes(key)); // Store aes
        sjcl.beware["CBC mode is dangerous because it doesn't protect message integrity."]();
    }

    /**
     * decryptConversation
     *
     * Decryptes conversation object
     * @param convo - conversation object
     * @return decrypted conversation
     */
    static decryptConversation (convo) {
        // Removes miliiseconds from timestamp
        convo.timestamp = convo.timestamp / 1000 >> 0; // Remove ms
        convo.timestamp = convo.timestamp * 1000; // Add back zero timestamp

        // Handle title and snippet
        try {
            convo.titleNoEmoji = Crypto.decrypt(convo.title);
            convo.title = convo.titleNoEmoji;
            // convo.title = joypixels.toImage(convo.titleNoEmoji);

            convo.snippetNoEmoji = Crypto.decrypt(convo.snippet).replace(/\n/g, " ");
            convo.snippetNoEmoji = convo.snippetNoEmoji.replace("<i>", "").replace("</i>", "");
            convo.snippet = joypixels.toImage(Util.entityEncode(convo.snippetNoEmoji));
        } catch (err) {
            return null;
        }

        // Handle phone number(s) if applicable
        try {
            convo.phone_numbers = Crypto.decrypt(convo.phone_numbers);
        } catch (err) {
            convo.phone_numbers = "";
        }

        convo.color = Util.expandColor(convo.color);
        convo.hash = Hash(convo);

        return convo;
    }

    /**
     * decryptMessage
     *
     * Decryptes message object
     * @param convo - message object
     * @return decrypted message
     */
    static decryptMessage (message) {
        // Removes milliseconds from timestamp
        message.timestamp = message.timestamp / 1000 >> 0; // Remove ms
        message.timestamp = message.timestamp * 1000; // Add back zero timestamp

        // Decrypt
        try {
            message.mime_type = Crypto.decrypt(message.mime_type);

            message.dataNoEmoji = Crypto.decrypt(message.data);

            if (message.mime_type.indexOf("media") > -1) {
                message.data = Util.entityEncode(message.dataNoEmoji);
            } else {
                message.data = joypixels.toImage(Util.entityEncode(message.dataNoEmoji));
            }

            message.message_from = Crypto.decrypt(message.message_from);
        } catch (err) {
            return null;
        }

        if (typeof message.device_id == "undefined") // Correct for "id"
            message.device_id = message.id;

        if (typeof message.message_type == "undefined")
            message.message_type = message.type;

        return message;
    }

    /**
     * decryptContact
     *
     * Decryptes contact object
     * @param contact - contact object
     * @return decrypted contact or null
     */
    static decryptContact (contact) {
        try {
            contact.name = Crypto.decrypt(contact.name);
            contact.phone_number = Crypto.decrypt(contact.phone_number);
            contact.id_matcher = Crypto.decrypt(contact.id_matcher);
            contact.color = Util.expandColor(contact.color);
            contact.color_accent = Util.expandColor(contact.color_accent);
        } catch (err) {
            return null;
        }

        return contact;
    }

    /**
     * decryptBlacklist
     *
     * Decryptes blacklist object
     * @param blacklist - blacklist object
     * @return decrypted blacklist or null
     */
    static decryptBlacklist (blacklist) {
        try {
            // phrase and phone number are optional, since it could be either/or.
            if (blacklist.phone_number) {
                blacklist.phone_number = Crypto.decrypt(blacklist.phone_number);
            }

            if (blacklist.phrase) {
                blacklist.phrase = Crypto.decrypt(blacklist.phrase);
            }
        } catch (err) {
            return null;
        }

        return blacklist;
    }

    /**
     * decryptFolder
     *
     * Decryptes folder object
     * @param folder - folder object
     * @return decrypted folder or null
     */
    static decryptFolder (folder) {
        try {
            folder.name = Crypto.decrypt(folder.name);
        } catch (err) {
            return null;
        }

        return folder;
    }

    /**
     * decryptScheduledMessage
     *
     * Decryptes scheduled message object
     * @param message - scheduled message object
     * @return decrypted scheduled message or null
     */
    static decryptScheduledMessage (message) {
        try {
            message.title = Crypto.decrypt(message.title);
            message.to = Crypto.decrypt(message.to);
            message.data = Crypto.decrypt(message.data);
            message.mime_type = Crypto.decrypt(message.mime_type);
        } catch (err) {
            return null;
        }

        return message;
    }

    /**
     * decryptDraft
     *
     * Decrypts draft object
     * @param draft - draft object
     * @return decrypted draft or null
     */
    static decryptDraft (draft) {
        try {
            draft.mime_type = Crypto.decrypt(draft.mime_type);
            draft.data = Crypto.decrypt(draft.data);
        } catch (err) {
            return null;
        }

        return draft;
    }

    /**
     * decryptTemplate
     *
     * Decryptes template object
     * @param template - template object
     * @return decrypted template or null
     */
    static decryptTemplate (template) {
        try {
            template.text = Crypto.decrypt(template.text);
        } catch (err) {
            return null;
        }

        return template;
    }

    /**
     * decryptAutoReply
     *
     * Decrypts auto reply object
     * @param reply - auto reply object
     * @return decrypted reply or null
     */
    static decryptAutoReply (reply) {
        try {
            reply.response = Crypto.decrypt(reply.response);
        } catch (err) {
            return null;
        }

        return reply;
    }

    /**
     * decrypt
     *
     * Decrypts encoded and encrypted string using stored aes
     *
     * @param data - string
     * @return decrypted string
     */
    static decrypt (data) {

        if (data == null)
            return "";

        const parts = data.split("-:-");
        return sjcl.codec.utf8String.fromBits(
            sjcl.mode.cbc.decrypt(store.state.aes, sjcl.codec.base64.toBits(parts[1]),
                sjcl.codec.base64.toBits(parts[0]), null)
        );
    }

    static decryptToBase64(data) {
        if (data == null) {
            return "";
        }

        const parts = data.split("-:-");
        return sjcl.codec.base64.fromBits(
            sjcl.mode.cbc.decrypt(store.state.aes, sjcl.codec.base64.toBits(parts[1]),
                sjcl.codec.base64.toBits(parts[0]), null));
    }
    /**
     * encrypt
     * Encrypts arbitrary string data using stored aes
     *
     * @param data - arbitrary string
     * @return encrypted data
     */
    static encrypt (data) {
        const iv = sjcl.codec.hex.toBits(Crypto.random128Hex());
        const cipherbits = sjcl.mode.cbc.encrypt(
            store.state.aes, sjcl.codec.utf8String.toBits(data), iv, null
        );
        return sjcl.codec.base64.fromBits(iv) + "-:-" + sjcl.codec.base64.fromBits(cipherbits);
    }

    /**
     * encryptData
     * Encrypts arbitrary data using stored aes
     *
     * @param data - arbitrary data
     * @return encrypted data
     */
    static encryptData (data) {
        const iv = sjcl.codec.hex.toBits(Crypto.random128Hex());
        const bits = Crypto.toBitArrayCodec(data);
        const cipherbits = sjcl.mode.cbc.encrypt(store.state.aes, bits, iv, null);
        return sjcl.codec.base64.fromBits(iv) + "-:-" + sjcl.codec.base64.fromBits(cipherbits);
    }

    static toBitArrayCodec(bytes) {
        let out = [], i, tmp=0;
        for (i=0; i<bytes.length; i++) {
            tmp = tmp << 8 | bytes[i];
            if ((i&3) === 3) {
                out.push(tmp);
                tmp = 0;
            }
        }

        if (i&3) {
            out.push(sjcl.bitArray.partial(8*(i&3), tmp));
        }

        return out;
    }

    static random128Hex() {
        function random16Hex () {
            return (0x10000 | Math.random() * 0x10000).toString(16).substr(1);
        }
        return random16Hex() + random16Hex() + random16Hex() + random16Hex() +
            random16Hex() + random16Hex() + random16Hex() + random16Hex();
    }
}
