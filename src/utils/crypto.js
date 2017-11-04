import '@/lib/sjcl.js'
import '@/lib/hmacsha1.js'

import Hash from 'object-hash'
import store from '@/store'
import { Util } from '@/utils'

export default class Crypto {
    /**
     * setupAes
     *
     * Sets up AES key and starts sjcl
     */
    static setupAes() {
        // Setup key
        var combinedKey = store.state.account_id + ":" + store.state.hash + "\n"
        var key = sjcl.misc.pbkdf2(combinedKey, store.state.salt, 10000, 256, hmacSHA1)

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
            convo.title = Crypto.decrypt(convo.title);

            convo.snippet = Crypto.decrypt(convo.snippet);
            convo.snippet = convo.snippet;
        } catch (err) {
            return null
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
        // Removes miliiseconds from timestamp
        message.timestamp = message.timestamp / 1000 >> 0; // Remove ms
        message.timestamp = message.timestamp * 1000; // Add back zero timestamp

        // Decrypt
        try {
            message.mime_type = Crypto.decrypt(message.mime_type);

            message.data = Crypto.decrypt(message.data)

            message.message_from = Crypto.decrypt(message.message_from);
        } catch (err) {
            return null
        }

        if (typeof message.device_id == "undefined") // Correct for "id"
            message.device_id = message.id;
        
        if (typeof message.message_type == "undefined")
            message.message_type = message.type;

        return message;
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

        var parts = data.split("-:-");
        return sjcl.codec.utf8String.fromBits(
            sjcl.mode.cbc.decrypt(store.state.aes, sjcl.codec.base64.toBits(parts[1]),
            sjcl.codec.base64.toBits(parts[0]), null)
        );
    }

    static decryptToBase64(data) {
        if (data == null) {
            return "";
        }

        var parts = data.split("-:-");
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
        var iv = sjcl.codec.hex.toBits(Crypto.random128Hex());
        var cipherbits = sjcl.mode.cbc.encrypt(
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
        var iv = sjcl.codec.hex.toBits(Crypto.random128Hex());
        var bits = toBitArrayCodec(data);
        var cipherbits = sjcl.mode.cbc.encrypt(store.state.aes, bits, iv, null);
        return sjcl.codec.base64.fromBits(iv) + "-:-" + sjcl.codec.base64.fromBits(cipherbits);
    }


    static random128Hex() {
        function random16Hex () {
            return (0x10000 | Math.random() * 0x10000).toString(16).substr(1); 
        }
        return random16Hex() + random16Hex() + random16Hex() + random16Hex() +
            random16Hex() + random16Hex() + random16Hex() + random16Hex();
    }
}

