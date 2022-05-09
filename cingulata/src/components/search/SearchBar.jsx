import React, { useState } from "react";
import Icon from "../icon";
import "./SearchBar.css"
import { client } from "../../App";
import Collection from "../content/collection";

let rateLimit = 0
let gv = ""

export default function SearchBar(props) {
    const [ results, setResults ] = useState([])

    let timeout = null

    const updateResults = (v) => {
        if(!v) v = gv
        if(Date.now() < rateLimit) {
            gv = v
            if(!timeout) timeout = setTimeout(() => { updateResults(null); }, rateLimit - Date.now())
            return null
        }

        if(timeout) clearTimeout(timeout)
        rateLimit = Date.now() + 500
        
        let results = []

        for(let i = 0; i < props.type.length; i++ ) {
            const type = props.type[i]
            client.req(`/content/search?name=${v}&description=${v}${type ? `&entity_type=${type}` : ""}`)
            .then(v => {
                if(v.status === 200) {
                    if(props.type.includes("Category")) {
                        v.content.push({
                            id: "root",
                            parent: "root",
                            creator_uid: 69,
                            flag: 0,
                            entity_type: "Category",
                            metadata: {
                                banner: "",
                                thumbnail: "",
                                language: "",
                                rating: 0,
                                year: 0,
                                name: "root",
                                description: "This is the root folder. It does not really exist but is the parent of all other entities"
                            }
                        })
                    }
                    results.push(...(v.content))
                    if(i === props.type.length-1) setResults(results)
                }
            })
        }
    }

    return(
        <div className="searchbar-container">
            <div className="searchbar-content">
                <div className="searchbar-row">
                    <div className="search-input"> <Icon type="search" /> <input onKeyUp={(ev) => updateResults(ev.target.value) } placeholder="Search" type="search"></input></div>
                    <button onClick={() => props.dismiss()} >Exit</button>
                </div>
                <div className="results">
                    { results.map( i => <Collection onClick={() => { props.onSelected(i) }} key={i.id} data={i} /> ) }
                </div>
            </div>
        </div>
    )
}