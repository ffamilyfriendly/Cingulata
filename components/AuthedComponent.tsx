import { UserPermissions } from "@/lib/api/managers/UserManager"
import { client } from "@/pages/_app"
import { useEffect, useState } from "react"
import { GenericChildrenProp } from "./generic"

interface AuthedComponentProps {
    children: GenericChildrenProp,
    requires: UserPermissions,
    displayInvalid?: GenericChildrenProp
}

export default function AuthedComponent( props: AuthedComponentProps ) {

    const [ authed, setAuthed ] = useState(false)

    useEffect(() => {
        if(client.user) {
            setAuthed(client.user.hasPermission(props.requires))
        }
    }, [ client.user ])

    return (
        <>
            { authed ? props.children : props.displayInvalid || null }
        </>
    )
}