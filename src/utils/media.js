import { Api, Crypto } from '@/utils'

// IndexedDB
const indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB 
        || window.OIndexedDB || window.msIndexedDB
const DBTransaction = window.IDBTransaction || window.webkitIDBTransaction 
    || window.OIDBTransaction || window.msIDBTransaction
const dbVersion = 1.0;

const dbName = "mediaFiles";
const storeName = "media";

export default class MediaLoader {
    /**
     * MediaLoader - gets media from server or local store.
     * Sets up indexedDB and object store
     *
     * NOTE: This entire class was written on various pre/post-operative drugs
     * around the time of my lumbar discectomy surgery. And it works.
     */
    constructor () {
        this.db = null;

        this.db_req = indexedDB.open(dbName, dbVersion);

        this.db_req.onerror = (event) => {
            console.log("Error creating/accessing IndexedDB database");
        }

        this.db_req.onsuccess = (event) => {
            this.db = this.db_req.result;

            this.db.onerror = (event) => {
                console.log("Error creating/accessing IndexedDB database");
            };

            if (this.db.setVersion) {
                if (this.db.version != dbVersion) {
                    var setVersion = this.db.setVersion(dbVersion);
                    setVersion.onsuccess = (event) => {
                        this.createObjectStore(db);
                    };
                } 
            }
        };

        this.db_req.onupgradeneeded = (event) => {
            this.createObjectStore(event.target.result);
        };
    }
    
    /** 
     * getMedia - get's media from server or local store
     *
     * @param id - device id (media id)
     * @param mime - mime type
     * @return Promise
     */
    getMedia(id, mime) {
        
        return new Promise((resolve, reject) => {
            this.getMediaFromStore(id) // Atempt to get media from local store
                .then(response => resolve(response))
                .catch(response => {
                    this.getMediaFromServer(id) // If fail, get from server
                        .then(response => resolve(response))
                        .catch(response => console.log(response))
                }); 
        });
    }

    /**
     * getMediaFromStore - gets media from local indexedDB store.
     *
     * @param id - device id (media id)
     * @return Promise
     */
    getMediaFromStore (id) {
        return new Promise((resolve, reject) => {

            const transaction = this.getTransaction();

            // Retreive file
            const req = transaction.objectStore("images").get(id);
            req.onsuccess = (event) => {
                // Get media from event
                const media_blob = event.target.result;

                if (media_blob != null)  
                    resolve(media_blob); // Return media
                else
                    reject(null); // Return media
            }
        });
    }
    
    /**
     * getMediaFromServer - gets media from remote server
     *
     * @param id - device id (media id)
     * @return Promise
     */
    getMediaFromServer (id) {
        return new Promise((resolve, reject) => {
            Api.fetchImage(id)
                .then(data => {
                    
                    // get data out of json response
                    data = data.data;

                    // Reject empty response
                    if (data == "" || data == null)
                        reject(null);
                    
                    // Decrypt blob
                    data = Crypto.decryptToBase64(data);

                    // Store blob
                    this.storeMedia(id, data); 

                    // Send back blog
                    resolve(data); 
                });
        });
    }

    /**
     * Store media in indexDb
     *
     * @param id - device id
     * @param media_blob - data blob
     */
    storeMedia (id, media_blob) {

        // Put the blob into the dabase
        //
        const transaction = this.getTransaction();
        transaction.objectStore(storeName).put(media_blob, id);
    }

    /**
     * getTransaction - get db transaction for storeObject
     * @return transaction object
     */
    getTransaction () {
        // Open a transaction to the database
        const readWriteMode = typeof IDBTransaction.READ_WRITE == "undefined" ? "readwrite" : IDBTransaction.READ_WRITE;
        return this.db.transaction([storeName], readWriteMode);
    }
    /**
     * createObjectStore - create ObjectStore in indexDb
     */
    createObjectStore (db) {
        db.createObjectStore(storeName);
    }
}

