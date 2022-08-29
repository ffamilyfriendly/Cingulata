import React from "react";
import "./modal.css"

export default class Modal extends React.Component {

    render() {

        const modalId = Math.random()

        const handleClick = (ev) => {
            if(this.props.onDismiss && ev.target.className === "Modal container" && ev.target.id === modalId.toString()) this.props.onDismiss()
        }

        return(
            <div id={modalId} onClick={handleClick} className="Modal container">
                <div className="main">
                    <div className="header">
                        <h1>{this.props.title||"Modal"}</h1>
                    </div>
                    <div className="content">
                        { this.props.children }
                    </div>

                    {
                        this.props.buttons ?
                        <div className="modal-buttons">
                            {this.props.buttons.map(b => {
                                return <button key={ b.text } className={"btn " + b.class} onClick={b.onClick}>{b.text}</button>
                            })}
                        </div>
                        : null
                    }
                </div>
            </div>
        )
    }
}