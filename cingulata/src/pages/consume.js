import React, { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { client } from "../App";
import "./consume.css"

import AudioPlayer from "../components/playback/audioplayer";

const getLength = (sources) => {
    let len = 0
    for (let src of sources) {
        len += src[1].length
    }
    return len
}

const sourceUrl = (src) => {
    return `${client.base}/content/source/${src}/media${client.loggedIn ? `?key=${client.token}` : ""}`
}

const cleanUpFileName = (name) => {
    if(!name) return "lol"
    const chunks = name.split("/")
    const fileName = chunks[chunks.length - 1].substr(0,chunks[chunks.length - 1].length - 4)
    return fileName
}


/*
    VideoPlayer will be a lot easier than the audio player as we do not need to deal with multiple media sources.
    source[0] = the movie
    source[1-forwards] = subtitles
*/
function VideoPlayer(props) {

    useEffect(() => {
        const p = document.getElementById("video-player")
        let interval = setInterval(() => {
            client.postLastWatched(props.entity.id, p.currentTime)
            .then(() => {
                console.log(`posted time ${p.currentTime} for ${props.entity.id}`)
            })
            .catch(err => {
                console.error(`failed to post watchtime for ${props.entity.id}`, err)
            })
        }, 5000)

        client.getLastWatched(props.entity.id)
        .then(lw => {
            if(lw) p.currentTime = lw
        })
        .catch(err => {
            console.error("could not get last watched", err)
        })

        return () => { clearInterval(interval) }
    })

    return (
        <div className="movie">
            <video id="video-player" crossOrigin="anonymous" controls>
                <source src={sourceUrl(props.entity.sources[0].id)} />
                {props.entity.sources.slice(1).map(s => <track label={ cleanUpFileName(s.path) } kind="subtitles" src={ sourceUrl(s.id) } /> )}
            </video>
        </div>
    )
}

export default function Consume(props) {
    const { id } = useParams()

    const [ entity, setEntity ] = useState()
    const [ failure, setFailure ] = useState(false)
    const [ redirect, setRedirect ] = useState()

    const getEntity = () => {
        client.getCollection(id)
        .then(res => {
            res.duration = getLength(res.sources)
            setEntity(res)
        })
        .catch(err => {
            console.error(err)
            if(err?.status === 404) {
                setRedirect("/b/root")
            }
            setFailure(true)
        })
    }

    useEffect(() => {
        if(!entity && !failure) getEntity()
    })

    let player = null

    if(entity && entity.sources.size) {
        switch(entity.type) {
            case "Audio":
                player = <AudioPlayer entity={entity} />
            break;
            case "Movie":
                player = <VideoPlayer entity={entity} />
            break;
            default:
                player = null
            break;
        }
    }

    return(
        <div className="consume">
            { redirect ? <Navigate replace="true" to={redirect} /> : null }
            {
                player ? player : <div className="consume-noplayer"> <p>{ entity?.sources.size === 0 ? "This entity has no media sources and can therefore not be played. Sorry about that" : "There is currently no player for media of this type"}</p> </div>
            }
        </div>
    )
}