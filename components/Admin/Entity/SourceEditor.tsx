import Button from "@/components/Button"
import { Entity, Source } from "@/lib/api/managers/ContentManager"
import { useEffect, useRef, useState } from "react"

import style from "./SourceEditor.module.css"

function SourceItem( { source }: { source: Source } ) {
    return (
        <div className={style.source}>
            <h4>{ source.displayname }</h4>
            { source.length }
        </div>
    )
}

export default function SourceEditor( { entity }: { entity: Entity } ) {

    const sources = entity.sources

    console.log(sources)

    const firstRender = useRef(true)
    const [ edited, setEdited ] = useState(false)

    const [ savePromise, setSavePromise ] = useState<Promise<any>|null>()

    useEffect(() => {
       entity.metadata?.edit({ rating: 3.5 })
    })

    return (
        <div className="stack gap-medium">
            <div>
                { sources.map(s => <SourceItem source={s} />) }
            </div>
            <Button onclick={() => {}} loadWithPromise={savePromise} disabled={!edited} style="primary" width="full">Save</Button>
        </div>
    )
}