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
    
    getMedia(id, mime) {
        this.id = id;
        this.mime = mime;

        getMediaFromServer(); //TODO create a return scheme
    }

    getMediaFromStore () {
        var transaction = this.getTransaction();

        // Retrieve the file that was just stored
        var req = transaction.objectStore("images").get(deviceId);
        req.onsuccess = function(event)  {
            //TODO craete this logic
            var imgFile = event.target.result;

            if (imgFile == null) 
                getImageFile();
            else 
                test()
        }
    }

    getMediaFromServer () {
        return new Promise((resolve, reject) => {
            Api.fetchImage(this.id)
                .then(data => {
                    // Decrypt blob
                    data = Crypto.decryptToBase64(data);
                    // Send back blog
                    resolve(data); 
                    // Store blob
                    this.storeImage(data); 
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

