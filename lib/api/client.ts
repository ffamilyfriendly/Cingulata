const API_PATH: string = "https://staging.familyfriendly.xyz/api/"

const decodeJWT = (text: string) => {
    const segs = text.split(".")
    if(segs.length !== 3) throw new Error("token formatting wrong")
    return JSON.parse( atob( segs[1] ) )
}



export {}