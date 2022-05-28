import React, { useState } from "react"
import Modal from "../../modal/modal"
import SearchBar from "../../search/SearchBar";
import Toggle from "../Toggle";
import { client } from "../../../App"
import HoldButton from "../HoldButton";
import { Link, Navigate } from "react-router-dom"

export function BaseEntityManager(props) {
    const [entityType, setEntityType] = useState(props.entityType||"NO")
    const [priv, setPrivate] = useState(props.private||false)
    const [position, setPosition] = useState(props.position||0)
    const [parent, setParent] = useState(props.parent||"root")
    const [next, setNext] = useState(props.next||"")
    
    const [search, setSearch] = useState(false)
    const [searchN, setNextSearch] = useState(false)

    const [ redirect, setRedirect ] = useState()

    const submitEntity = () => {
        let errs = ""
        if(!["Series", "Movie", "Category", "Audio"].includes(entityType)) errs += "invalid entity type"
        if(position < 0) errs += "position less than 0"
        
        if(errs.length > 0) return props.setStatus(errs, "error", 5)

        let url = "/content/entity"
        let body = { parent, flag: priv ? 1 : 0, entity_type: entityType, position: Number(position), next }
        if(props.edit) {
            url = `/content/entity/${props.id}`
            body = { parent, flag: priv ? 1 : 0, position: Number(position), next }
        }

        client.req(url, body, { method: props.edit ? "PATCH" : "POST" })
        .then((e) => {
            if(!props.edit && e.content) {
                setRedirect(`/edit/${e.content}`)
            } else props.setStatus("saved entity data", "success", 5)
        })
        .catch(e => {
            props.setStatus("Something went wrong. (check logs)", "error", 5)
            console.error(e)
        })
    }

    const deleteEntity = () => {
        client.req(`/content/${props.id}/entity`, {}, { method: "DELETE" })
        .then(() => {
            setRedirect("/settings")
            props.setStatus("Entity deleted", "success", 5)
        })
        .catch((e) => {
            props.setStatus("Something went wrong. (check logs)", "error", 5)
            console.error(e)
        })
    }

    return(
        <div className="baseEntity">
            { redirect ? <Navigate replace="true" to={redirect}/> : null }
            { !props.edit ? <div className="row">
                <p>Entity type</p>
                <select onChange={(ev) => {setEntityType(ev.target.value)}} value={entityType}>
                    <option disabled value="NO" key="NO">select a type</option>
                    { ["Audio", "Movie", "Series", "Category"].map(i => <option key={i}>{i}</option>) }
                </select>
            </div> : null}
            <div className="row">
                <p>Private</p>
                <Toggle toggled={priv} onToggle={(v) => setPrivate(v)} />
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
            {props.edit ? <HoldButton delay={2} onClick={() => deleteEntity()} className="full-width btn-error">Delete</HoldButton> : null}
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
        <button onClick={openModal} className="btn-settings"> Generate </button>
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

function EntitiesList(props) {
    const [ entities, setEntities ] = useState()
    const [ failed, setFailed ] = useState(false)
    const [ deleteMode, setDeleteMode ] = useState(false)

    const fetchEntities = () => {
        client.req("/content/all/children")
        .then(res => {
            setEntities(res.content)
        })
        .catch(e => {
            props.setStatus("Something went wrong. (check logs)", "error", 5)
            setFailed(true)
            console.error(e)
        })
    }

    if(!entities && !failed) fetchEntities()

    const toggleDeleteMode = () => {
        setDeleteMode(!deleteMode)
    }

    const deleteEntity = (id) => {
        client.req(`/content/${id}/entity`, {}, { method: "DELETE" })
        .then(() => {
            setEntities( entities.filter(e => e.id !== id) )
        })
        .catch((e) => {
            props.setStatus("Could not delete entity. (check logs)", "error", 5)
            console.error(e)
        })
    }

    return (
        <div>
            <button className={"btn full-width " + (deleteMode ? "btn-error" : "btn-success") } onClick={toggleDeleteMode}> turn {deleteMode ? "off" : "on"} delete mode </button>
            { entities ? entities.map(e => {
                return (
                    <div key={e.id} className="row">
                        <div className="entityinfo">
                            <p>{e.metadata ? e.metadata.name : e.id}</p>
                            <p><b>type:</b> {e.entity_type}</p>
                        </div>
                        {
                            deleteMode ?
                            <a onClick={() => deleteEntity(e.id)} href="#delete" className="btn-settings">Delete</a>
                            :
                            <Link className="btn-settings" to={`/edit/${e.id}`}>Manage</Link>
                        }
                    </div>
                )
            }) : null }
        </div>
    )
}

function ManageContent(props) {

    const [modal, showModal] = useState(false)

    const openModal = () => {
        showModal(true)
    }

    return (
        <div className="settingsRow">
            <p>Existing Content</p>
            <button onClick={openModal} className="btn-settings"> Manage </button>
            {
                modal ? 
                <Modal onDismiss={() => { showModal(false) }} title="Manage Entities">
                    <EntitiesList setStatus={props.setStatus} />
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
                <ManageContent setStatus={props.setStatus} />
            </div>
        </div>
    )
}