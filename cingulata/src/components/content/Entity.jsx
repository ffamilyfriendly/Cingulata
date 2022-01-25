import React from "react";
import "./entity.css"

export default class Entity extends React.Component {

    componentDidMount() {

    }

    render() {
        return(
            <div className="Entity">
                <img src={this.props.data.metadata.thumbnail} />
            </div>
        )
    }
}