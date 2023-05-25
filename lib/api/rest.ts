const API_PATH: string = "https://staging.familyfriendly.xyz/api"

export const Routes = {

    // USER AUTH
    Login: `/user/login` as const,

    Register: `/user` as const,

    // CONTENT
    GetCollection(id: string) {
        return `/content/${id}` as const
    },

    GetSources(parent: string) {
        return `/content/${parent}/sources` as const
    },

    GetEntityInfo(id: string) {
        return `/content/${id}/info` as const
    },

    GetChildren(parent: string) {
        return `/content/${parent}/children` as const
    },

    GetFiles(dir: string) {
        return `/content/files?dir=${dir}` as const
    },

    SearchContent(query: { name?: string, description?: string, type: string }) {
        const queryString = (l: [string, string][]) => l.filter(item => item[1]).map(item => `${item[0]}=${encodeURIComponent(item[1])}`).join("&")
        return `/content/search?${queryString( Object.entries(query) )}` as const
    },




}

type HTTPOptions = "GET"|"POST"|"PUT"|"DELETE"
type Header = [string, string][]
type FetchOptions = {
    mode?: "cors"|"no-cors"|"same-origin",
    cache?: "no-cache"|"default"|"reload"|"force-cache"|"only-if-cached",
    credentials?: "include"|"same-origin"|"omit",
    headers?: Header,
    redirect?: "follow"|"manual"|"error",
    body?: string|null,
    method?: HTTPOptions
}

const defaultOptions: FetchOptions = {
    mode: "cors",
    cache: "default",
    redirect: "follow",
    headers: [],
    body: null,
}

type ErrorTypes = "GENERIC"|"PARSE"|"HTTP"|"API"
export type FailResponse = {
    type: ErrorTypes,
    displayText: string,
    message?: string
}

type SuccessTypes = "CONTENT"|"NO-CONTENT"
export type SuccessResponse = {
    type: SuccessTypes,
    data?: Object|string
}

export class Rest {
    private token: string

    constructor() {
        this.token = ""    
    }

    setToken(token: string) {
        this.token = token
    }

    private req(path: string, method: HTTPOptions, body?: Object|null, options: FetchOptions = {}): Promise<SuccessResponse> {
        let opts: FetchOptions = Object.assign(defaultOptions, options)
        opts.method = method
        if(body) opts.body = JSON.stringify(body)

        if(this.token) opts.headers?.push(["token", this.token])

        return new Promise((resolve, reject) => {
            fetch(`${API_PATH}${path}`, opts)
                .then(response => {
                    if([204, 201].includes(response.status)) return resolve({ type: "NO-CONTENT" })
                    response.json()
                        .then(responseJson => {
                            if(response.status.toString()[0] !== "2") return reject({ type: "API", displayText: responseJson.message || response.statusText, message: responseJson.message || responseJson })
                            resolve({ type: "CONTENT", data: responseJson.message||responseJson })
                        })
                        .catch(e => {
                            reject({ type: "PARSE", displayText: "failed to parse json", message: e } as FailResponse)
                        })
                })
                .catch((e) => {
                    reject({ type: "GENERIC", displayText: "something went wrong", message: e } as FailResponse)
                })
        })
    }

    get(path: string) {
        return this.req(path, "GET")
    }

    post(path: string, data: Object) {
        return this.req(path, "POST", data)
    }

}