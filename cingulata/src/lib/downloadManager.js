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

let data = { loaded: 0, total: 0, segment: 0, segments: 0 }

/*

    Ok so okapi is dumb which causes the aborts if chunkSize is larger than the file it tries to download.
    How fix? Do preamble request with a range of like 1000kb just to get size headers and shit then limit the max
    range we ask for as to not surpass the size of the file we are trying to download. Profit :)

*/


// get file size and so forth so we dont request above it in content-length if file is small and can fit in one part
// this is needed as otherwise the requests aborts due to some issues with okapi that i am not smart enough to fix xd
function preamble(url) {
    return new Promise((resolve, reject) => {
        fetch(url, { method: "GET", mode: "cors", headers: { "Range": `bytes=0-100` } })
            .then((r) => {
                const len = r.headers.get("content-length")
                const range = Number(r.headers.get("content-range").split("/")[1]) - 1
                if(!range) resolve( { acceptsRange: false, len } )
                else resolve( { acceptsRange: true, len, range } )
            })
            .catch(reject)
    })
}

async function downloadFile(url, containerName, options) {
    if(!data.total) {
        const r = await preamble(url)
        data.total = r.range
        data.segments = Math.ceil(r.range / (options.chunkSize * 1000000))
    }

    return new Promise(async (resolve,reject) => {
        const doReq = () => {
            return new Promise((res, rej) => {
                fetch(url, { method: "GET", mode: "cors", headers: { "Range": `bytes=${data.loaded}-${Math.min((data.loaded + (options.chunkSize * 1000000)), data.total)}` } })
                .then(response => {
                    data.loaded += Number(response.headers.get("content-length"))
                    response.blob()
                    .then(b => {
                        data.segment += 1
                        res(b)              
                    })
                    .catch(err => {
                        console.error("blob failed", err)
                    })
                })
                .catch(error => {
                    console.error("main request failed", error)
                })
            })
        }

        while(data.loaded < data.total) {
            const b = await doReq()
            write(`${containerName}|${url}|${data.segment}`, b)
            .catch(err => {
                console.log(`error with ${url} download`, err)
            })
        }
        data = { loaded: 0, total: 0, segment: 0, segments: 0 }
        resolve()
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
 * @param {Boolean} [options.debug] show debug logs
 */
export function downloadFiles(url, containerName, options) {

    const defaults = {
        chunkSize: 50,
        debug: false
    }
    options = Object.assign({}, defaults, options)

    return new Promise( async (resolve, reject) => {
        let con = await connect()
        con.onerror = (e) => reject(e)
        const files = typeof url === "string" ? [ url ] : url
        for(let file of files) {
            if(options.debug) console.log("downloading file", file)
            await downloadFile(file, containerName, options)
            const f = files.indexOf(file)
            if(options.onProgress) options.onProgress({ file: { index: files.indexOf(file), url: file }, progress: ((f + 1) / files.length) })
        }

        if(options.onComplete) options.onComplete()

        resolve()
    })
}