import React, { useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { client } from "../App";
import Icon from "../components/icon";
import "./consume.css"

const getLength = (sources) => {
    return new Promise((resolve,reject) => {
        let reqs = []
        for(let source of sources) {
            reqs.push(client.req(`/content/source/${source.id}/info`))
        }
        Promise.all(reqs).then(values => {
            let len = 0
            for(let res of values) {
                len += res?.content?.playback_length
            }
            resolve(len)
        })
        .catch(e => {
            reject(e)
        })
    })
}

const pad = (nr) => {
    let p = nr.toString()
    if(p.length === 1) p = "0" + p
    return p
}

const formatTime = (secs) => {
    let hours = secs / 60 / 60
    let minutes = (hours % 1) * 60
    let seconds = (minutes % 1) * 60
    return(`${pad(Math.floor(hours))}:${pad(Math.floor(minutes))}:${pad(Math.floor(seconds))}`)
}

const sourceUrl = (src) => {
    return `${client.base}/content/source/${src}/media${client.loggedIn ? `?key=${client.token}` : ""}`
}

/*
            <audio controls>
                <source src={sourceUrl(entity.sources[0].id)} />
            </audio>
*/

function AudioPlayer(props) {
    const { entity } = props

    // states
    let [playback, setPlayback] = useState(0)

    console.log(entity)

    document.title = `${entity?.metadata?.name} » Armadillo`

    for (const src of entity.sources) {
        console.log(sourceUrl(src.id))
    }

    const bumpPlayback = (change) => {
        console.log(playback)
        setPlayback((v) => {
            let _playback = v += change
            if(_playback < 0) _playback = 0
            if(_playback > entity.duration) _playback = entity.duration
            return _playback
        })
    }

    return (
        <div className="audioplayer">
            <img className="audiobook-img" src={entity.metadata.thumbnail} />
            <div className="audiobook-control-group">

                <div className="audiobook-slider">
                    <input type="range" min="0" onChange={(ev) => {setPlayback(Number(ev.target.value))}} value={playback} max={entity.duration} />
                    <div className="audiobook-times">
                        <p>{formatTime(playback)}</p>
                        <p>{formatTime(entity.duration)}</p>
                    </div>
                </div>

                <div className="audiobook-control-row">
                    <button onClick={() => bumpPlayback(-15)} className="audiobook-btn skip">
                        <Icon type="reverse"></Icon>
                        <p>15</p>
                    </button>
                    <button className="audiobook-btn audiobook-play-button">
                        <Icon type="play"></Icon>
                    </button>
                    <button onClick={() => bumpPlayback(15)} className="audiobook-btn skip">
                        <Icon type="forwards"></Icon>
                        <p>15</p>
                    </button>
                </div>
            </div>

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
            getLength(res.content.sources)
            .then(len => {
                res.content.duration = len
                setEntity(res.content)
            })
            .catch(err => {
                console.error("failed to get content len", err)
            })
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

    let player = null

    if(entity) {
        switch(entity.entity_type) {
            case "Audio":
                player = <AudioPlayer entity={entity} />
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