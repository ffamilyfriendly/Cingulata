import React from "react";
import Modal from "../../modal/modal";
import SelectBox from "../../selectbox/selectbox";
import { PermissionsManager } from "../../../lib/permissions";
import { client } from "../../../App";
import { useState } from "react";
import Toggle from "../Toggle";

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

export default function InviteGenerator() {
    return(
        <div className="InviteGenerator">
            <h1>Invite Settings</h1>
            <div className="settings">
                <NewInvite />
            </div>
        </div>
    )
}