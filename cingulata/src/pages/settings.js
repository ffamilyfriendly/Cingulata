import { Link } from "react-router-dom"
import React from "react"
import { client } from "../App"
import "./settings.css"
import Toggle from "../components/settings/Toggle";
import InviteGenerator from "../components/settings/sections/InviteGenerator";
import ManageUsers from "../components/settings/sections/ManageUsers";
import ContentSettings from "../components/settings/sections/ContentSettings";

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
    },
    get: (key) => {
        return localStorage.getItem(`settings_${key}`)
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

function AdminSettings(props) {
    return(
        <div className="SettingsSection">
            <h1>Administrator Settings</h1>
            <div className="settings AdminSettings">
                <ManageUsers setStatus={props.setStatus} />
            </div>
        </div>
    )
}

export default function Settings(props) {
    console.log(client.perms.hasPermission(client.perms.FLAGS.GenerateInvite), client.perms.flag)
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
            { client.perms.hasPermission("Administrator") ? <AdminSettings setStatus={props.setStatus} /> : null }
            { client.perms.hasPermission("GenerateInvite") ? <InviteGenerator /> : null }
            { client.perms.hasPermission("ManageContent") ? <ContentSettings setStatus={ props.setStatus } /> : null }
        </div>
    )
}