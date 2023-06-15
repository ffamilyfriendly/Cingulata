import AuthedComponent from "@/components/AuthedComponent"
import StickyHeader from "@/components/StickyHeader"
import { UserPermissions } from "@/lib/api/managers/UserManager"
import GenericStyles from "@/styles/common.module.css"
import { SettingsSection } from ".."
import SettingsStyle from "@/styles/pages/settings.module.css"
import Button from "@/components/Button"
import { useState } from "react"
import { SuccessResponse } from "@/lib/api/rest"
import { client } from "@/pages/_app"
import StatusBox from "@/components/StatusBox"
import { Styles } from "@/components/generic"

export default function Home() {

    const [ error, setError ] = useState<{ title: string, text: string, style: Styles }|null>()

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
            <div className={SettingsStyle.settings}>
                { error ? <StatusBox style={error.style} icon={ error.style === "error" ? "error" : "info" } title={error.title}>{error.text}</StatusBox> : null }
                <SettingsSection rows={ [
                    { icon: "user", label: "Log Out", onClick: () => { handlePromise(client.user?.logOut()) } },
                    { icon: "password", label: "Clear Sessions", onClick: () => { handlePromise(client.user?.clearSessions()) } }
                ] } />

                <SettingsSection rows={ [
                    { icon: "password", label: "Change Password" }
                ] } />
            </div>
        </main>
      </AuthedComponent>
    )
  }