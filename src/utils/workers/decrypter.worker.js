import decryptImage from './decrypter';

self.onmessage = function(e) {
    self.postMessage({
        "command":"done",
        "image": decryptImage(e.data.key, e.data.imageData)
    });
};

