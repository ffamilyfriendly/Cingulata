

import React, { useState } from "react";
import { client } from "../App";
import { useParams, Navigate } from "react-router-dom";
import Collection from "../components/content/collection";
import "./browse.css"

export default function Browse(props) {
    const { id } = useParams()
    const [ items, setItems ] = useState()
    const [ failed, setFailed ] = useState(false)
    const [ redirect, setRedirect ] = useState()

    if(items && items[0].parent !== id) {
        setItems(null)
        setRedirect(null)
    }

    const fetchItems = () => {
        client.req(`/content/${id}/children`)
        .then((r) => {
            setItems(r.content.sort( ( a,b ) => a.position - b.position ).filter(a => a.metadata))
        })
        .catch(e => {
            props.setStatus("could not get content (check logs)", "error", 5)
            setFailed(true)
        })
    }

    if(!failed && !items) fetchItems()

    const handleOnClick = (i) => {
        console.log(i)
        switch(i.entity_type) {
            case "Category":
                setRedirect(`/b/${i.id}`)
            break;
        }
    }

    return (
        <div className="browse">
            { redirect ? <Navigate replace="true" to={redirect} /> : null }
            { items ?
                items.map(i => <Collection onClick={() => handleOnClick(i)} key={i.id} allowExtended={true} data={i} />)
                :
                <p>loading</p>
            }
        </div>
    )
}