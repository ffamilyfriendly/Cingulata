import { PermissionsManager } from "./permissions"
import Entity from "./entity"

const setStoredToken = (token) => {
    localStorage.setItem("okapi_token", token)
}

const getStoredToken = () => {
    return localStorage.getItem("okapi_token")
}

/**
 * @description decode the payload segment of a JWT
 * @param {String} text 
 */
const decodeJWT = (text) => {
    const segments = text.split(".")
    if(segments.length !== 3) throw new Error("token formatting invalid")
    return JSON.parse( atob(segments[1]) )
}

export class OkapiClient {
    constructor(base_url) {
        this.base = base_url
        this.token = getStoredToken()
        this.loggedIn = true
        this.data = {};
        this.serverconf = null
        this._internal = {
            hasLostConn: false
        }
        this.perms = new PermissionsManager(0)

        if(this.token) {
            this.validateSession()
            .then(ans => {
                if(ans) {
                    this.data = decodeJWT(this.token) 
                    this.perms = new PermissionsManager(this?.data.permissions)
                } else {
                    localStorage.removeItem("okapi_token")
                    this.loggedIn = false
                }
            })
        } else this.loggedIn = false

        //heartbeat
        setInterval(() => {
            this.getServerConfig(false)
            .then(() => {
                if(this._internal.hasLostConn) {
                    this.onHeartBeatResumed()
                }
                this.onHeartBeat()
                this._internal.hasLostConn = false
            })
            .catch(e => {
                if(!this._internal.hasLostConn) this.onHeartBeatFailedOnce()
                this._internal.hasLostConn = true
                this.onHeartBeatFailed()
            })
        }, 10000)

        // events
        this.onLoggedIn = () => { }
        this.onHeartBeatFailed = () => { }
        this.onHeartBeatFailedOnce = () => { }
        this.onHeartBeatResumed = () => { }
        this.onHeartBeat = () => { }
    }

    req(path, body, options = { }) {
        if(path[0] !== "/") path = "/" + path

        options = Object.assign({ headers: [], method: "GET" }, options)

        const _op = {
            method: options.method || "GET",
            headers: [...options.headers],
        }

        if(this.token) _op.headers.push(["token", this.token])

        if(body) _op.body = JSON.stringify(body)

        return new Promise((resolve, reject) => {
            try {
                fetch(`${this.base}${path}`, _op)
                .then(o => {
                    if(o.status === 204 || o.status === 201) return resolve()
                    o.json()
                    .then(jsData => {
                        if(o.status.toString()[0] !== '2') reject( { status: o.status, statusText: o.statusText, type: "API_ERROR", message: jsData.message  } )
                        resolve( { status: o.status, statusText: o.statusText, content: jsData.message||jsData  } )
                    })
                    .catch(e => {
                        reject({ type: "JSON_ERROR", statusText: "could not JSON parse", message: e })
                    })
                })
                .catch(e => {
                    reject({ type: "HTTP_ERROR", statusText: "Network Error", message: e })
                })
            } catch(e) {
                reject({ type:"GENERIC_ERROR", statusText:"Something went wrong", message: e })
            }
        })
    }

    validateSession() {
        const op = { headers: [ ["token", this.token] ]}
        return new Promise((resolve, reject) => {
            fetch(`${this.base}/user/all`, op)
            .then(o => {
                o.text()
                .then(res => {
                    resolve(!res.includes("The request requires user authentication."))
                })
            })
            .catch(e => {
                reject(e)
            })
        })
    }

    _setToken(token) {
        this.token = token
        this.data = decodeJWT(token)
        setStoredToken(token)
    }

    getServerConfig(cache = true) {
        return new Promise((resolve, reject) => {
            if(this.serverconf && cache) return resolve(this.serverconf)
            this.req("/")
            .then(s => {
                this.serverconf = s.content
                resolve(s.content)
            })
            .catch(e => reject(e))
        })
    }

    /**
     * 
     * @param {String} email email adress of account
     * @param {String} password password of account
     */
    login(email, password) {
        return new Promise((resolve, reject) => {
            this.req("/user/login", { email, password }, { method: "POST" })
            .then(async r => {
                if(r.status !== 200) {
                    reject(r)
                } else {
                    const _token = r.content
                    this._setToken(_token)
                    resolve()
                    this.onLoggedIn()
                }
            })
            .catch(e => {
                reject(e)
            })
        })
    }

    logout() {
        return new Promise((resolve, reject) => {
            if(!this.loggedIn) return resolve()
            localStorage.removeItem("okapi_token")
            this.req(`/user/logout/${this.token}`, {}, { method: "POST" })
            .then(async r => {
                if(r.status === 200) {
                    return resolve()
                }
                else {
                    reject(r)
                }
            })
        })
    }

    register(email, password, invite) {
        return new Promise((resolve, reject) => { 
            this.req("/user", { email, password, invite, username: email.split("@")[0] }, { method: "POST" })
            .then(() => resolve())
            .catch(e => reject(e))
        })
    }


    //content
    getChildren(id) {
        return new Promise((resolve, reject) => {
            this.req(`/content/${id}/children`)
            .then(r => {
                let rv = new Map()
                for(let ent of r.content.sort((a, b) => a.position - b.position))
                    rv.set(ent.id, new Entity(ent, this.req.bind(this)))
                resolve(rv)
            })
            .catch(err => reject(err))
        })
    }
}