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

export default function Login() {

    const { push } = useRouter()

    const [ email, setEmail ] = useState<string>()
    const [ password, setPassword ] = useState<string>()
    const [ loading, setLoading ] = useState<Promise<any>|null>()
    const [ error, setError ] = useState<{ label: string, text: string }>()

    const onClick = useCallback(async () => {
        if(!email || !password) return

        const loginPromise = client.login(email, password)
        .then(() => {
            push("/")
        })
        .catch((e: FailResponse) => {
            setError({ label: e.type, text: e.displayText })
        })
        setLoading(loginPromise)
    }, [ loading, email, password ])

    return (
        <div className={styles.center + " stack"}>
            <div className="stack">
                <h1 style={{ "textAlign": "center" }}>Sign In</h1>

                { error ?
                    <StatusBox title={`${error.label} error`} icon="error" style="error">{error.text}</StatusBox>:
                    null
                }

                <div className={`${styles.surface}  ${styles.container}`}>
                    <div className="stack">
                        <Input setValue={setEmail} value={email as string} label="Email" icon="user" placeholder="Email" validate={validateEmail}></Input>
                        <Input setValue={setPassword} value={password as string} label="Password" icon="password" type="password" placeholder="Password" validate={validatePassword}></Input>

                        <Button loadWithPromise={loading} onclick={onClick} disabled={false} style="primary" width="full">
                        Login
                        </Button>
                        <Button onclick="/auth/register" style="tertiary" width="wide">
                            Register
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}