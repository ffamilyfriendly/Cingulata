import { Client } from "../client";
import { Rest, Routes, SuccessResponse } from "../rest";

export enum UserPermissions {
    IsUser = -1, // Not a valid API flag. This is used in conjunction with the "AuthedComponent" component
    Administrator = 1 << 0,
    GenerateInvite = 1 << 1,
    PrivateContent = 1 << 2,
    ManageContent = 1 << 3
}

export function has_permission(p: number, permission: UserPermissions) {
    if(p && permission === UserPermissions.IsUser) return true
    if((p & UserPermissions.Administrator) == UserPermissions.Administrator) return true
    
    return (p & permission) == permission
}

export function set_permission(p: number, permission: UserPermissions) {
    return p |= permission
}

export class User {
    permissions: number
    email: string
    id: number
    manager: UserManager

    constructor( data: { perms: number, email: string, uid: number }, uManager: UserManager ) {
        this.manager = uManager
        this.permissions = data.perms
        this.id = data.uid
        this.email = data.email
    }

    hasPermission( permission: UserPermissions ): boolean {
        return has_permission(this.permissions, permission)
    }

    logOut() {
        return this.manager.logOut(this.id.toString())
    }

    clearSessions() {
        return this.manager.clearSessions(this.id)
    }

    delete() {
        return this.manager.deleteUser(this.email)
    }

    setPermissions(perms: number|UserPermissions[]) {
        return this.manager.setPermission(this.email, perms)
    }

    setPassword(oldPassword: string, newPassword: string) {
        return this.manager.setPassword(this.id.toString(), oldPassword, newPassword)
    }
}

interface RawUser {
    username: string,
    email: string,
    flag: number,
    id: number
}

export class UserManager {
    rest: Rest

    constructor(client: Client) {
        this.rest = client.rest
    }

    logOut(id: string): Promise<SuccessResponse> {
        return this.rest.post(Routes.LogOut(id), {})
    }

    clearSessions(id: number): Promise<SuccessResponse> {
        return this.rest.post(Routes.ClearSessions(id), {})
    }

    deleteUser(id: string): Promise<SuccessResponse> {
        return this.rest.delete(Routes.User(id))
    }

    setPermission(id: string, perms: number|UserPermissions[]) {
        let flag: number = 0

        if(typeof perms === "number") flag = perms
        else {

        }

        return this.rest.patch(Routes.UserPerms(id), { flag })
    }

    setPassword(id: string, oldPassword: string, newPassword: string) {
        return this.rest.patch(Routes.ChangePassword(id), { old_password: oldPassword, new_password: newPassword })
    }

    get users(): Promise<User[]> {
        return new Promise((resolve, reject) => {
            this.rest.get(Routes.AllUsers)
                .then(resp => {
                    if(resp.data && resp.data instanceof Array) {
                        resolve(resp.data.map(( rawUser: RawUser ) => new User({ perms: rawUser.flag, email: rawUser.email, uid: rawUser.id }, this)))
                    }
                })
                .catch(reject)
        })
    }
}