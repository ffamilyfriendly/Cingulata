import React from "react";
import "./selectbox.css"
import Toggle from "../settings/Toggle";

export default class SelectBox extends React.Component {
    
    constructor(props) {
        super(props)

        let obj = {}
        for(let item of props.items)
            obj[item] = false

        this.state = obj
    }

    handleChange(item, v) {
        this.setState({[item]: v}, () => {
            if(this.props.state) this.props.state(this.state)
        })
    }

    render() {
        return(
            <div className="SelectBox">
                { Object.keys(this.state).map(item => {
                    return(
                        <div key={item} className="item row">
                            <p>{item}</p>
                            <Toggle onToggle={(v) => { this.handleChange(item, v) }} />
                        </div>
                    )
                }) }
            </div>
        )
    }
}