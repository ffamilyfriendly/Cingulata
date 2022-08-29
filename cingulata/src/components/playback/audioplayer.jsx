import React, { useEffect, useState } from "react";
import Icon from "../../components/icon";
import Modal from "../../components/modal/modal";
import { client } from "../../App";
import { canDownload, downloadFiles } from "../../lib/downloadManager";
import Collection from "../content/collection";

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

    for (let source of sources.values()) {
        if(seconds < tally + source.length) {
            source.tally = tally
            fsource = source
            xseconds = seconds - tally
            break;
        }
        tally += source.length
    }
    return { source: fsource, secondsIn: xseconds }
}

const findStartOfSource = (sources, fsource) => {
    let tally = 0
    for(let source of sources) {
        if(source[1].id !== fsource.id) tally += source[1].length
        else break;
    }
    return tally
}

const findNextSource = (sources, csource) => {
    for(let i = 0; i < sources.length; i++) {
        const source = sources[i]
        if(source.id === csource.id) return sources[i+1]
    }
}

const audio = new Audio()
let reqWatch = 0

function AudioSettings(props) {
    const { skipIncrament, setSkipIncrament, playbackSpeed, setPlaybackSpeed, setSettingsModal } = props

    const setSkip = (v) => {
        const value = Number(v.target.value)
        if(isNaN(value) || value < 0) return
        localStorage.setItem("settings_audio_skipIncrament", value)
        setSkipIncrament(value)
    }

    const setSpeed = (v) => {
        const value = Number(v.target.value)
        if(isNaN(value) || value < 0 || value > 2) return
        localStorage.setItem("settings_audio_playbackSpeed", value)
        setPlaybackSpeed(value)
    }

    return (
        <Modal onDismiss={() => { setSettingsModal(false) }} title="Audio Settings">
            <div className="row">
                <p>Skip Incraments</p>
                <input type="number" value={skipIncrament} onChange={setSkip} />
            </div>
            <div className="row">
                <p>Playback Speed</p>
                <input type="number" value={playbackSpeed} onChange={setSpeed} />
            </div>
        </Modal>
    )
}

function DownloadModal(props) {
    const { setDownloadModal, entity } = props
    const [ fileDetails, setFileDetails ] = useState(false)
    const [ error, setError ] = useState(false)
    const [ downloadProgress, setDownloadProgress ] = useState(0)

    useEffect(() => {
        client.req(`/content/${entity.id}/info`)
        .then(async res => {
            const canDo = await canDownload(res.content.file_size)
            if(!canDo.enough) return setError(`Cannot download this entity. Missing ${(canDo.delta/1048576).toFixed(2) * -1}Mb`)
            setFileDetails(res.content)
        })
        .catch(err => {
            console.error(err)
        })

        
    }, [])
    console.log("re-render")
    const doDownload = () => {
        if(!fileDetails || error) return
        downloadFiles(Array.from(entity.sources.values()).map(v => sourceUrl(v.id)), entity.id, { chunkSize: 50 })
        
    }
    return (
        <Modal buttons={[ { text: "Delete", class: "btn-disabled", onClick: () => { alert("ah") } }, { text: "Download", class: `btn-${(fileDetails && !error) ? "primary" : "disabled"}`, onClick: doDownload } ]} title={"Download " + entity.metadata.name} onDismiss={() => { setDownloadModal(false) }}>
            { error ? <div style={{"backgroundColor": `var(--error)`, "justifyContent": "center"}} className="error full-width row"><p style={{"fontWeight": "bolder", "textAlign": "center"}}>{error}</p></div> : null}
            <Collection data={entity} />
            <progress className="prog progress-primary" max="100" value={downloadProgress} min="0"></progress>
        </Modal>
    )
}

export default function AudioPlayer(props) {
    const { entity } = props

    // states
    let [playback, setPlayback] = useState(-1)
    let [playing, setPlaying] = useState(false)
    let [source, setSource] = useState(null)

    let [skipIncrament, setSkipIncrament] = useState(Number(localStorage.getItem("settings_audio_skipIncrament")||"15"))
    let [playbackSpeed, setPlaybackSpeed] = useState(Number(localStorage.getItem("settings_audio_playbackSpeed")||"1"))

    let [sourcesModal, setSourcesModal] = useState(false)
    let [settingsModal, setSettingsModal] = useState(false)
    let [downloadModal, setDownloadModal] = useState(false)

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

    const setActiveSource = (pb) => {
        let { source, secondsIn } = findActiveSource(entity.sources, pb)
        audio.src = sourceUrl(source.id)
        setSource(source)
        return secondsIn
    }

    const hotSetPlayback = (src) => {
        setPlayback(src)
        let secs = setActiveSource(src)
        play(secs)
    }

    const play = (seconds) => {
        if(!playing) setPlaying(true)
        audio.play()
        .then(() => {
            audio.currentTime = seconds
        })
        .catch(err => {
            console.error("something went wrong with playing", err)
        })
    }

    // Will automatically find the source that should play regarding to the time set in "playback".
    // This code is real fucking ugly but it works it seems like
    const _play = () => {
        const secondsIn = setActiveSource(playback)
        play(secondsIn)
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
            reqWatch += 1
            if(!audio.paused && source) {
                setPlayback(source.tally + audio.currentTime)
                if((reqWatch % 5)  === 0) client.postLastWatched(entity.id, source.tally + audio.currentTime)
            }
        }, 1000)

        audio.onended = () => { const nextSource = findNextSource(entity.sources, source); nextSource ? hotSetPlayback(nextSource.tally) : console.log("handle track ended")}

        return () => clearInterval(interval)
    })

    useEffect(() => {

        if(playback < 0) {
            client.getLastWatched(entity.id)
            .then(lw => {
                if(lw) setPlayback(lw)
            })
            .catch(_err => {
                setPlayback(0)
            })
        }
    })

    audio.playbackRate = playbackSpeed

    const SourcesModal = () => {

        let sources = []

        if(entity) {
            entity.sources.forEach(src => {
                sources.push(
                    <div onClick={ () => { hotSetPlayback(findStartOfSource(entity.sources, src)); setSourcesModal(false) } } key={src.id} className="row" >
                        <p className={ (source && src.id === source.id) ? "currentSource" : null }>  {cleanUpFileName(src.path)}  </p>
                    </div>
                )
            })
        }

        return (
            <Modal title="Sources" onDismiss={() => { setSourcesModal(false) }}>
                { sources }
            </Modal>
        )
    }

    return (
        <div className="audioplayer">
            { sourcesModal ? <SourcesModal/> : null }
            { settingsModal ? <AudioSettings setSettingsModal={setSettingsModal} skipIncrament={skipIncrament} setSkipIncrament={setSkipIncrament} playbackSpeed={playbackSpeed} setPlaybackSpeed={setPlaybackSpeed} /> : null }
            { downloadModal ? <DownloadModal setDownloadModal={setDownloadModal} entity={entity} /> : null }
            <div className="audi-ui">
                <div className="audiobook-controls-bottom-row">
                        <button onClick={() => { setDownloadModal(true) }}> 
                            <Icon type="download2" />
                        </button>
                        <button onClick={() => { setSourcesModal(true) }}>
                            <Icon type="list" />
                        </button>
                        <button onClick={() => { setSettingsModal(true) }}>
                            <Icon type="settings2" />
                        </button>
                </div>

                <div className="audiobook-thumbnail-container">
                    <img className="audiobook-img" alt={entity.metadata.name} src={entity.metadata.thumbnail} />
                </div>
                <div className="audiobook-control-group">

                    <div>
                        <div className="audiobook-slider">
                            <p className="audiobook-source-name">{ source ? cleanUpFileName(source.path) : "not playing"}</p>
                            <input type="range" min="0" onChange={(ev) => {hotSetPlayback(Number(ev.target.value))}} value={playback} max={entity.duration} />
                            <div className="audiobook-times">
                                <p>{formatTime(playback)}</p>
                                <p>{formatTime(entity.duration)}</p>
                            </div>
                        </div>

                        <div className="audiobook-control-row">
                            <button onClick={() => bumpPlayback(skipIncrament * -1)} className="audiobook-btn skip">
                                <Icon type="reverse"></Icon>
                                <p>{skipIncrament}</p>
                            </button>
                            <button onClick={togglePlay} className="audiobook-btn audiobook-play-button">
                                { playing ? <Icon type="pause"/> : <Icon type="play"/> }
                            </button>
                            <button onClick={() => bumpPlayback(skipIncrament)} className="audiobook-btn skip">
                                <Icon type="forwards"></Icon>
                                <p>{skipIncrament}</p>
                            </button>
                        </div>
                    </div>



                </div>
            </div>
        </div>
    )
}