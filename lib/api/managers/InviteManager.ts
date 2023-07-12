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

    delete() {
        return this.manager.deleteInvite(this.id)
    }
}

type SuccesfullInviteResponse = { url: string }

export class InviteManager {
    rest: Rest
    constructor(client: Client) {
        this.rest = client.rest
    }

    createInvite( data: { user_flag?: number|null, expires?: number|null, uses?: number|null } ) {
        return this.rest.post<SuccesfullInviteResponse>(Routes.NewInvite, data)
    }

    deleteInvite( id: string ) {
        return this.rest.delete(Routes.Invite(id))
    }

    get invites(): Promise<Invite[]> {
        return new Promise((resolve, reject) => {
            this.rest.get<rawInviteData[]>(Routes.AllInvites)
                .then(data => resolve( data.data ? data.data.map(inv => new Invite(this, inv)) : [] ))
                .catch(reject)
        })
    }
}