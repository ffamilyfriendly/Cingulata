import React, { useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { client } from "../App";
import "./consume.css"

function AudioPlayer(props) {
    return (
        <div className="audioplayer">
            audio
        </div>
    )
}

export default function Consume(props) {
    const { id } = useParams()

    const [ entity, setEntity ] = useState()
    const [ failure, setFailure ] = useState(false)
    const [ redirect, setRedirect ] = useState()

    const getEntity = () => {
        client.req(`/content/${id}`)
        .then(res => {
            setEntity(res.content)
        })
        .catch(err => {
            console.error(err)
            if(err?.status === 404) {
                setRedirect("/b/root")
            }
            setFailure(true)
        })
    }

    if(!entity && !failure) getEntity()
    console.log(entity)

    let player = null

    if(entity) {
        switch(entity.entity_type) {
            case "Audio":
                player = <AudioPlayer />
            break;
        }
    }

    return(
        <div className="consume">
            { redirect ? <Navigate replace="true" to={redirect} /> : null }
            {
                player ? player : <div className="consume-noplayer"> <p>There is currently no player for media of this type</p> </div>
            }
        </div>
    )
}