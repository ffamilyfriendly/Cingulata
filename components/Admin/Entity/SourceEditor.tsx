import Button from "@/components/Button"
import Icon, { IconType } from "@/components/Icon"
import Input from "@/components/Input"
import Modal from "@/components/Modal"
import { Entity, Source, SourceType } from "@/lib/api/managers/ContentManager"
import { client } from "@/pages/_app"
import { Dispatch, useEffect, useRef, useState } from "react"

import entStyle from "./NewEntity.module.css"
import style from "./SourceEditor.module.css"



function SourceItem( { source }: { source: Source } ) {
    return (
        <div className={style.source}>
            <h4>{ source.displayname }</h4>
            { source.length }
        </div>
    )
}


function EntitySelector( props: { selected: SourceType, onChange: Function } ) {

    function EntityType( entProps: { icon: IconType, type: SourceType, selected: boolean } ) {
        return (
            <div onClick={() => { props.onChange(entProps.type) }} className={`${entStyle.type} ${ entProps.selected ? entStyle.selected : "" }`}>
                <Icon type={entProps.icon} />
            </div>
        )
    }

    return (
        <div className={entStyle.container}>
            <EntityType selected={ props.selected === SourceType.Video } type={ SourceType.Video } icon="movie" />
            <EntityType selected={ props.selected === SourceType.Audio } type={ SourceType.Audio } icon="audio" />
            <EntityType selected={ props.selected === SourceType.Subtitle } type={ SourceType.Subtitle } icon="subtitle" />
        </div>
    )
}


function NewSource( { setModal, entity, ...props }: { setModal: Dispatch<boolean>, entity: Entity, onNew: ( source: Source|undefined ) => void } ) {
    const [ type, setType ] = useState<SourceType>(SourceType.Video)
    const [ path, setPath ] = useState<string[]>([])

    const [ promise, setPromise ] = useState<Promise<any>|null>()

    const fileTypes: { [ key in SourceType ]: string[] } = {
        [ SourceType.Audio ]: [ "mp3" ],
        [ SourceType.Video ]: [ "mp4" ],
        [ SourceType.Subtitle ]: [ "vtt" ]
    } 

    useEffect(() => {
        // When type switches we want to clear any path associated with that type
        setPath([])
    }, [ type ])

    const createSource = () => {
        const creationPromise = entity.createSource({ path: path[0], type })
            .then((d) => {
                props.onNew(d.sources.find( p => p.path === path[0] ))
                setModal(false)
            })
        setPromise(creationPromise)
    }

    return <Modal title="New Source" onclose={() => { setModal(false) }}>
        <section className="stack gap-medium">
        <h3>Source Type</h3>
            <EntitySelector selected={type} onChange={setType} />
            <Input key={type} type="file" label="File" multiple={false} fileTypes={fileTypes[type]} setValue={setPath} value={path} />
            <Button onclick={createSource} loadWithPromise={ promise } disabled={ path.length === 0 } style="primary" width="full">{`Create new ${SourceType[type]}`}</Button>
        </section>
    </Modal>
}

export default function SourceEditor( { entity }: { entity: Entity } ) {

    const [sources, setSources] = useState(entity.sources)

    console.log(sources)

    const firstRender = useRef(true)
    const [ edited, setEdited ] = useState(false)

    const [ modal, setModal ] = useState(false)
    const [ savePromise, setSavePromise ] = useState<Promise<any>|null>()

    const onNew = ( src: Source|undefined ) => {
        if(src) {
            setSources(s => {
                s.push(src)
                return s
            })
        }
    }

    return (
        <div className="stack gap-medium">
            { modal ? <NewSource onNew={onNew} entity={entity} setModal={setModal} /> : null }
            <div>
                { sources.map(s => <SourceItem key={s.id} source={s} />) }
            </div>
            <Button onclick={() => { setModal(true) }} loadWithPromise={savePromise} style="primary" width="full">New</Button>
        </div>
    )
}