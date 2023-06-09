import { Client } from "../client";
import { Rest } from "../rest";

export enum UserPermissions {
    Administrator = 1 << 0,
    GenerateInvite = 1 << 1,
    PrivateContent = 1 << 2,
    ManageContent = 1 << 3
}

export function has_permission(p: number, permission: UserPermissions) {
    if((p & UserPermissions.Administrator) == UserPermissions.Administrator) return true
    return (p & permission) == permission
}

export class UserManager {

    rest: Rest
    constructor(client: Client) {
        this.rest = client.rest
    }

}