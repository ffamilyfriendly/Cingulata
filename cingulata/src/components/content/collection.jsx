import React from "react"
import Image from "./image"
import "./collection.css"

export default function Collection(props) {
    const item = props.data
    return (
        <div onClick={(e) => { props.onClick(e) }} className="collection">
            <Image src={item.metadata.thumbnail} alt={item.metadata.name} />
            <div className="meta">
                <h2>{item.metadata.name}</h2>
                <p>{item.metadata.description}</p>
            </div>
        </div>
    )
}