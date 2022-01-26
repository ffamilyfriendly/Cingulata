import React from "react";
import "./toggle.css"

export default class Toggle extends React.Component {

    constructor(props) {
        super(props)
        this.state = { toggled: this.props.toggled }
        this.handleClick = this.handleClick.bind(this)
    }

    handleClick() {
        if(this.props.onToggle) this.props.onToggle(!this.state.toggled)
        this.setState({ toggled: !this.state.toggled, currentlyAnimating: true })
    }

    render() {
        return (
            <div onClick={this.handleClick} className="Toggle">
                <div className={"ToggleContent" + (this.state.toggled ? " ToggleOn" : "")}>
                    <div className="ToggleBody"></div>
                    <div className="ToggleHead"></div>
                </div>
            </div>
        )
    }
}