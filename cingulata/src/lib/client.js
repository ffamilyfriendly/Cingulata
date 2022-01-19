import { PermissionsManager } from "./permissions"

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
        if(this.token) {
            this.data = decodeJWT(this.token)
        } else this.loggedIn = false
        this.perms = new PermissionsManager(this?.data.permissions)

        // events
        this.onLoggedIn = () => { }
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

        console.log(_op)

        return new Promise((resolve, reject) => {
            fetch(`${this.base}${path}`, _op)
            .then(o => resolve(o))
            .catch(e => reject(e))
        })
    }

    _setToken(token) {
        this.token = token
        this.data = decodeJWT(token)
        setStoredToken(token)
    }

    getServerConfig() {
        return new Promise((resolve, reject) => {
            if(this.serverconf) return resolve(this.serverconf)
            this.req("/")
            .then(s => {
                s.json()
                .then(json => {
                    this.serverconf = json
                    resolve(json)
                })
            })
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
                    reject({ errorMessage: "api_error", errorData: await r.json() })
                } else {
                    const _token = await r.text()
                    this._setToken(_token)
                    resolve()
                    this.onLoggedIn()
                }
            })
            .catch(e => {
                reject({ errorMessage: "http_error", errorData: e })
            })
        })
    }

    register(email, password, invite) {
        return new Promise((resolve, reject) => { 
            this.req("/user", { email, password, invite, username: email.split("@")[0] }, { method: "POST" })
            .then(async r => {
                if(r.status === 201) resolve()
                else reject({ errorMessage: "api_error", errorData: await r.json() })
            })
            .catch(e => {
                reject({ errorMessage: "http_error", errorData: e })
            })
        })
    }
}