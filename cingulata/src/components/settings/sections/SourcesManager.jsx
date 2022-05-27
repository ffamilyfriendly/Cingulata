import React, { useState } from "react"
import { client } from "../../../App"
import "./sources.css"
import Icon from "../../icon";
import Modal from "../../modal/modal";

// List that allows drag and drop re-ordering. 
function ReorderList(props) {

    let spacerIterator = -1
    let selectedPosition = null

    function Spacer(props) {

        const enter = () => {
            document.getElementById(props.position).classList.remove("hidden")
            selectedPosition = props.position
        }

        const exit = () => {
            document.getElementById(props.position).classList.add("hidden")
            //selectedPosition = null
        }

        return (
            <div onDragEnter={enter} onDragLeave={exit} id={props.position} className="reorder-spacer hidden"></div>
        )
    }

    function ReorderElement(props) {

        let last

        function handleEnd() {
            if(last) last.classList.add("hidden")
            if(props.handlePositionChanged) props.handlePositionChanged(selectedPosition)
        }

        // ironic name since this is only used for touch. Cba to change lol
        function mouseMoved(ev) {
            const [clientX, clientY] = [ev.clientX||ev.changedTouches[0].clientX, ev.clientY||ev.changedTouches[0].clientY]
            const hit = document.elementFromPoint(clientX, clientY)
            // if mouse/touch is over 
            if(hit.classList.contains("reorder-spacer") && hit.id) {
                last = hit
                selectedPosition = hit.id
                hit.classList.remove("hidden")
            } else if(last) {
                selectedPosition = null
                last.classList.add("hidden")
            }
        }

        return (
            <div onDragEnd={() => handleEnd(props.source)} key={Math.random()} draggable="true" className="reorderelement row">
                <Icon onTouchMoved={mouseMoved} onMouseUp={() => handleEnd(props.source)} type="dots" />
                {props.children}
            </div>
        )
    }

    // add a "drop zone indicator" before each element.
    // this will only show when an element is hovered over its list position
    let elemlist = []
    for(let child of props.children) {
        spacerIterator += 1
        elemlist.push(<Spacer key={spacerIterator} position={spacerIterator} />, <ReorderElement handlePositionChanged={child.props.positionchanged} source={child.props.source} key={child.props.id}> { child } </ReorderElement>)
    }
    spacerIterator += 1
    elemlist.push(<Spacer key={spacerIterator} position={spacerIterator}/>)

    return (
        <div className="reorderlist">
            { elemlist }
        </div>
    )
}

/*
    pub parent: String,
    pub path: String,
    pub position: Option<u16>
*/

function NewSource(props) {
    const [showModal, setShowModal] = useState(false)
    const [path, setPath] = useState("/media/")

    const create = () => {
        //props.setStatus
        client.req("/content/source", { path, parent: props.parent }, { method: "POST" })
        .then(() => {
            window.location.reload()
        })
        .catch(e => {
            setShowModal(false)
            props.setStatus("Something went wrong (check logs)", "error", 5)
            console.error(e)
        })
    }

    return (
        <div>
            <div className="row"><p>New source</p> <button onClick={() => setShowModal(true)} className="btn-settings">Create</button></div>
            { showModal ?
                <Modal title="New Source" onDismiss={() => setShowModal(false)}>
                    <div className="row"><p>Path</p> <input onChange={(e) => setPath(e.target.value)} value={path} type="text"></input></div>
                    <button onClick={create} className="btn btn-success full-width">Create</button>
                </Modal> : null
            }
        </div>
    )
}

function EditSource(props) {
    const [showModal, setShowModal] = useState(false)
    const [path, setPath] = useState(props.path)
    const [modalText, setModalText] = useState(props.path)

    function savePath() {
        setPath(modalText)
        client.req(`/content/source/${props.id}`, { path: modalText }, { method: "PATCH" })
        .then(() => {
            window.location.reload()
        })
        .catch((e) => {
            props.setStatus("Something went wrong. (check logs)", "error", 5)
            console.error(e)
        })
    }

    return (
        <div>
        <a className="btn-settings" onClick={() => setShowModal(true)} href="#asd">{path}</a>
        { showModal ?
            <Modal onDismiss={() => { setShowModal(false) }} title="Edit source">
                <div className="row">
                    <p>Path</p>
                    <input type="text" onChange={(ev) => { setModalText(ev.target.value) }} value={modalText}></input>
                </div>
                <button onClick={savePath} className="btn btn-success full-width">Save</button>
            </Modal> : null
        }
        </div>
    )
}

// onSubmit, edit
export default function SourcesManager(props) {
    let [sources, setSources] = useState(props.sources)
    const tSources = sources.sort((a,b) => a.position - b.position)

    const positionChanged = (source, pos) => {
        pos = Math.max(pos - 1, 0)
        source.position = pos
        let tempList = tSources.filter(v => v.id !== source.id)

        // this line of code is... yea
        // it works at least lol 
        let test = [ ...tempList.splice(0,pos).reverse().map((i,j) => { i.position = pos - j - 1; return i }), source, ...tempList.map((i, j) => {i.position = pos + j + 1; return i}) ]

        tempList = test.sort((a,b) => a.position - b.position)

        // does one call for every source no matter what changes are made if any. This is extremely dumb so it matches my intelect
        for(let _src of tempList) {
            client.req(`/content/source/${_src.id}`, { position: _src.position }, { method: "PATCH" })
            .catch((e) => {
                console.error(`failed to change position of source ${_src.id}`, e)
            })
        }

        // update state 
        setSources(tempList)
    }

    // had to make this to make react stop fucking complaining about me passing a function to a div attr
    function SourceElement(props) {

        const deleteSource = (id) => {
            // /content/ID/source
            client.req(`/content/${id}/source`, {}, { method: "DELETE" })
            .then(res => {
                props.setStatus("Deleted source.", "success", 3)
                let temp = tSources.filter(a => a.id !== id)
                setSources(temp)
            })
            .catch(e => {
                props.setStatus("Could not remove source. (check logs)", "error", 5)
                console.log(e)
            })
        }

        return (
            <div className="source row">
                <EditSource setStatus={props.setStatus} id={props.source.id} path={props.source.path} />
                <a onClick={() => deleteSource(props.source.id)} href="#bin"><Icon type="bin" /></a>
            </div>
        )
    }

    // <div positionchanged={(e) => positionChanged(s.id,e)} source={s} key={s.id} className="source row"><p className="btn-settings">{s.path}</p></div>

    return(
        <div className="baseEntity">
            <NewSource parent={props.parent} setStatus={props.setStatus} />
            <ReorderList>
                {tSources.map(s => <SourceElement setStatus={props.setStatus} key={s.id} positionchanged={(e) => positionChanged(s, e)} source={s} />)}
            </ReorderList>
        </div>
    )
}
