import React from "react";
import "./navbar.css"

export default class NavBar extends React.Component {
    render() {
        return(
            <div className="NavBar">
                { this.props.children }
            </div>
        )
    }
}