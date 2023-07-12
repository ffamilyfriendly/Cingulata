import Button from "@/components/Button"
import Icon, { IconType } from "@/components/Icon"
import Modal from "@/components/Modal"
import { EntityTypes } from "@/lib/api/managers/ContentManager"
import { client } from "@/pages/_app"
import { useState } from "react"
import { ToggleRow } from "../Invite/InviteCreator"
import style from "./NewEntity.module.css"


// "Audio"|"Movie"|"Series"|"Category"
function EntitySelector( props: { selected: EntityTypes, onChange: Function } ) {

    function EntityType( entProps: { icon: IconType, type: EntityTypes, selected: boolean } ) {
        return (
            <div onClick={() => { props.onChange(entProps.type) }} className={`${style.type} ${ entProps.selected ? style.selected : "" }`}>
                <Icon type={entProps.icon} />
            </div>
        )
    }

    return (
        <div className={style.container}>
            <EntityType selected={ props.selected === EntityTypes.Movie } type={ EntityTypes.Movie } icon="movie" />
            <EntityType selected={ props.selected === EntityTypes.Audio } type={ EntityTypes.Audio } icon="audio" />
            <EntityType selected={ props.selected === EntityTypes.Series } type={ EntityTypes.Series } icon="series" />
            <EntityType selected={ props.selected === EntityTypes.Category } type={ EntityTypes.Category } icon="category" />
        </div>
    )
}

export default function NewEntity() {

    const [ type, setType ] = useState<EntityTypes>(EntityTypes.Category)
    const [ entPublic, setPublic ] = useState(false)
    const [ promise, setPromise ] = useState<Promise<any>|null>()

    const createEntity = () => {
        const creationPromise = client.content.createEntity({ type, isPublic: entPublic })
        setPromise(creationPromise)
    }

    return (
        <Modal title="New Entity" onclose={() => {}}>
            <section className="stack gap-medium">
                <h3>Entity Type</h3>
                <EntitySelector onChange={( t: EntityTypes ) => { setType(t) }} selected={ type } />

                <h3>Entity Privacy</h3>
                <ToggleRow toggled={ entPublic } onClick={( _: string, value: boolean ) => { setPublic(value) }} label="public"  />
                {
                    entPublic ?
                    <small>public content can be accessed by anyone who visits this instance</small> :
                    <small>private content can only be accessed by signed in users</small>
                }

                <Button loadWithPromise={promise} onclick={createEntity} icon="plus" style="primary" width="full">{`Create ${EntityTypes[type]}`}</Button>
            </section>
        </Modal>
    )
}