import { client } from "../App";
import React from "react"
import { useState } from "react";
import "./login.css"

export default function Register() {
    const params = new URLSearchParams(window.location.search)

    const [invite, setInvite] = useState(params.get("inv"));

    const doLogin = (e) => {
        const email = e.target.querySelector("[type=email]")
        const password = e.target.querySelector("[type=password]")
        const invite = e.target.querySelector("[name=invite]") || document.createElement("input")

        client.register(email.value, password.value, invite.value)
        .then(() => {
            window.location.href = "/login"
        })
        .catch(e => {
            alert("Sign in failed. Correct password/username?")
            console.warn(e)
        })
        console.log(client.server)
        e.preventDefault()
    }

    const showInv = async () => {
        console.log(client.server)
        return await client.getServerConfig().invite_only || params.has("inv")
    }

    return(
        <div className="center">
            <form onSubmit={(e) => doLogin(e)}>
                    <div className="group">
                        <label for="email"> Email </label>
                        <div className="row">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 12.713l-11.985-9.713h23.97l-11.985 9.713zm0 2.574l-12-9.725v15.438h24v-15.438l-12 9.725z"/></svg>
                            <input name="email" placeholder="email" type="email"></input>
                        </div>
                    </div>
                    <div className="group">
                        <label for="password"> Password </label>
                        <div className="row">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M18 10v-4c0-3.313-2.687-6-6-6s-6 2.687-6 6v4h-3v14h18v-14h-3zm-5 7.723v2.277h-2v-2.277c-.595-.347-1-.984-1-1.723 0-1.104.896-2 2-2s2 .896 2 2c0 .738-.404 1.376-1 1.723zm-5-7.723v-4c0-2.206 1.794-4 4-4 2.205 0 4 1.794 4 4v4h-8z"/></svg>
                            <input minLength="5" name="password" placeholder="password" type="password"></input>
                        </div>
                    </div>
                    {showInv() ? <div className="group">
                        <label for="invite"> Invite </label>
                        <div className="row">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M21.155 8.64c-.909 1.519-2.327 3.067-4.097 3.004-.413.706-.852 1.677-1.339 2.803l-1.312.553c.936-2.343 2.231-4.961 3.698-6.994-.67.529-1.746 1.637-2.662 2.783-1.098-1.828-.3-3.691.973-5.179.021.641.359 1.196.601 1.475-.087-.53-.114-1.489.195-2.351.718-.732 1.364-1.271 2.113-1.76-.083.478.08 1.026.262 1.361.024-.49.224-1.43.521-1.84.924-.727 2.332-1.373 3.892-1.495-.081.973-.436 2.575-1.024 3.604-.515.404-1.221.68-1.791.833.493.089 1.031.077 1.494-.001-.269.743-.552 1.428-.998 2.276-.679.468-1.578.732-2.203.825.46.187 1.272.245 1.677.103zm-13.841 3.805l.645.781 4.773-2.791-.668-.768-4.75 2.778zm6.96-.238l-.668-.767-4.805 2.808.645.781 4.828-2.822zm4.679.007c-.421.203-.851.341-1.286.398-.12.231-.246.494-.377.773l.298.342c.623.692.459 1.704-.376 2.239-.773.497-5.341 3.376-6.386 4.035-.074-.721-.358-1.391-.826-1.948-.469-.557-6.115-7.376-7.523-9.178-.469-.6-.575-1.245-.295-1.816.268-.549.842-.918 1.43-.918.919 0 1.408.655 1.549 1.215.16.641-.035 1.231-.623 1.685l1.329 1.624 7.796-4.446c1.422-1.051 1.822-2.991.93-4.513-.618-1.053-1.759-1.706-2.978-1.706-1.188 0-.793-.016-9.565 4.475-1.234.591-2.05 1.787-2.05 3.202 0 .87.308 1.756.889 2.487 1.427 1.794 7.561 9.185 7.616 9.257.371.493.427 1.119.15 1.673-.277.555-.812.886-1.429.886-.919 0-1.408-.655-1.549-1.216-.156-.629.012-1.208.604-1.654l-1.277-1.545c-.822.665-1.277 1.496-1.377 2.442-.232 2.205 1.525 3.993 3.613 3.993.596 0 1.311-.177 1.841-.51l9.427-5.946c.957-.664 1.492-1.781 1.492-2.897 0-.745-.24-1.454-.688-2.003l-.359-.43zm-7.933-10.062c.188-.087.398-.134.609-.134.532 0 .997.281 1.243.752.312.596.226 1.469-.548 1.912l-5.097 2.888c-.051-1.089-.579-2.081-1.455-2.732l5.248-2.686zm2.097 13.383l.361-.905.249-.609-3.449 2.017.645.781 2.194-1.284z"/></svg>
                            <input onChange={ e => setInvite(e.target.value) } value={invite} name="invite" type="text" placeholder="invite"></input>
                        </div>
                    </div> : null}
                    <input value="register" className="btn btn-large full-width btn-primary" type="submit"></input>
            </form>
        </div>
    )
}