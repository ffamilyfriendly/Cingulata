import Button from "@/components/Button"
import Input from "@/components/Input"
import { Entity } from "@/lib/api/managers/ContentManager"
import { useEffect, useRef, useState } from "react"
import { ToggleRow } from "../Invite/InviteCreator"

export default function BaseEntityEditor( { entity }: { entity: Entity } ) {

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
            <Input label="Parent" type="text" setValue={setParent} value={parent} />
            <Input label="Next" type="text" setValue={setNext} value={next||""} />
            <Input label="Position" type="number" setValue={setPosition} value={position} />
            <ToggleRow toggled={ entPublic } label="Public" onClick={(_e: any, value: boolean) => { setPublic(value) }} />
            <Button onclick={saveEdited} loadWithPromise={savePromise} disabled={!edited} style="primary" width="full">Save</Button>
        </div>
    )
}