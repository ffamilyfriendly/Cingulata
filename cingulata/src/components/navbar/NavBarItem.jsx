import React from "react";
import Icon from "../icon";
import "./navbar.css"

export default class NavBarItem extends React.Component {
    render() {
        return(
            <div className={"NavBarItem" + ( this.props.disabled ? " disabled" : "" )}>
                <Icon type={this.props.type} />
                <p>{this.props.text}</p>
            </div>
        )
    }
}