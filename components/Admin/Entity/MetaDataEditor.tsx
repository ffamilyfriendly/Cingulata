// stolen from https://stackoverflow.com/questions/29919596/how-do-i-get-a-list-of-countries-in-my-website

import Button from "@/components/Button";
import Input from "@/components/Input";
import { Entity, Metadata } from "@/lib/api/managers/ContentManager";
import { useEffect, useRef, useState } from "react";

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

export default function MetaDataEditor( { entity, onEdit, ...props }: { entity: Entity, onEdit: ( metadata: { name: string, description: string, thumbnail: string, banner: string, language: string, age_rating: string, rating: number } ) => void } ) {

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
    const [ rating, setRating ] = useState(metadata.rating)

    const [ savePromise, setSavePromise ] = useState<Promise<any>|null>()

    useEffect(() => {
        if(firstRender.current) {
            firstRender.current = false
        } else {
            onEdit({name, description, thumbnail, banner, language, age_rating: age, rating })
            setEdited(true)
        }
    }, [ name, description, thumbnail, banner, language, age, rating ])

    const saveEdited = () => {
        const promise = metadata.edit( { name, description, thumbnail, banner, language, age_rating: age, rating } )
            .then(() => {
                setEdited(false)
            })
        setSavePromise(promise)
    }

    return (
        <div className="stack gap-medium">
            <Input value={ name } setValue={ setName } label="Name" />
            <Input value={ description } setValue={ setDescription } label="Description" type="textbox" />
            <Input value={ rating } setValue={ setRating } label="Rating" type="rating" />
            <Input value={ thumbnail } setValue={ setThumbnail } label="Thumbnail" type="image" />
            <Input value={ banner } setValue={ setBanner } label="banner" type="image" />
            <Input value={ language } setValue={ setLanguage } label="Language" type="select" selectOptions={ getCountries() } />
            <Input value={ age } setValue={ setAge } label="Age Rating" type="select" selectOptions={[ { value: "ALL", display: "All Audiences" }, { value: "PG", display: "Parental Guidance" }, { value: "PG13", display: "Over 13" }, { value: "R", display: "Adult" } ]} />
            
            <Button onclick={saveEdited} loadWithPromise={savePromise} disabled={!edited} style="primary" width="full">Save</Button>
        </div>
    )
}