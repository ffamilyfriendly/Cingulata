import React from "react";
import Icon from "../icon";
import "./status.css"

export default class StatusBar extends React.Component {

    constructor(props) {
        super(props)
        this.state = { class: "" }
    }

    componentDidMount() {
        this.setState({ class: "" })
    }

    render() 
        {
            
        if(this.props.time && !isNaN(this.props.time)) {
            setTimeout(() => {
                this.setState(s => s.class = " animate-out")
                if(this.props.setStatus) setTimeout(() => { this.props.setStatus(null); }, 1000 * 0.5) 
            }, this.props.time * 1000)
        }

        return (
            <div className={"status-bar" + this.state.class + ` ${this.props.type||"info"}`}>
                <div className="content">
                    <Icon type={this.props.type} />
                    <p>{this.props.text}</p>
                </div>
            </div>
        )
        }   
}

