import React, { useState } from "react";
import "./image.css"

export default function Image(props) {
    const alt = props.alt || "image"
    const [image, showImage] = useState(true)
    const [skeleton, showSkeleton] = useState(true)

    const load = (ev) => {
        if(ev.target.complete) showSkeleton(false)
    }

    return (
        <div className="image">
            { skeleton ? <div class="skeleton"></div> : null }
            { image ? <img onLoad={load} onError={ (e) => {showImage(false); showSkeleton(false)} } src={props.src} alt={alt} /> : <div className="fallback">{alt.includes(" ") ? alt.split(" ").map(i => i[0]).join("") : alt}</div> }
        </div>
    )
}