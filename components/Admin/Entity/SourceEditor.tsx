import Button from "@/components/Button"
import { formatAsTime } from "@/components/entity/Entity"
import Icon, { IconType } from "@/components/Icon"
import Input from "@/components/Input"
import Modal from "@/components/Modal"
import { Entity, EntityTypes, Source, SourceType } from "@/lib/api/managers/ContentManager"
import { client } from "@/pages/_app"
import { Dispatch, useEffect, useRef, useState } from "react"
import Sortable from "../Sortable/Sortable"

import entStyle from "./NewEntity.module.css"
import style from "./SourceEditor.module.css"

const fileTypes: { [ key in SourceType ]: string[] } = {
    [ SourceType.Audio ]: [ "mp3" ],
    [ SourceType.Video ]: [ "mp4" ],
    [ SourceType.Subtitle ]: [ "vtt" ]
} 

function SourceEditModal( { source, setModal }: { source: Source, setModal: Function } ) {

    const [ name, setName ] = useState(source.displayname)
    const [ path, setPath ] = useState(source.path)
    const [ position, setPosition ] = useState(source.position)

    const firstRender = useRef(true)
    const [ edited, setEdited ] = useState(false)

    const [ promise, setPromise ] = useState<Promise<any>|null>()

    useEffect(() => {
        if(firstRender.current) {
            firstRender.current = false
        } else {
            setEdited(true)
        }
    }, [ name, path, position ])

    const saveEdit = () => {
        const sourceEdit = source.edit( { name, path, position } )
            .then(() => {

                // this is bad as this no longer is a pure function
                // we should ideally not alter the source itself... 
                // but: if it works it works. 
                source.displayname = name
                source.position = position
                source.path = path

                setEdited(false)
            })

        setPromise(sourceEdit)
    }

    return (
        <Modal title={`editing ${source.displayname}`} onclose={() => { setModal(false) }} >
            <section className="stack gap-medium">
                <Input label="Name" type="text" value={name} setValue={setName} />
                <Input label="Path" type="file" value={[ path ]} fileTypes={fileTypes[source.type]} setValue={(s) => { setPath(s[0]) }} />
                <Input label="Position" type="number" value={position} setValue={(v) => setPosition(Number(v))} />
                <Button loadWithPromise={promise} disabled={ !edited } onclick={saveEdit} style="primary" width="full">Save</Button>
            </section>
        </Modal>
    )
}

function SourceItem( { source }: { source: Source } ) {

    const [ modal, setModal ] = useState(false)

    const sourceIcons: { [ key in SourceType ]: IconType } = {
        [ SourceType.Audio ]: "audio",
        [ SourceType.Video ]: "movie",
        [ SourceType.Subtitle ]: "subtitle"
    } 

    return (
        <div className={style.source}>
            { modal ? <SourceEditModal source={source} setModal={setModal} /> : null }
            <Icon type={ sourceIcons[source.type] } />
            <div className={`stack gap-small ${style.meta}`}>
                <h4>{ source.displayname }</h4>
                <div className={ style.pillRow }>
                { source.type != SourceType.Subtitle ? <div className={ style.pill }>
                         <span> {formatAsTime(source.length)} </span>  
                    </div> : null } 
                </div>
            </div>
            <div>
                <Button onclick={() => { setModal(true) }} style="tertiary">edit</Button>
            </div>
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

    useEffect(() => {
        // When type switches we want to clear any path associated with that type
        setPath([])
    }, [ type ])

    const createSource = () => {
        const creationPromise = entity.createSource({ path: path[0], type })
            .then((d) => {
                props.onNew(d.sources[type].find( p => p.path === path[0] ))
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

export default function SourceEditor( { entity, refetchEntity }: { entity: Entity, refetchEntity: () => void } ) {

    const [sources, setSources] = useState(entity.sources)

    console.log(sources)

    const firstRender = useRef(true)
    const [ edited, setEdited ] = useState(false)

    const [ modal, setModal ] = useState(false)
    const [ savePromise, setSavePromise ] = useState<Promise<any>|null>()

    const onNew = ( src: Source|undefined ) => {
        if(src) {
            setSources(s => {
                s[src.type].push(src)
                return s
            })
        }
    }

    const handleSortChange = ( t: SourceType, currIdx: number, newIdx: number ) => {
        entity.sources[t][currIdx].edit({ position: newIdx })
            .then(() => {
                refetchEntity()
            })
    }

    return (
        <div className="stack gap-medium">
            { modal ? <NewSource onNew={onNew} entity={entity} setModal={setModal} /> : null }
            <div className={ style.sourceLists }>
                <section>
                    <h3>Video</h3>
                    <div className={ style.sourceSection }>
                        { entity.sources[SourceType.Video].map(s => <SourceItem key={s.id} source={s} />) }
                    </div>
                </section>

                <section>
                    <h3>Subtitles</h3>
                    <div className={ style.sourceSection }>
                        <Sortable onChange={( item, newPos ) => { handleSortChange(SourceType.Subtitle, item, newPos) }}>
                            { entity.sources[SourceType.Subtitle].map(s => <SourceItem key={s.id} source={s} />) }
                        </Sortable>
                    </div>
                </section>

                { entity.type === EntityTypes.Audio ?
                    <section>
                        <h3>Audio</h3>
                        <div className={ style.sourceSection }>
                            <Sortable onChange={( item, newPos ) => { handleSortChange(SourceType.Audio, item, newPos) }}>
                                { entity.sources[SourceType.Audio].map(s => <SourceItem key={s.id} source={s} />) }
                            </Sortable>
                        </div>
                    </section> : null
            }

            </div>
            <Button onclick={() => { setModal(true) }} loadWithPromise={savePromise} style="primary" width="full">New</Button>
        </div>
    )
}