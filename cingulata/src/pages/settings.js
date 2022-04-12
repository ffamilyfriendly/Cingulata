import { Link } from "react-router-dom"
import React, { useState } from "react"
import { client } from "../App"
import "./settings.css"
import Toggle from "../components/settings/Toggle";
import Modal from "../components/modal/modal";
import SelectBox from "../components/selectbox/selectbox";
import { PermissionsManager } from "../lib/permissions";

/* 
    These buttons will be availible by default thru the Application Settings menu. These will not be synced, saved in localstorage.
    Has 2 types: toggle & button.
    Both types use onToggle to dispatch their functions. The event is passed

    if type === "toggle":
        - value: default toggled value, string ("false"|"true").
        - onToggle: (e) => {} function to run when toggle state changes
    if type === "button"
        -  buttonText: text to be displayed on button
        - onToggle: (e) => {} same as above
*/
const settingDefaults = {
    "Info Screen": {
        value: "true",
        type: "toggle",
        onToggle: (v) => {
            window.settings.set("Info Screen", v)
        }
    },
    "Open Repo": {
        type: "button",
        buttonText: "Open on github",
        buttonType: "success",
        onToggle: (v) => {
            if(v) window.open("https://github.com/ffamilyfriendly/Cingulata", "_blank")
        }
    }
}

window.settings = {
    toggled: (val) => {
        return Boolean((localStorage.getItem(`settings_${val}`) ?? settingDefaults[val]?.value) === "true")
    },
    toggle: (val) => {
        let v = !Boolean((localStorage.getItem(`settings_${val}`) ?? settingDefaults[val]?.value) === "true")
        localStorage.setItem(`settings_${val}`, v)
    },
    set: (val, v) => {
        localStorage.setItem(`settings_${val}`, v)
    } 
}

function NotLoggedIn() {
    return(
        <div className="NotLoggedIn">
            <div>
                <h2>Not logged in</h2>
                <Link className="btn btn-primary full-width" to="/login">Login</Link>
            </div>
        </div>
    )
}

function UserSettings() {

    const logOut = async () => {
        await client.logout()
        window.location.reload()
    }

    return(
        <div className="settings UserSettings">
            <div className="settingsRow">
                <p>Log Out</p>
                <button onClick={logOut} className="btn-settings"> Log Out </button>
            </div>
        </div>
    )
}

function ApplicationSettings() {

    const settings = Object.keys(settingDefaults)

    return(
        <div className="settings ApplicationSettings">
            { settings.map(s => <div key={s} className="settingsRow"> <p> { s } </p> {settingDefaults[s].type === "toggle" ? <Toggle onToggle={settingDefaults[s].onToggle} toggled={window.settings.toggled(s)} /> : <button className="btn-settings" onClick={settingDefaults[s].onToggle}>{settingDefaults[s].buttonText || "click"}</button>} </div>) }
        </div>
    )
}

function AdminSettings() {
    return(
        <div className="SettingsSection">
            <h1>Administrator Settings</h1>
            <div className="settings AdminSettings">

            </div>
        </div>
    )
}

function NewInvite() {

    const [showModal, toggleModal] = useState(false)
    const [permissions, setPermissions] = useState({  })

    // Expires
    const [expires, setExpires] = useState(0)
    const [expiresEnabled, setExpiresEnabled] = useState(false)

    // Limit uses
    const [uses, setUses] = useState(0)
    const [usesEnabled, setUsesEnabled] = useState(false)

    const [invite, setInvite] = useState("")
    const [error, setError] = useState("")


    const openModal = () => {
        toggleModal(true)
        setInvite("")
    }

    const doRequest = () => {
        const requestData = {}

        if(usesEnabled) requestData["uses"] = Number(uses)
        if(expiresEnabled) requestData["expires"] = expires

        

        if(permissions) {
            const perms = new PermissionsManager(0)
            for(let [key, value] of Object.entries(permissions)) {
                if(value) perms.toggleBit(perms.FLAGS[key])
            }
            requestData["user_flag"] = perms.flag
        }

        client.req("/invite", requestData, { method: "POST" })
        .then(res => {
            if(res.content.url) setInvite(res.content.url)
        })
        .catch(err => {
            console.log(err)
        })

        console.log(requestData)
    }

    return(
        <div className="settingsRow">
            <p>New Invite</p>
            <button onClick={openModal} className="btn-settings"> Generate </button>
            { showModal ? 
                <Modal onDismiss={() => { console.log(permissions); toggleModal(false) }} title="New Invite">
                    
                    {invite ? 
                        <div>
                            <h2>Invite Created!</h2>
                            <p className="text-primary" onPointerDown={(ev) => { window.navigator.clipboard.writeText(invite.split("/").pop()); alert("Invite copied to clipboard") }}>{invite}</p>
                        </div>
                        :
                        <div>
                            <h2>Expires</h2>
                            {expiresEnabled ? <div className="row"> 
                                <p>Date</p>
                                <input onChange={(e) => { setExpires((new Date(e.target.value)).getTime() ) }} placeholder="code" className="input" type="date" />
                            </div> : null}
                            <div className="row"> 
                                <p>Enabled</p>
                                <Toggle onToggle={ (v) => { setExpiresEnabled(v) } } />
                            </div>

                            <h2>Limit Uses</h2>
                            {usesEnabled ? <div className="row"> 
                                <p>Uses</p>
                                <input onChange={(e) => { setUses(e.target.value) }} placeholder="code" className="input" min="1" type="number" />
                            </div> : null}
                            <div className="row"> 
                                <p>Enabled</p>
                                <Toggle onToggle={ (v) => { setUsesEnabled(v) } } />
                            </div>

                            { client.perms.hasPermission(client.perms.FLAGS.Administrator) ?
                                <div>
                                    <h2>Permissions</h2>
                                    <SelectBox name="permissions" state={setPermissions} items={Object.keys(client.perms.FLAGS)} />
                                </div>
                                :
                                null
                            }
                            <br />
                            <button onClick={doRequest} className="btn full-width btn-primary">Submit</button>
                        </div>
                    }
                </Modal>
                :
                null
            }
        </div>
    )
}

function InviteGenerator() {
    return(
        <div className="InviteGenerator">
            <h1>Invite Settings</h1>
            <div className="settings">
                <NewInvite />
            </div>
        </div>
    )
}

export default function Settings() {
    return(
        <div className="Settings lightly-padded">
            <div className="SettingsSection">
                <h1>User Settings</h1>
                {client.loggedIn ? <UserSettings /> : <NotLoggedIn />}
            </div>
            <div className="SettingsSection">
                <h1>Application Settings</h1>
                <ApplicationSettings />
            </div>
            { client.perms.hasPermission(client.perms.FLAGS.Administrator) ? <AdminSettings /> : null }
            { client.perms.hasPermission(client.perms.FLAGS.GenerateInvite) ? <InviteGenerator /> : null }
        </div>
    )
}

/* 
            <div>
                <h1 style={{lineHeight: "9rem"}} className="title-gigantic">404</h1>
                <p>Content Not Found</p>
                <div className="ltr-center-children">
                    <Link className="btn btn-primary btn-large full-width margin-medium" to="/b/root">
                        Go Home
                    </Link>
                </div>
            </div>

*/