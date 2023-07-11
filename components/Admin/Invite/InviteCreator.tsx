import Input from "@/components/Input";
import { has_permission, set_permission, UserPermissions } from "@/lib/api/managers/UserManager";
import { SettingsSection } from "@/pages/settings";
import inputStyle from "@/components/Input/Input.module.css"
import style from "./InviteCreator.module.css"
import { useState } from "react";
import Button from "@/components/Button";
import { client } from "@/pages/_app";
import { Styles } from "@/components/generic";
import StatusBox from "@/components/StatusBox";

function ToggleRow( props: { label: string, toggled?: boolean, onClick: Function } ) {

    const [ toggled, setToggled ] = useState<Boolean>(!!props.toggled)

    const handleOnClick = () => {
        setToggled(c => !c)
        props.onClick(props.label, !toggled)
    }

    return (
        <div className={`spaced-row ${inputStyle.container} ${style.row}`}>
            <p>{ props.label }</p>
            
            <div onClick={handleOnClick} className={style.toggleContainer}>
                <div className={`${style.slider} ${ toggled ? style.toggled : "" }`}></div>
            </div>
        </div>
    )
}

export default function InviteCreator() {
    
    const [ perms, setPerms ] = useState<Set<UserPermissions>>(new Set())
    const [ invitePromise, setInvitePromise ] = useState<Promise<any>|null>()
    const [ invite, setInvite ] = useState<string>()
    const [ statusBox, setStatusBox ] = useState<{ title: string, text: string, style: Styles }|null>()

    const handleClick = ( key: UserPermissions, value: boolean ) => {
        if(perms.has(key) && !value) {
            setPerms(p => {
                p.delete(key)
                return p
            })
        } else if( value ) {
            setPerms(p => {
                p.add(key)
                return p
            })
        }
    }

    const createInvite = () => {

        if(invite) {
            if(navigator) {
                console.log("NAVIGATOR!!! :D")
                navigator.clipboard.writeText(invite)
                    .then(() => {
                        setStatusBox({ title: "Invite copied!", text: `invite "${invite}" copied to clipboard`, style: "success" })
                    })
                    .catch(() => {
                        setStatusBox({ title: "Copy failed :(", text: `invite "${invite}" could not be copied to clipboard`, style: "error" })
                    })
            }
            return
        }

        let permsStr = 0
        for(const p of Array.from(perms.values())) 
            permsStr = set_permission(permsStr, Number(UserPermissions[p]))
        
        const createInvitePromise = client.invites.createInvite({ user_flag: permsStr })
            .then(c => {
                setInvite(c?.data?.url)
            })
            .catch(err => {
                setStatusBox({ title: "Could not create invite", text: `error: ${err}`, style: "error" })
            })
        setInvitePromise(createInvitePromise)
    }

    const permsKeys = Object.keys(UserPermissions).filter(i => isNaN(Number(i)) && i !== "IsUser")

    return (
        <div className="stack gap-medium">
            { statusBox ? <StatusBox style={statusBox.style} icon={ statusBox.style === "error" ? "error" : "info" } title={statusBox.title}>{statusBox.text}</StatusBox> : null }
            <h3>Permissions</h3>
            <div className={ `stack gap-medium ${style.container}` }>
                { permsKeys.map(p => <ToggleRow onClick={handleClick} label={ p } />) }
            </div>
            <Button loadWithPromise={invitePromise} onclick={createInvite} style={ invite ? "success" : "primary" } icon={ invite ? "copy" : "plus" } width="full">{ invite ? "Copy" : "Create" }</Button>
        </div>
    )
}