import Button from "@/components/Button"
import { Result } from "@/components/generic"
import Input from "@/components/Input"
import StatusBox from "@/components/StatusBox"
import { FailResponse } from "@/lib/api/rest"
import styles from "@/styles/common.module.css"
import { useRouter } from "next/router"
import { useCallback, useEffect, useState } from "react"
import { client } from "../_app"

const validatePassword = (value: string) => {
    let rv: Result = { ok: true, message: "" }
    
    if(value.length < 5) {
        rv.ok = false
        rv.message = "password must be 5 characters or more"
    }

    return rv
}

const validateEmail = (value: string) => {
    let rv: Result = { ok: true, message: "" }
    
    if(!/^(.+)@(.+)\.(.+)$/gi.test(value)) {
        rv.ok = false
        rv.message = "invalid email"
    }

    return rv
}

const validateInvite = (value: string) => {
    let rv: Result = { ok: true, message: "" }
    
    if(value.length < 5) {
        rv.ok = false
        rv.message = "invite must be 5 characters or more"
    }

    return rv
}

export default function Register() {

    const { push } = useRouter()

    const [ email, setEmail ] = useState<string>()
    const [ password, setPassword ] = useState<string>()
    const [ invite, setInvite ] = useState<string>()

    const [ loading, setLoading ] = useState(false)
    const [ inviteOnly, setInviteOnly ] = useState<boolean|undefined>()
    const [ error, setError ] = useState<{ label: string, text: string }>()

    const onClick = useCallback(async () => {
        if(!email || !password) return
        if(inviteOnly && !invite) return

        setLoading(true)
        client.register(email, password, invite)
        .then(() => {
            setLoading(false)
            push("/auth/login")
        })
        .catch((e: FailResponse) => {
            setError({ label: e.type, text: e.displayText })
            setLoading(false)
        })
    }, [ loading, email, password ])

    useEffect(() => {

        const urlParams = new URLSearchParams(window.location.search)
        if(urlParams.has("invite")) {
            setInvite(urlParams.get("invite") as string)
        }

        client.hostConfig
            .then((config) => {
                if(config.invite_only) setInviteOnly(true)
            })
    }, [])

    return (
        <div className={styles.center + " stack"}>
            <div className="stack">
                <h1 style={{ "textAlign": "center" }}>Create Account</h1>

                <div className={ typeof inviteOnly == "undefined" ? styles.skeleton : ""}>
                    <StatusBox title={ inviteOnly ? "invite only" : "Public instance"} icon="info" style="info"> <p>{ inviteOnly ? "This instance is invite only" : "This instance is public" }</p> </StatusBox>
                </div>

                { error ?
                    <StatusBox title={`${error.label} error`} icon="error" style="error"> {error.text} </StatusBox>:
                    null
                }

                <div className={`${styles.surface}  ${styles.container}`}>
                    <div className="stack">
                        <Input setValue={setEmail} value={email as string} label="Email" icon="user" placeholder="Email" validate={validateEmail}></Input>
                        <Input setValue={setPassword} value={password as string} label="Password" icon="password" type="password" placeholder="Password" validate={validatePassword}></Input>
                        <Input setValue={setInvite} value={invite as string} label="Invite" icon="ticket" placeholder="invite" validate={validateInvite}></Input>

                        <Button loading={loading} onclick={onClick} disabled={false} style="primary" width="full">
                        Register
                        </Button>
                        <Button onclick="/auth/login" style="tertiary" width="wide">
                            Sign in
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}