import AuthedComponent from "@/components/AuthedComponent"
import StickyHeader from "@/components/StickyHeader"
import { UserPermissions } from "@/lib/api/managers/UserManager"
import GenericStyles from "@/styles/common.module.css"
import { SettingsSection } from ".."
import SettingsStyle from "@/styles/pages/settings.module.css"
import Button from "@/components/Button"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { SuccessResponse } from "@/lib/api/rest"
import { client } from "@/pages/_app"
import StatusBox from "@/components/StatusBox"
import { Styles } from "@/components/generic"
import Modal from "@/components/Modal"
import Input from "@/components/Input"

function ChangePassModal( props: { setShowModal: Dispatch<SetStateAction<Boolean>> } ) {
    const [ oldPass, setOldPass ] = useState<string>("")
    const [ newPass, setNewPass ] = useState<string>("")

    const [ loginPromise, setLoginPromise ] = useState<Promise<any>|null>()

    useEffect(() => {
        const prom = new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(null)
            }, 10000)
        })
        prom.then(() => { console.log("resolved!") })
        console.log("set login promise")
        setLoginPromise(prom)
    }, [])

    return (
        <Modal title="change password" onclose={() => { props.setShowModal(false) }}>
            <div className="stack">
                <Input label="Old Password" icon="password" type="password" setValue={setOldPass} value={oldPass}></Input>
                <Input label="New Password" icon="password" type="password" setValue={setNewPass} value={newPass}></Input>
                <Button disabled={false} width="full" style="primary" loadWithPromise={loginPromise}>aids</Button>
            </div>
        </Modal>
    )
}

export default function Home() {

    const [ error, setError ] = useState<{ title: string, text: string, style: Styles }|null>()
    const [ passwordModal, setPasswordModal ] = useState<Boolean>(false)

    const handlePromise = ( p: Promise<SuccessResponse>|undefined ) => {
        if(p) {
            p
            .then(() => {
                setError({ style: "success", title: "Done", text: "you are now logged out" })
                client.logOut()
            })
            .catch((e) => {
                setError({ style: "error", title: "Error", text: "something went wrong" })
                console.log(e)
            })
        }
    }

    return (
      <AuthedComponent displayInvalid={<p>not authed</p>} requires={UserPermissions.IsUser}>
        <StickyHeader title="User" link={{ title: "Settings", href: "/settings" }} />
        <main className={`${GenericStyles.centerHorizontal} ${GenericStyles.container}`}>
            { passwordModal ? <ChangePassModal setShowModal={setPasswordModal} /> : null }
            <div className={SettingsStyle.settings}>
                { error ? <StatusBox style={error.style} icon={ error.style === "error" ? "error" : "info" } title={error.title}>{error.text}</StatusBox> : null }
                <SettingsSection rows={ [
                    { icon: "user", label: "Log Out", onClick: () => { handlePromise(client.user?.logOut()) } },
                    { icon: "password", label: "Clear Sessions", onClick: () => { handlePromise(client.user?.clearSessions()) } }
                ] } />

                <SettingsSection rows={ [
                    { icon: "password", label: "Change Password", onClick: () => { setPasswordModal(true) } }
                ] } />
            </div>
        </main>
      </AuthedComponent>
    )
  }