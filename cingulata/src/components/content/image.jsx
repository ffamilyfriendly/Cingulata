import React, { useState } from "react";
import "./image.css"

export default function Image(props) {
    const alt = props.alt || "image"
    const [image, showImage] = useState(true)
    return (
        <div className="image">
            { image ? <img onError={ (e) => {showImage(false)} } src={props.src} alt={alt} /> : <div className="fallback">{alt.includes(" ") ? alt.split(" ").map(i => i[0]).join("") : alt}</div> }
        </div>
    )
}