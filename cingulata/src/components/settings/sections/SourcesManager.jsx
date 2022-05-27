import React, { useState } from "react"
import SearchBar from "../../search/SearchBar";
import Toggle from "../Toggle";
import { client } from "../../../App"
import "./sources.css"
import Icon from "../../icon";

// List that allows drag and drop re-ordering. 
function ReorderList(props) {

    let spacerIterator = -1
    let selectedPosition = null
    let selectedSource = null

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
            <div onDragEnter={enter} onDragLeave={exit} key={props.position} id={props.position} className="reorder-spacer hidden"></div>
        )
    }

    function ReorderElement(props) {

        let last

        function handleEnd(source) {
            console.log("yo")
            selectedSource = source
            console.log(selectedPosition, selectedSource)
            if(last) last.classList.add("hidden")
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
        elemlist.push(<Spacer position={spacerIterator} />, <ReorderElement source={child.props.source} key={child.id}> { child } </ReorderElement>)
    }
    spacerIterator += 1
    elemlist.push(<Spacer position={spacerIterator}/>)

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
    let [sources, setSources] = useState([ { parent:"a", path:"/media/cum.mp4", position: 52, id:"a" }, { parent:"a", path:"aa", position: 2, id:"b" }, { parent:"a", path:"a", position: 50, id:"c" }, { parent:"a", path:"a", position: 0, id:"d" } ])
    const tSources = sources.sort((a,b) => a.position - b.position)
    console.log(sources, props.sources)
    return(
        <div className="baseEntity">
            <ReorderList>
                {tSources.map(s => <div source={s} key={s.id} className="source row"><p className="btn-settings">{s.path}</p></div>)}
            </ReorderList>
        </div>
    )
}
