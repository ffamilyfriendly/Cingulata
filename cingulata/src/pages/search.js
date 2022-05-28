import React from "react"
import SearchBar from "../components/search/SearchBar"

export default function SearchPage() {

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
            <SearchBar dismiss={() => {}} onSelected={handleSelected} type={["Audio", "Movie", "Series"]} />
        </div>
    )
}