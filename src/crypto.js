import '@/lib/sjcl.js'
import '@/lib/hmacsha1.js'
import store from '@/store'

import Util from '@/utils/util.js'

export default class Crypto {

    static setupAes() {
        // Setup key
        var combinedKey = store.state.account_id + ":" + store.state.hash + "\n"
        var key = sjcl.misc.pbkdf2(combinedKey, store.state.salt, 10000, 256, hmacSHA1)

        store.dispatch('aes', new sjcl.cipher.aes(key)); // Store aes
        sjcl.beware["CBC mode is dangerous because it doesn't protect message integrity."]();
    }

    //TODO make - not static?
    static decryptConversation (convo) {
        // Removes miliiseconds from timestamp
        convo.timestamp = convo.timestamp / 1000 >> 0; // Remove ms
        convo.timestamp = convo.timestamp * 1000; // Add back zero timestamp

        try {
            convo.title = Crypto.decrypt(convo.title);

            convo.snippet = Crypto.decrypt(convo.snippet)
            convo.snippet = Util.entityEncode(convo.snippet)
        } catch (err) {
            return null
        }

        try {
            convo.phone_numbers = Crypto.decrypt(convo.phone_numbers);
        } catch (err) {
            convo.phone_numbers = "";
        }

        return convo;
    }

    static decryptMessage (message) {
        // Removes miliiseconds from timestamp
        message.timestamp = message.timestamp / 1000 >> 0; // Remove ms
        message.timestamp = message.timestamp * 1000; // Add back zero timestamp

        // Decrypt
        try {
            message.mime_type = decrypt(message.mime_type);

            message.data = decrypt(message.data)
            message.data = entityEncode(message.data); // encode message

            message.message_from = decrypt(message.message_from);
        } catch (err) {
            return null
        }

        return message;
    }
    static decrypt (data) {

        if (data == null) 
            return "";

        var parts = data.split("-:-");
        return sjcl.codec.utf8String.fromBits(
            sjcl.mode.cbc.decrypt(store.state.aes, sjcl.codec.base64.toBits(parts[1]),
            sjcl.codec.base64.toBits(parts[0]), null));
    }

    static encrypt (data) {
        var iv = sjcl.codec.hex.toBits(random128Hex());
        var cipherbits = sjcl.mode.cbc.encrypt(
            store.state.aes, sjcl.codec.utf8String.toBits(data), iv, null
        );
        return sjcl.codec.base64.fromBits(iv) + "-:-" + sjcl.codec.base64.fromBits(cipherbits);
    }

    static encryptData (data) {
        var iv = sjcl.codec.hex.toBits(random128Hex());
        var bits = toBitArrayCodec(data);
        var cipherbits = sjcl.mode.cbc.encrypt(store.state.aes, bits, iv, null);
        return sjcl.codec.base64.fromBits(iv) + "-:-" + sjcl.codec.base64.fromBits(cipherbits);
    }
}
