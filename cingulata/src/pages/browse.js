

import React, { useState } from "react";
import { client } from "../App";
import { useParams } from "react-router-dom";
import Collection from "../components/content/collection";

function withParams(Component) {
    return props => <Component {...props} params={useParams()} />;
}

export default function Browse(props) {
    const { id } = useParams()
    const [ items, setItems ] = useState()
    const [ failed, setFailed ] = useState(false)

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
    console.log(items)

    return (
        <div className="browse">
            { items ?
                items.map(i => <Collection key={i.id} allowExtended={true} data={i} />)
                :
                <p>loading</p>
            }
        </div>
    )
}