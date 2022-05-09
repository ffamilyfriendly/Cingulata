import React, { useState } from "react"
import Modal from "../../modal/modal"
import SearchBar from "../../search/SearchBar";
import Toggle from "../Toggle";
import "./ContentSettings.css"
import { client } from "../../../App"

/*
    parent: <opt> def "root"
    flag: entityflag, public = 0, private = 1 << 0 (eq 1)
    entity_type: Audio, Movie, Series, Category
    position: <opt> def 0
    next: <opt> id of next content after playback for current is done (may only be Series, Movie, or Audio)

*/
function BaseEntityManager(props) {
    const [entityType, setEntityType] = useState(props.entityType||"NO")
    const [priv, setPrivate] = useState(props.private||false)
    const [position, setPosition] = useState(props.position||0)
    const [parent, setParent] = useState(props.parent||"root")
    const [next, setNext] = useState(props.next||"")
    
    const [search, setSearch] = useState(false)
    const [searchN, setNextSearch] = useState(false)

    const submitEntity = () => {
        let errs = ""
        if(!["Series", "Movie", "Category", "Audio"].includes(entityType)) errs += "invalid entity type"
        if(position < 0) errs += "position less than 0"
        
        if(errs.length > 0) return props.setStatus(errs, "error", 5)

        client.req("/content/entity", { parent, flag: priv ? 1 << 0 : 0, entity_type: entityType, position: Number(position), next }, { method: "POST" })
        .then((e) => {
            if(e.content) {
                window.location = `/edit/${e.content}`
            }
        })
        .catch(e => {
            props.setStatus("Something went wrong. (check logs)", "error", 5)
            console.error(e)
        })
    }

    return(
        <div className="baseEntity">
            <div className="row">
                <p>Entity type</p>
                <select onChange={(ev) => {setEntityType(ev.target.value)}} value={entityType}>
                    <option disabled value="NO" key="NO">select a type</option>
                    { ["Audio", "Movie", "Series", "Category"].map(i => <option key={i}>{i}</option>) }
                </select>
            </div>
            <div className="row">
                <p>Private</p>
                <Toggle toggled={priv} handleClick={(v) => setPrivate(v)} />
            </div>
            <div className="row">
                <p>Position</p>
                <input onChange={(ev) => setPosition(ev.target.value)} type="number" min="0" value={position} />
            </div>
            <div className="row">
                <p>Parent</p>
                <button onClick={() => setSearch(true)} className="btn-settings">{parent}</button>
                { search ? <SearchBar onSelected={(e) => { setParent(e.id); setSearch(false) }} dismiss={() => setSearch(false)} type={["Category"]} /> : null }
            </div>
            <div className="row">
                <p>Next</p>
                <button onClick={() => setNextSearch(true)} className="btn-settings">{next||"<set next>"}</button>
                { searchN ? <SearchBar onSelected={(e) => { setNext(e.id); setNextSearch(false) }} dismiss={() => {setNextSearch(false); setNext("")}} type={["Movie", "Audio"]} /> : null }
            </div>

            <button onClick={submitEntity} className="btn btn-success full-width">Submit</button>
        </div>
    )
}

function NewContent(props) {

    const [modal, showModal] = useState(false)

    const openModal = () => {
        showModal(true)
    }

    return(
        <div className="settingsRow">
        <p>New Content</p>
        <button onClick={openModal} className="btn-settings"> Manage </button>
            { modal ? 
                <Modal onDismiss={() => { showModal(false) }} title="New Entity">
                    <BaseEntityManager setStatus={props.setStatus} />
                </Modal>
                :
                null 
            }
        </div>
    )
}

export default function ContentSettings(props) {
    return(
        <div className="InviteGenerator">
            <h1>Content Settings</h1>
            <div className="settings">
                <NewContent setStatus={props.setStatus} />
            </div>
        </div>
    )
}