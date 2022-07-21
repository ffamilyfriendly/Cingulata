import React, { useEffect, useState } from "react";
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
            let srcLen = {}
            for(let res of values) {
                srcLen[res?.content.api_entity.id] = res?.content?.playback_length
                len += res?.content?.playback_length
            }
            resolve({len, srcLen})
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

const cleanUpFileName = (name) => {
    if(!name) return "lol"
    const chunks = name.split("/")
    const fileName = chunks[chunks.length - 1].substr(0,chunks[chunks.length - 1].length - 4)
    return fileName
}

const findActiveSource = (sources, seconds) => {
    let fsource = null
    let xseconds = 0
    let tally = 0
    for(let source of sources) {
        if(seconds < tally + source.duration) {
            source.tally = tally
            fsource = source
            xseconds = seconds - tally
            break; 
        }
        tally += source.duration
    }
    return { source: fsource, secondsIn: xseconds }
}

const audio = new Audio()

function AudioPlayer(props) {
    const { entity } = props

    // states
    let [playback, setPlayback] = useState(0)
    let [playing, setPlaying] = useState(false)
    let [source, setSource] = useState(null)

    document.title = source ? `${cleanUpFileName(source.path)} » ${entity?.metadata?.name}` : `${entity?.metadata?.name} » Armadillo`

    const bumpPlayback = (change) => {
        setPlayback((v) => {
            let _playback = v += change
            if(_playback < 0) _playback = 0
            if(_playback > entity.duration) _playback = entity.duration
            audio.currentTime += change
            return _playback
        })
    }

    // Will automatically find the source that should play regarding to the time set in "playback".
    // This code is real fucking ugly but it works it seems like
    const _play = () => {
        let { source, secondsIn } = findActiveSource(entity.sources, playback)
        audio.src = sourceUrl(source.id)
        audio.play()
        .then(() => {
            audio.currentTime = secondsIn
            setSource(source)
        })
        .catch(err => {
            console.error("something went wrong with playing", err)
        })
    }

    // Will toggle playing.
    // Will automatically start from where "playback" is set
    const togglePlay = () => {
        setPlaying((p) => {
            let _p = !p
            if(_p) {
                _play()
            } else {
                audio.pause()
            }
            return _p
        })
    }

    // effect to keep the track-bar on screen in focus
    useEffect(() => {
        let interval = setInterval(() => {
            if(!audio.paused && source) {
                setPlayback(source.tally + audio.currentTime)
            }
        }, 1000)

        audio.onended = () => _play()

        return () => clearInterval(interval)
    })



    return (
        <div className="audioplayer">

            <img className="audiobook-img" src={entity.metadata.thumbnail} />
            <div className="audiobook-control-group">

                <div className="audiobook-controls-top-row">
                    <p>t</p>
                    <p>p</p>
                </div>

                <div>
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
                        <button onClick={togglePlay} className="audiobook-btn audiobook-play-button">
                            { playing ? <Icon type="pause"/> : <Icon type="play"/> }
                        </button>
                        <button onClick={() => bumpPlayback(15)} className="audiobook-btn skip">
                            <Icon type="forwards"></Icon>
                            <p>15</p>
                        </button>
                    </div>
                </div>

                <div className="audiobook-controls-bottom-row">
                    <p>t</p>
                    <p>p</p>
                    <p>x</p>
                    <p>d</p>
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
                res.content.duration = len.len
                for(let [key, value] of Object.entries(len.srcLen)) {
                   res.content.sources.map(e => {
                       if(e.id == key) e.duration = value
                       return e
                   })
                }

                res.content.sources.sort((a,b) => a.position - b.position)

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