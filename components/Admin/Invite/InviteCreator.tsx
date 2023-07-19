import Input from "@/components/Input";
import { set_permission, UserPermissions } from "@/lib/api/managers/UserManager";
import inputStyle from "@/components/Input/Input.module.css"
import style from "./InviteCreator.module.css"
import { useState } from "react";
import Button from "@/components/Button";
import { client } from "@/pages/_app";
import { Styles } from "@/components/generic";
import StatusBox from "@/components/StatusBox";
import AuthedComponent from "@/components/AuthedComponent";

export function ToggleRow( { stateManaged = true, ...props}: { label: string, toggled?: boolean, onClick: Function, stateManaged?: boolean } ) {

    const [ toggled, setToggled ] = useState<Boolean>(!!props.toggled)

    const handleOnClick = () => {
        setToggled(c => !c)
        props.onClick(props.label, !toggled)
    }

    return (
        <div className={`spaced-row ${inputStyle.container} ${style.row}`}>
            <p>{ props.label }</p>
            
            <div onClick={handleOnClick} className={style.toggleContainer}>
                <div className={`${style.slider} ${ ( stateManaged ? toggled : props.toggled ) ? style.toggled : "" }`}></div>
            </div>
        </div>
    )
}

export default function InviteCreator() {
    
    const [ perms, setPerms ] = useState<Set<UserPermissions>>(new Set())

    const [ uses, setUses ] = useState<number>(0)
    const [ usesEnbaled, setUsesEnabled ] = useState(false)

    const [ expires, setExpires ] = useState<number>(0)
    const [ expiresEnabled, setExpiresEnabled ] = useState(false)

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
        
        const createInvitePromise = client.invites.createInvite({ user_flag: permsStr != 0 ? permsStr : null, expires: expiresEnabled ? new Date(expires).getTime() : null, uses: usesEnbaled ? Number(uses) : null })
            .then(c => {
                setInvite(c?.data?.url)
            })
            .catch(err => {
                setStatusBox({ title: "Could not create invite", text: `${err.type}: ${err.message}`, style: "error" })
            })
        setInvitePromise(createInvitePromise)
    }

    const permsKeys = Object.keys(UserPermissions).filter(i => isNaN(Number(i)) && i !== "IsUser")

    return (
        <div className="stack gap-medium">
            { statusBox ? <StatusBox style={statusBox.style} icon={ statusBox.style === "error" ? "error" : "info" } title={statusBox.title}>{statusBox.text}</StatusBox> : null }

            <h3>Expires</h3>
            <Input disabled={ !expiresEnabled } validate={( v ) => { return { ok: new Date(v).getTime() > Date.now(), message: "You need a time machine for this invite..." } }} setValue={( v ) => { setExpires(v) }} value={expires} type="date" />
            <ToggleRow toggled={ expiresEnabled } onClick={( _: any, val: boolean ) => { setExpiresEnabled(val) }} label="enabled" />
            <small>When you want the invite to expire</small>

            <h3>Uses</h3>
            <Input disabled={ !usesEnbaled } validate={( n ) => { return { ok: Number(n) > 0, message: "Must be larger than 0" } }} setValue={(v) => { setUses(v) }} value={uses} type="number" />
            <ToggleRow toggled={ usesEnbaled } onClick={( _: any, val: boolean ) => { setUsesEnabled(val) }} label="enabled" />
            <small>How many times the invite can be used before becoming invalid</small>

            {/* User requires administrator to create invites with the user_flag option. If user_flag is provided by non admin user the code will default to PrivateContent which is UD if user thinks they are setting permissions */}
            <AuthedComponent requires={ UserPermissions.Administrator }>
                <h3>Permissions</h3>
                <div className={ `stack gap-medium ${style.container}` }>
                    { permsKeys.map(p => <ToggleRow key={ p } onClick={handleClick} label={ p } />) }
                </div>
                <small> users who use this invite will be granted with these permissions. Leaving blank defaults to PrivateContent </small>
            </AuthedComponent>
            <Button loadWithPromise={invitePromise} onclick={createInvite} style={ invite ? "success" : "primary" } icon={ invite ? "copy" : "plus" } width="full">{ invite ? "Copy" : "Create" }</Button>
        </div>
    )
}