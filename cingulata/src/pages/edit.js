import React, { useState } from "react"
import { useParams } from "react-router"
import { client } from "../App"
import { BaseEntityManager } from "../components/settings/sections/ContentSettings"

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
    let [metadata, setMetadata] = useState({})
    let [sources, setSources] = useState([])

    const getContent = () => {
        if(!id) return props.setStatus("no id passed", "error", 5)
        client.req(`/content/${id}`)
        .then(res => {
            console.log(res.content)
            setEntity(res.content)
        })
        .catch(e => {
            console.error(e)
            props.setStatus("something went wrong.", "error", 5)
        })
    }

    if(!entity) getContent()

    return(
        <div>
            <div>
                <h1>Base Entity</h1>
                { entity ? <BaseEntityManager setStatus={props.setStatus} edit={true} id={id} entityType={entity.entity_type} private={Boolean(entity.flag)} position={entity.position} parent={entity.parent} next={entity.next}  /> : null}
            </div>
        </div>
    )
}