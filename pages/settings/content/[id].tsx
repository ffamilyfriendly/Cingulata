import AuthedComponent from "@/components/AuthedComponent";
import StatusBox from "@/components/StatusBox";
import StickyHeader from "@/components/StickyHeader";
import { Entity } from "@/lib/api/managers/ContentManager";
import { UserPermissions } from "@/lib/api/managers/UserManager";
import { client } from "@/pages/_app";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { IconType } from "@/components/Icon";
import { Styles } from "@/components/generic";
import Input from "@/components/Input";
import { ToggleRow } from "@/components/Admin/Invite/InviteCreator";
import Button from "@/components/Button";

import GenericStyles from "@/styles/common.module.css"
import style from "./content.module.css"

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

// stolen from https://stackoverflow.com/questions/29919596/how-do-i-get-a-list-of-countries-in-my-website
// modified to be TS compliant
function getCountries(lang = 'en') {
    const A = 65
    const Z = 90
    const countryName = new Intl.DisplayNames([lang], { type: "language" });
    const countries: { value: string, display: string }[] = []
    for(let i=A; i<=Z; ++i) {
        for(let j=A; j<=Z; ++j) {
            let code = String.fromCharCode(i) + String.fromCharCode(j)
            let name = countryName.of(code)
            if (code !== name && name?.length !== 2) {
                countries.push( { value: code, display: name||"Atlantis" } )
            }
        }
    }
    return countries
}

function MetaDataEditor( { entity, ...props }: { entity: Entity } ) {

    const metadata = entity.metadata
    if(!metadata) return ( <p> NO METADATA </p> )

    const firstRender = useRef(true)
    const [ edited, setEdited ] = useState(false)

    // Metadata values
    const [ name, setName ] = useState(metadata.name)
    const [ description, setDescription ] = useState(metadata.description)
    const [ thumbnail, setThumbnail ] = useState(metadata.thumbnail)
    const [ banner, setBanner ] = useState(metadata.banner)
    const [ language, setLanguage ] = useState(metadata.language||"EN")
    const [ age, setAge ] = useState(metadata.age_rating)

    const [ savePromise, setSavePromise ] = useState<Promise<any>|null>()

    useEffect(() => {
        if(firstRender.current) {
            firstRender.current = false
        } else {
            setEdited(true)
        }
    }, [ name, description, thumbnail, banner, language, age ])

    const saveEdited = () => {
        const promise = metadata.edit( { name, description, thumbnail, banner, language, age_rating: age } )
            .then(() => {
                setEdited(false)
            })
        setSavePromise(promise)
    }

    return (
        <div className="stack gap-medium">
            <Input value={ name } setValue={ setName } label="Name" />
            <Input value={ description } setValue={ setDescription } label="Description" type="textbox" />
            <Input value={ thumbnail } setValue={ setThumbnail } label="Thumbnail" type="image" />
            <Input value={ banner } setValue={ setBanner } label="banner" type="image" />
            <Input value={ language } setValue={ setLanguage } label="Language" type="select" selectOptions={ getCountries() } />
            <Input value={ age } setValue={ setAge } label="Age Rating" type="select" selectOptions={[ { value: "ALL", display: "All Audiences" }, { value: "PG", display: "Parental Guidance" }, { value: "PG13", display: "Over 13" }, { value: "R", display: "Adult" } ]} />
            
            <Button onclick={saveEdited} loadWithPromise={savePromise} disabled={!edited} style="primary" width="full">Save</Button>
        </div>
    )
}

function SourceEditor( { entity }: { entity: Entity } ) {

    const firstRender = useRef(true)
    const [ edited, setEdited ] = useState(false)

    const [ savePromise, setSavePromise ] = useState<Promise<any>|null>()

    return (
        <div className="stack gap-medium">

            <Button onclick={() => {}} loadWithPromise={savePromise} disabled={!edited} style="primary" width="full">Save</Button>
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
                    
                    <section className={ style.mainSection }>
                        <div className={ style.baseSection }>
                            <h2>Base data</h2>
                            <BaseEntityEditor entity={ entity } />
                        </div>

                        <div className={ style.metaSection }>
                            <h2>Metadata</h2>
                            <MetaDataEditor entity={ entity } />
                        </div>

                        <div className={ style.sourceSection }>
                            <h2>Sources</h2>
                            <SourceEditor entity={ entity } />
                        </div>
                    </section>
                </div>
            </main>
        </AuthedComponent>
    )
}