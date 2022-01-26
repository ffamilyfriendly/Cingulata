import { Link } from "react-router-dom"
import React from "react"
import { client } from "../App"
import "./settings.css"
import Toggle from "../components/settings/Toggle";

const settingDefaults = {
    "Open Repo": {
        value: false,
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
    return(
        <div className="settings UserSettings">
            <div className="settingsRow">
                <p>Log Out</p>
                <Toggle onToggle={client.logOut} />
            </div>
        </div>
    )
}

function ApplicationSettings() {

    const settings = Object.keys(settingDefaults)

    return(
        <div className="settings ApplicationSettings">
            { settings.map(s => <div key={s} className="settingsRow"> <p> { s } </p> <Toggle onToggle={settingDefaults[s].onToggle} toggled={window.settings.toggled(s)} /> </div>) }
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

function InviteGenerator() {
    return(
        <div className="InviteGenerator">
            <h1>Invite Settings</h1>
            <div className="settings">
                <h3>Generate Invite</h3>

                <h3>Revoke Invite(s)</h3>
                <small>not yet implemented</small>
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