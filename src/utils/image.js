// IndexedDB
const indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB 
        || window.OIndexedDB || window.msIndexedDB
const DBTransaction = window.IDBTransaction || window.webkitIDBTransaction 
    || window.OIDBTransaction || window.msIDBTransaction
const dbVersion = 1.0;

class MediaLoader {

    constructor () {
        this.id = null;
        this.mime = null;
        this.db = null;

        this.transaction = this.getTransaction();
        this.db_req = indexedDB.open("imageFiles", dbVersion);

        this.db_req.onerror = (event) => {
            console.log("Error creating/accessing IndexedDB database");
        }

        db_req.onsuccess = (event) => {
            this.db = db_req.result;

            this.db.onerror = (event) => {
                console.log("Error creating/accessing IndexedDB database");
            };
        };
    }
    
    getMedia(id, mime, html=true) {
        
        return new Promise((resolve, reject) => {
            getMediaFromServer(id, mime)
                .then(response => {

                    if (html)
                        resolve(this.getHtml(response, mime));
                    else
                        resolve(media_blob);

                })
                .catch(response => reject(response)); 
        });
    }

    getMediaFromStore () {
        return new Promise((resolve, reject) => {
            // Retrieve the file that was just stored
            const req = this.transaction.objectStore("images").get(deviceId);
            req.onsuccess = (event) => {
                // Get media from event
                const media_blob = event.target.result;

                if (media_blob == null)  // If null, get from server
                    this.getMediaFromServer()
                        .then(response => resolve(response))
                        .catch(response => reject(response));
                else
                    resolve(media_blob); // Return media
            }
        })
    }

    getMediaFromServer () {
        return new Promise((resolve, reject) => {
            Api.fetchImage(this.id)
                .then(data => {
                    
                    if (data == "" || data == null)
                        reject(null);

                    // Decrypt blob
                    data = Crypto.decryptToBase64(data);

                    // Store blob
                    this.storeImage(data); 

                    // Send back blog
                    resolve(data); 
                });
            });
    }

    storeMedia (media_blob) {

        // Put the blob into the dabase
        this.transaction.objectStore("media").put(media_blob, this.media_id);
    }

    getTransaction () {
        // Open a transaction to the database
        const readWriteMode = typeof IDBTransaction.READ_WRITE == "undefined" ? "readwrite" : IDBTransaction.READ_WRITE;
        return db.transaction(["media"], readWriteMode);
    }

    getHtml(media_blob, mime) {
        const data_prefix = "data:" + mime + ";base64,";
        let html = "";

        switch (mime.split("/")[0]) {
            case "image":
                html = "<img class=\"media\" src=\"" + data_prefix + media_blob + "\"/>
                break;
            case "audio":
                html = "<audio controls class=\"media\" src=\"" + data_prefix + media_blob + "\" />";
                break;
            case "video":
                html = "<video controls class=\"media\" src=\"" + data_prefix + media_blob + "\"/>";
                break;
            default:
                return "<i>Media not supported</i>";
                break;
        }

        return "<a onclick=\"window.open(document.URL, '_blank');\" title=\"Media\">"
             + html
             + "</a>"

    }
}

