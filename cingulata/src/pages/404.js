import { Link } from "react-router-dom"
import React from "react"

export default function FourZeroFour() {
    return(
        <div className="center">
            <div>
                <h1 style={{lineHeight: "9rem"}} className="title-gigantic">404</h1>
                <p>Content Not Found</p>
                <div className="ltr-center-children">
                    <Link className="btn btn-primary btn-large full-width margin-medium" to="/">
                        Go Home
                    </Link>
                </div>
            </div>
        </div>
    )
}