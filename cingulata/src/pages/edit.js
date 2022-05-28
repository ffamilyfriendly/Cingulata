import React, { useState } from "react"
import { useParams } from "react-router"
import { client } from "../App"
import { BaseEntityManager } from "../components/settings/sections/ContentSettings"
import MetaDataManager from "../components/settings/sections/MetadataSettings"
import SourcesManager from "../components/settings/sections/SourcesManager"

export default function Edit(props) {

    const { id } = useParams()

    let [entity, setEntity] = useState(null)
    let [wentWrong, setWentWrong] = useState(false)

    let [metadataMessage, setMetadataMessage] = useState(true)

    const getContent = () => {
        if(!id) return props.setStatus("no id passed", "error", 5)
        client.req(`/content/${id}`)
        .then(res => {
            if(res.content) setEntity(res.content)
        })
        .catch(e => {
            console.error(e)
            // this is needed so the code does not go into a loop due to the status change that happens during setStatus. Error might happen if user tries to edit something without credentials / entity does not exist
            setWentWrong(true)
            props.setStatus("something went wrong.", "error", 5)
        })
    }

    if(wentWrong) {
        return (
            <div>
                <p>Something went wrong. It's possible this entity is deleted or you do not have permissions enough to edit it.</p>
            </div>
        )
    }

    let metadata;
    if(!entity && !wentWrong) getContent()
    else metadata = entity.metadata

    const showSources = entity && !["Series", "Category"].includes(entity.entity_type)

    return(
        <div>
            <div>
                <h1>Base Entity</h1>
                {entity ? <small><b>Entity type: </b>{entity.entity_type}</small> : null}
                { entity ? <BaseEntityManager setStatus={props.setStatus} edit={true} id={id} entityType={entity.entity_type} private={Boolean(entity.flag)} position={entity.position} parent={entity.parent} next={entity.next}  /> : null}
            </div>
            <div>
                <h1>Metadata</h1>
                { (metadata || !metadataMessage ) ? null : 
                    <div style={{"backgroundColor": "var(--info)", "justifyContent": "center"}} className="error full-width row">
                        <p>This entity has no metadata. Metadata will be created when you click submit below</p>
                    </div>      
                }
                { entity ? <MetaDataManager parent={entity.id} thumbnail={metadata?.thumbnail} banner={metadata?.banner} description={metadata?.description} name={metadata?.name} rating={Number(metadata?.rating)} age_rating={metadata?.age_rating} language={metadata?.language} year={Number(metadata?.year)} setStatus={props.setStatus} edit={(metadata || !metadataMessage )} onSubmit={() => setMetadataMessage(false)} /> : null}
            </div>
            <div>
                {showSources ? <h1>Sources</h1> : null}
                {showSources ? <SourcesManager setStatus={props.setStatus} parent={entity.id} sources={entity?.sources} /> : null }
            </div>
            <div className="spacer"/>
        </div>
    )
}