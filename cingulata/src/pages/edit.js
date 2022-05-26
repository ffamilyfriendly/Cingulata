import React, { useState } from "react"
import { useParams } from "react-router"
import { client } from "../App"
import { BaseEntityManager } from "../components/settings/sections/ContentSettings"
import MetaDataManager from "../components/settings/sections/MetadataSettings"

/*
    const [entityType, setEntityType] = useState(props.entityType||"NO")
    const [priv, setPrivate] = useState(props.private||false)
    const [position, setPosition] = useState(props.position||0)
    const [parent, setParent] = useState(props.parent||"root")
    const [next, setNext] = useState(props.next||"")
*/

export default function Edit(props) {

    const { id } = useParams()

    let [entity, setEntity] = useState(null)
    let [metadata, setMetadata] = useState(null)
    let [sources, setSources] = useState([])

    let [metadataMessage, setMetadataMessage] = useState(true)

    const getContent = () => {
        if(!id) return props.setStatus("no id passed", "error", 5)
        client.req(`/content/${id}`)
        .then(res => {
            if(res.content) setEntity(res.content)
            if(res.content.metadata) setMetadata(res.content.metadata)
        })
        .catch(e => {
            console.error(e)
            props.setStatus("something went wrong.", "error", 5)
        })
    }
    console.log(metadata)
    if(!entity) getContent()

    return(
        <div>
            <div>
                <h1>Base Entity</h1>
                { entity ? <BaseEntityManager setStatus={props.setStatus} edit={true} id={id} entityType={entity.entity_type} private={Boolean(entity.flag)} position={entity.position} parent={entity.parent} next={entity.next}  /> : null}
            </div>
            <div>
                <h1>Metadata</h1>
                { (metadata || !metadataMessage ) ? null : 
                    <div style={{"backgroundColor": "var(--info)", "justifyContent": "center"}} className="error full-width row">
                        <p>This entity has no metadata. Metadata will be created when you click submit below</p>
                    </div>      
                }
                { metadata ? <MetaDataManager parent={entity.id} thumbnail={metadata.thumbnail} banner={metadata.banner} description={metadata.description} name={metadata.name} rating={Number(metadata.rating)} age_rating={metadata.age_rating} language={metadata.language} year={Number(metadata.year)} setStatus={props.setStatus} edit={(metadata || !metadataMessage )} onSubmit={() => setMetadataMessage(false)} /> : null}
                <spacer/>
            </div>
        </div>
    )
}