import { sjcl } from '@/lib/sjcl-worker.js';
// import { hmacSHA1 } from '@/lib/hmacsha1-worker.js';


export default function decryptImage(key, imageData) {


    console.log("decrypting media");
    sjcl.beware["CBC mode is dangerous because it doesn't protect message integrity."]();

    // Create aes cipher from key
    const aes = new sjcl.cipher.aes(key);

    // Decrypt Image
    const parts = imageData.split("-:-");
    const decryptedImage = sjcl.codec.base64.fromBits(
        sjcl.mode.cbc.decrypt(aes, sjcl.codec.base64.toBits(parts[1]),
            sjcl.codec.base64.toBits(parts[0]), null));

    return decryptedImage;
}
