import React, { useState } from "react"
import { client } from "../../../App"
import "./sources.css"
import Icon from "../../icon";

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

// onSubmit, edit
export default function SourcesManager(props) {
    let [sources, setSources] = useState([ { parent:"a", path:"/media/test/test/test/assdasd.mpg", position: 1, id:"a" }, { parent:"a", path:"b", position: 2, id:"b" }, { parent:"a", path:"c", position: 30, id:"c" }, { parent:"a", path:"d", position: 41, id:"d" } ])
    const tSources = sources.sort((a,b) => a.position - b.position)

    const positionChanged = (source, pos) => {
        // do api shit firstly
        // endpoint is /content/source/<id> btw
        // takes struct shown above but everything is an option so just send position as the body 

        source.position = pos
        let tempList = [source]
        // handle re-order of elements
        for(let i = 0; i < tSources.length; i++) {
            let elem = tSources[i]
            if(elem.id != source.id) {
                elem.position = i
                tempList.push(elem)
            }
        }

        tempList = tempList.sort((a,b) => a.position - b.position)

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
                let temp = tSources.filter(a => a.id != id)
                setSources(temp)
            })
            .catch(e => {
                props.setStatus("Could not remove source. (check logs)", "error", 5)
                console.log(e)
            })
        }

        return (
            <div className="source row">
                <p className="btn-settings">{props.source.path}</p>
                <a onClick={() => deleteSource(props.source.id)} href="#bin"><Icon type="bin" /></a>
            </div>
        )
    }

    // <div positionchanged={(e) => positionChanged(s.id,e)} source={s} key={s.id} className="source row"><p className="btn-settings">{s.path}</p></div>

    return(
        <div className="baseEntity">
            <ReorderList>
                {tSources.map(s => <SourceElement setStatus={props.setStatus} key={s.id} positionchanged={(e) => positionChanged(s, e)} source={s} />)}
            </ReorderList>
        </div>
    )
}
