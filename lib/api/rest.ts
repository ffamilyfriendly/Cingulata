//const API_PATH: string = "https://staging.familyfriendly.xyz/api"
const API_PATH: string = "http://0.0.0.0:3001"

export const Routes = {

    // USER AUTH
    Login: `/user/login` as const,

    Register: `/user` as const,

    // USER base: /user

    User(id: string) {
        return `/user/${id}` as const
    },

    ChangePassword(id: string) {
        return `/user/${id}/password` as const
    },

    LogOut(id: string) {
        return `/user/logout/${id}` as const
    },

    ClearSessions(id: number) {
        return `/user/clearsessions/${id}`
    },

    UserPerms(id: string) {
        return `/user/${id}/flag` as const
    },

    AllUsers: `/user/all` as const,

    // CONTENT
    Entity(id: string) {
        return `/content/${id}` as const
    },

    EditEntity(id: string) {
        return `/content/entity/${id}` as const
    },

    MetaData(id: string) {
        return `/content/${id}/metadata` as const
    },

    EditMetaData(id: string) {
        return `/content/metadata/${id}` as const
    },

    EntitySources(parent: string) {
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

    LastWatched(entity: string) {
        return `/content/${entity}/lastwatched` as const
    },

    Source(id: string) {
        return `/content/source/${id}` as const
    },



    // INVITES

    NewInvite: "/invite/" as const,

    AllInvites: "/invite/all/all" as const,

    Invite(id: string) {
        return `/invite/${id}` as const
    }


}

type HTTPOptions = "GET"|"POST"|"PUT"|"DELETE"|"PATCH"
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
type defaultSuccessResponseType = Object|string
export type SuccessResponse<ResponseType = defaultSuccessResponseType> = {
    type: SuccessTypes,
    data?: ResponseType
}

export class Rest {
    private token: string

    constructor() {
        this.token = "" 
    }

    setToken(token: string) {
        this.token = token
    }

    private req<ResponseType>(path: string, method: HTTPOptions, body?: Object|null, options: FetchOptions = {}): Promise<SuccessResponse<ResponseType>> {
        let opts: FetchOptions = Object.assign(defaultOptions, options)
        opts.method = method
        if(body) opts.body = JSON.stringify(body)

        if(this.token && !opts.headers?.find(e => e[0] === "token")) opts.headers?.push(["token", this.token])

        if(opts.body && method === "GET") {
            console.warn(`[REST] tried making GET request with body.\npath: ${path}\nbody: ${opts.body}\nbody will be stripped before request is made`)
            opts.body = null
        }

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

    get<T = defaultSuccessResponseType>(path: string) {
        return this.req<T>(path, "GET")
    }

    delete<T = defaultSuccessResponseType>(path: string) {
        return this.req<T>(path, "DELETE")
    }

    post<T = defaultSuccessResponseType>(path: string, data: Object) {
        return this.req<T>(path, "POST", data)
    }

    patch<T = defaultSuccessResponseType>(path: string, data: Object) {
        return this.req<T>(path, "PATCH", data)
    }
}