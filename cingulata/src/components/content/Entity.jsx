import React from "react";
import "./entity.css"

export default class Entity extends React.Component {

    componentDidMount() {

    }

    render() {
        return(
            <div className="Entity">
                { this.props.data.type === "Category" ? <div></div> : <img alt={this.props.data.metadata.name} src={this.props.data.metadata.thumbnail} /> }
            </div>
        )
    }
}