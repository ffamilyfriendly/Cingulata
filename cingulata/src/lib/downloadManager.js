import { client } from "../App"

export function canDownload(bytes) {
    return new Promise((resolve, reject) => {
        if(!("storage" in navigator)) resolve({ enough: true, delta: 1337 })
        navigator.storage.estimate()
            .then(data => {
                const availibe = data.quota - data.usage
                const left = availibe - bytes
                resolve({ enough: availibe > bytes, delta: left })
            })
            .catch(e => reject(e))
    })
}

let db;

/**
 * @description provides a connection to file storage database
 * @returns {Promise<IDBRequest>} database connection
 */
function connect() {
    return new Promise((resolve, reject) => {

        const createObjectStore = (_db) => {
            db = _db
            const transaction = db.createObjectStore("files")
            transaction.oncomplete = () => resolve(db)
        }    

        const request = indexedDB.open("okapi_fs", 5)
        request.onupgradeneeded = (e) => createObjectStore(e.target.result)
        request.onsuccess = (e) => {
            db = request.result
            resolve(db)
        }
        request.onerror = (e) => reject(e)
    })
}

function write(key, value) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(["files"], "readwrite")
        transaction.objectStore("files").put(value,key)

        transaction.oncomplete = (ev) => resolve(ev)
        transaction.onerror = (ev) => reject(ev)
        transaction.onblocked = (ev) => reject(ev)
    })
}

let data = { loaded: 0, total: 0, segment: 0 }

function downloadFile(url, containerName, options) {
    fetch(url, { method: "GET", mode: "cors", headers: { "Range": `bytes=${data.loaded}-${data.loaded + (options.chunkSize * 1000000)}` } })
        .then(response => {
            //if(!data.total) data.total = response.headers.get("Content-Range").split("/")[1]
            data.loaded += Number(response.headers.get("content-length"))
            console.log(response)
            response.blob()
            .then(b => {
                console.log("actually got data lol")
                console.log(b)                
            })
            .catch(err => {
                console.error("blob failed", err)
            })
        })
        .catch(error => {
            console.error("main request failed", error)
        })
}

/**
 * 
 * @param {String|Array} url
 * @param {String} containerName
 * @param {Object} options
 * @param {Function} [options.onProgress] will be called any time a chunk has been downloaded & saved
 * @param {Function} [options.onComplete] will be called when all file(s) have been successfully downloaded
 * @param {Number} [options.chunkSize] the size of the chunks. Default is 100Mib
 */
export function downloadFiles(url, containerName, options) {

    const defaults = {
        chunkSize: 50
    }
    options = Object.assign({}, defaults, options)

    return new Promise( async (resolve, reject) => {
        let con = await connect()
        const files = typeof url === "string" ? [ url ] : url
        console.log(`downloading ${files.length} file(s):\n`, files.join("\n"))
        for(let file of files) {
            downloadFile(file, containerName, options)
        }
    })
}