/**
 * @typedef {"Administrator" | "GenerateInvite" | "PrivateContent" | "ManageContent"} UserPermission
 */
const UserPermissions = {
    Administrator: 1 << 0,
    GenerateInvite: 1 << 1,
    PrivateContent: 1 << 2,
    ManageContent: 1 << 3
}

export class PermissionsManager {
    constructor(flag = 0) {
        this.flag = flag
        this.FLAGS = UserPermissions
    }

    setFlag(flag = 0) {
        this.flag = flag
    }

    toggleBit(mask) {
        this.flag |= mask
    }

    /**
     * 
     * @param {UserPermission} perm 
     */
    hasPermission(perm) {
        const _h = (p) => (this.flag & p) === p
        if(_h(UserPermissions.Administrator)) return true
        else return _h(UserPermissions[perm])
    }
}