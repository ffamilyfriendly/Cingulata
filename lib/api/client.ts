import { StringMappingType } from "typescript"
import ContentManager from "./managers/ContentManager"
import { Rest, Routes, SuccessResponse } from "./rest"

const API_PATH: string = "https://staging.familyfriendly.xyz/api/"

const decodeJWT = (text: string) => {
    const segs = text.split(".")
    if(segs.length !== 3) throw new Error("token formatting wrong")
    return JSON.parse( atob( segs[1] ) )
}

type HostConfig = {
    hostname: string,
    invite_only: boolean,
    tmdb_key: string
}

export class Client {
    rest: Rest
    content: ContentManager

    constructor() {
        this.rest = new Rest()
        this.content = new ContentManager(this)

        this.checkToken()
    }

    private checkToken() {
        if(typeof window === "undefined") return console.log(":(")
        const token = window.localStorage.getItem("okapi_token")
        if(!token) return 

        try {
            console.log(decodeJWT(token))
            this.rest.setToken(token)
        } catch(err) {
            console.warn("failed to parse token")
            window.localStorage.removeItem("okapi_token")
        }
    }

    login( email: string, password: string ): Promise<string> {
        return new Promise((resolve, reject) => {
            this.rest.post(Routes.Login, { email, password })
                .then(response => {
                    if(response.type === "CONTENT") {
                        if(typeof window !== "undefined") localStorage.setItem("okapi_token", response.data as string)
                        this.checkToken()
                        resolve("logged in")
                    }
                })
                .catch(reject)
        })
    }

    register( email: string, password: string, invite?: string ): Promise<SuccessResponse> {

        const data = {
            email, password, username: email.split("@")[0] ,
            ...( invite && { invite } ) 
        }

        return new Promise((resolve, reject) => {
            this.rest.post(Routes.Register, data)
                .then(resolve)
                .catch(reject)
        })
    }

    get hostConfig(): Promise<HostConfig> {
        return new Promise((resolve, reject) => {
            this.rest.get("/")
                .then(r => resolve(r.data as HostConfig))
                .catch(reject)
        })
    }
}

export {}