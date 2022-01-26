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
        if(this.token) {
            this.data = decodeJWT(this.token)
        } else this.loggedIn = false
        this.perms = new PermissionsManager(this?.data.permissions)

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
            fetch(`${this.base}${path}`, _op)
            .then(o => {
                o.json()
                .then(jsData => {
                    if(o.status.toString()[0] !== '2') reject( { status: o.status, statusText: o.statusText, type: "API_ERROR", message: jsData.message  } )
                    resolve( { status: o.status, statusText: o.statusText, content: jsData.message||jsData  } )
                })
            })
            .catch(e => {
                reject({ type: "HTTP_ERROR", statusText: "Network Error", message: e })
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