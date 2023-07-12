import AuthedComponent from "@/components/AuthedComponent";
import StatusBox from "@/components/StatusBox";
import StickyHeader from "@/components/StickyHeader";
import { Entity } from "@/lib/api/managers/ContentManager";
import { UserPermissions } from "@/lib/api/managers/UserManager";
import { client } from "@/pages/_app";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import GenericStyles from "@/styles/common.module.css"
import { IconType } from "@/components/Icon";
import { Styles } from "@/components/generic";
import Input from "@/components/Input";
import { ToggleRow } from "@/components/Admin/Invite/InviteCreator";
import Button from "@/components/Button";

function BaseEntityEditor( { entity }: { entity: Entity } ) {

    const firstRender = useRef(true)

    const [ edited, setEdited ] = useState(false)

    // Entity values
    const [ parent, setParent ] = useState(entity.parent_id)
    const [ next, setNext ] = useState(entity.next_id)
    const [ entPublic, setPublic ] = useState(entity.public)
    const [ position, setPosition ] = useState(entity.position)

    const [ savePromise, setSavePromise ] = useState<Promise<any>|null>()

    useEffect(() => {
        if(firstRender.current) {
            firstRender.current = false
        } else {
            setEdited(true)
        }
    }, [ parent, next, entPublic, position ])

    const saveEdited = () => {
        const promise = entity.edit({ parent, next, position: Number(position), flag: Number(!entPublic) })
            .then(() => {
                setEdited(false)
            })
            setSavePromise(promise)
    }

    return (
        <div className="stack gap-medium">
            <Input label="Parent" setValue={setParent} value={parent} />
            <Input label="Next" setValue={setNext} value={next||""} />
            <Input label="Position" setValue={setPosition} value={position} />
            <ToggleRow toggled={ entPublic } label="Public" onClick={(_e: any, value: boolean) => { setPublic(value) }} />
            <Button onclick={saveEdited} loadWithPromise={savePromise} disabled={!edited} style="primary" width="full">Save</Button>
        </div>
    )
}

function MetaDataEditor() {
    return (
        <div className="stack gap-medium">
            <p> <b>TODO:</b> implement this </p>
        </div>
    )
}

export default function Home() {
    const id = useRouter().query["id"]
    if(typeof id !== "string") return <p>something went wrong</p>

    const [ entity, setEntity ] = useState<Entity|null>()
    const [ status, setStatus ] = useState<{ title: string, message: string, icon?: IconType, style: Styles }>()

    useEffect(() => {
        client.content.get(id, true)
            .then(setEntity)
            .catch((e) => {
                setError(`${e.type} error`, e.message)
                console.error(e)
            })
    }, [])

    const setError = ( title: string, message: string ) => {
        setStatus({ title, style: "error", icon:"error", message })
    }

    if(!entity) return <p>loading</p>

    return (
        <AuthedComponent requires={UserPermissions.ManageContent}>
            <StickyHeader title={ entity?.metadata?.name ? entity.metadata.name : "Content" } link={{ title: "Settings", href: "/settings" }} />
            <main className={`${GenericStyles.centerHorizontal} ${GenericStyles.container}`}>
                <div>
                    { status ? <StatusBox style={status.style} icon={status.icon} title={status.title}><p>{status.message}</p></StatusBox> : null}
                    
                    <section>
                        <h2>Base data</h2>
                        <BaseEntityEditor entity={ entity } />

                        <h2>Metadata</h2>
                        <MetaDataEditor />
                    </section>
                </div>
            </main>
        </AuthedComponent>
    )
}