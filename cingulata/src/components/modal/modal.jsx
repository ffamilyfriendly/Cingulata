import React from "react";
import "./modal.css"

export default class Modal extends React.Component {
    
    render() {

        const handleClick = (ev) => {
            if(this.props.onDismiss && ev.target.className === "Modal container") this.props.onDismiss()
        }

        return(
            <div onClick={handleClick} className="Modal container">
                <div className="main">
                    <div className="header">
                        <h1>{this.props.title||"Modal"}</h1>
                    </div>
                    <div className="content">
                        { this.props.children }
                    </div>
                </div>
            </div>
        )
    }
}