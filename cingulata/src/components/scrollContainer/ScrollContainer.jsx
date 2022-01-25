import React from "react";
import "./scrollcontainer.css"

export default class ScrollContainer extends React.Component {
    render() {
        return (
            <div className="ScrollContainer">
                { this.props.children }
            </div>
        )
    }
}