import React, {useState} from "react"
import SearchBar from "../components/search/SearchBar"
import { Navigate } from "react-router-dom"

export default function SearchPage() {

    const [ redirect, setRedirect ] = useState()

    const handleSelected = (ev) => {
        switch(ev.entity_type) {
            case "Category":
                window.location.href = `/b/${ev.id}`
            break;
            default :
                window.location.href = `/consume/${ev.id}`
            break;
        }
    }

    return(
        // <SearchBar onSelected={(e) => { setParent(e.id); setSearch(false) }} dismiss={() => setSearch(false)} type={["Category"]} />
        <div className="search">
            { redirect ? <Navigate replace="true" to={redirect}/> : null }
            <SearchBar dismiss={() => { setRedirect("/") }} onSelected={handleSelected} type={["Audio", "Movie", "Series"]} />
        </div>
    )
}