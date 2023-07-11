import { Client } from "../client";
import { Rest, Routes } from "../rest";

type rawInviteData = { id: string, created_by: number, user_flag: number, expires: number, uses: number }

export class Invite {
    manager: InviteManager

    id: string
    createdBy: number
    permissions: number
    expires: Date
    uses: number

    constructor(manager: InviteManager, data: rawInviteData) {
        this.manager = manager
        this.id = data.id
        this.createdBy = data.created_by
        this.permissions = data.user_flag
        this.expires = new Date(data.expires)
        this.uses = data.uses
    }
}

type SuccesfullInviteResponse = { url: string }

export class InviteManager {
    rest: Rest
    constructor(client: Client) {
        this.rest = client.rest
    }

    createInvite( data: { user_flag?: number, expires?: number, uses?: number } ) {
        return this.rest.post<SuccesfullInviteResponse>(Routes.NewInvite, data)
    }
}