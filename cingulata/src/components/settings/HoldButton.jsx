import React, { useState } from "react";
import "./holdbutton.css"

export default function HoldButton(props) {

    let [progress, setProgress] = useState()
    let [started, setStarted] = useState()
    let [fin, setFinished] = useState(false)

    const finished = () => {
        if(fin) return
        let ended = Date.now()
        if(!started) return

        const diff = (ended - started) / 1000

        if(diff < props.delay) return setProgress("")
        setFinished(true)
        props.onClick()
    }

    const handleDown = () => {
        if(fin) return
        setStarted(Date.now())
        setProgress("progress")
    }

    const handleUp = () => finished()

    return(
        <div onMouseDown={handleDown} onTouchStart={handleDown} onMouseUp={handleUp} onTouchEnd={handleUp} className={props.className + " holdbutton noselect"}>
            <div style={{"animationDuration": `${props.delay}s`}} className={"blinder " + progress}></div>
            <p>{props.children}</p>
        </div>
    )
}