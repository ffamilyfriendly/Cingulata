import React, { useState } from "react"
import Modal from "../../modal/modal";
import { client } from "../../../App";
import { PermissionsManager } from "../../../lib/permissions";
import SelectBox from "../../selectbox/selectbox";
import HoldButton from "../HoldButton";

function ManageUserModal(props) {
    let perms = {}
    for(let p of Object.keys(props.perms.FLAGS)) {
        perms[p] = props.perms.hasPermission(p)
    }

    const [permissions, setPermissions] = useState(perms)

    const setPerms = () => {

        // init perm manager with no flag
        const permsToSet = new PermissionsManager(0)

        // loop thru perms and set flag accordingly to selected permissions
        for(let [perm, value] of Object.entries(permissions)) {
            if(value) {permsToSet.toggleBit(permsToSet.FLAGS[perm])}
        }

        // do request!
        client.req(`/user/${props.id}/flag`, { flag: permsToSet.flag }, { method: "PATCH" })
        .then(() => {
            props.setStatus("Perms set!", "success", 5)
        })
        .catch(e => {
            console.error(e)
            props.setStatus("Something went wrong.", "error", 5)
        })
    }

    const deleteUser = () => {
        client.req(`/user/${props.id}`, {}, { method:"DELETE" })
        .then(() => {
            props.setStatus(`${props.username} deleted!`, "success", 5)

            // do not show user in list.
            props.setShow(false)
            // do not show user modal (user is deleted, why would it be shown?)
            props.setShowModal(false)
        })
        .catch(e => {
            console.error(e)
            props.setStatus("Something went wrong.", "error", 5)
        })
    }

    return(
        <Modal onDismiss={() => { props.setShowModal(false) }} title={props.username}>
            { props.id === client.data.uid ? <div style={{"backgroundColor": "var(--error)", "justifyContent": "center"}} className="error full-width row"><p style={{"fontWeight": "bolder", "textAlign": "center"}}>This is you. Be careful!</p></div> : null }
            <h2>Perms</h2>
            <SelectBox state={setPermissions} items={perms} hasValues={true} />
            <br />
            <h2>Actions</h2>
            <br />
            <button onClick={setPerms} className="btn full-width btn-success">Save changes</button>
            <br /><br />
            <HoldButton delay={5} onClick={deleteUser} className="full-width btn-error">Delete {props.username}</HoldButton>
        </Modal>
    )
}

function User(props) {

    let [show, setShow] = useState(true)
    let [showModal, setShowModal] = useState(false)

    const openModal = () => {
        setShowModal(true)
    }

    return(
        <div style={{"display": show ? "flex" : "none"}} className="row">
            <div>
                <p>{props.username}</p>
                <small><b>Email:</b> {props.email}</small>
            </div>
            <button onClick={openModal} className="btn-settings">Manage</button>
            { showModal ? <ManageUserModal setStatus={props.setStatus} setShow={setShow} setShowModal={setShowModal} id={props.id} email={props.email} username={props.username} perms={props.perms} /> : null }
        </div>
    )
}

export default function ManageUsers(props) {

    let [showModal, setShowModal] = useState(false)
    let [users, setUsers] = useState([])

    const openModal = () => {
        getAllUsers()
        setShowModal(true)
    }

    const getAllUsers = () => {
        client.req("/user/all")
        .then(a => {
            if(a.status === 200) {
                const userArr = a.content.map(u => { return { id: u.id, email: u.email, username: u.username, perms: new PermissionsManager(u.flag) } })
                setUsers(userArr)
            }
        })
    }

    return(
        <div className="settingsRow">
            <p>Users</p>
            <button onClick={openModal} className="btn-settings"> Manage </button>
            { showModal ?
            
            <Modal onDismiss={() => { setShowModal(false) }} title="Manage Users">
                { users.map(u => { return <User setStatus={props.setStatus} key={u.id} id={u.id} email={u.email} username={u.username} perms={u.perms} /> }) }
            </Modal>
            :
            null
            }
        </div>
    )

}