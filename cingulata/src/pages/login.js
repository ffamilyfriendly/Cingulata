import { client } from "../App";
import React from "react"
import { Link } from "react-router-dom";
import "./login.css"

export default function Login(props) {

    const doLogin = (e) => {
        const email = e.target.querySelector("[type=email]")
        const password = e.target.querySelector("[type=password]")

        client.login(email.value, password.value)
        .then(() => {
            window.location.href = "/"
        })
        .catch(e => {
            console.log(e)
            if(e.type === "HTTP_ERROR") props.setStatus({ time: 3, type:"error", text:"Network Error." })
            else props.setStatus({ time: 3, type:"error", text:"Sign in Failed." })
            console.warn(e)
        })
        e.preventDefault()
    }

    return(
        <div className="center">
            <form onSubmit={(e) => doLogin(e)}>
                    <div className="group">
                        <label htmlFor="email"> Email </label>
                        <div className="row">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 12.713l-11.985-9.713h23.97l-11.985 9.713zm0 2.574l-12-9.725v15.438h24v-15.438l-12 9.725z"/></svg>
                            <input name="email" placeholder="email" type="email"></input>
                        </div>
                    </div>
                    <div className="group">
                    <label htmlFor="password"> Password </label>
                        <div className="row">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M18 10v-4c0-3.313-2.687-6-6-6s-6 2.687-6 6v4h-3v14h18v-14h-3zm-5 7.723v2.277h-2v-2.277c-.595-.347-1-.984-1-1.723 0-1.104.896-2 2-2s2 .896 2 2c0 .738-.404 1.376-1 1.723zm-5-7.723v-4c0-2.206 1.794-4 4-4 2.205 0 4 1.794 4 4v4h-8z"/></svg>
                            <input minLength="5" name="password" placeholder="password" type="password"></input>
                        </div>
                    </div>
                    <input value="login" className="btn btn-large full-width btn-primary" type="submit"></input>
                    <Link to="/register">register</Link>
            </form>
        </div>
    )
}