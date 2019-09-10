import { sjcl } from '@/lib/sjcl-worker.js'
import { hmacSHA1 } from '@/lib/hmacsha1-worker.js'

onmessage = function(message) {

    console.log("decrypting media");
    sjcl.beware["CBC mode is dangerous because it doesn't protect message integrity."]();

    const imageData = message.data.imageData;
    const accountId = message.data.accountId;
    const hash = message.data.hash;
    const salt = message.data.salt;

    const combinedKey = accountId + ":" + hash + "\n"
    const key = sjcl.misc.pbkdf2(combinedKey, salt, 10000, 256, hmacSHA1)

    const aes = new sjcl.cipher.aes(key);

    const parts = imageData.split("-:-");
    const decryptedData = sjcl.codec.base64.fromBits(
        sjcl.mode.cbc.decrypt(aes, sjcl.codec.base64.toBits(parts[1]),
            sjcl.codec.base64.toBits(parts[0]), null));

    self.postMessage({
        "command":"done",
        "image": decryptedData
    });
}
