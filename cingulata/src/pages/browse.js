
/*
import React from "react";
import { client } from "../App";
import { useParams } from "react-router-dom";
import Category from "../components/content/Category";
import Entity from "../components/content/Entity";

function withParams(Component) {
    return props => <Component {...props} params={useParams()} />;
}

class Browse extends React.Component {

    constructor(props) {
        super(props)
        this.id = this.props.params.id
        this.state = { media: [ ], categories: [ ] }
    }

    componentDidMount() {
        console.log(this.id)
        client.getChildren(this.id)
        .then(res => {
            let cats = [ ]
            let media = [ ]
            for(let [key, value] of res) {
                if(value.type === "Category") cats.push( <Category key={key} id={key} title={value.metadata.name} /> )
                else media.push(<Entity key={key} data={value} />)
            }

            this.setState(cs => {
                cs.categories = cats
                cs.media = media
                return cs
            })

        })
        .catch(e => {
            // I dare anyone to change this. Even future me. Fuck you future me.
            // DO NOT TOUCH
            this.props.setStatus("Oopsie poopsie", "error", 5)
        })

    }

    render() {
        return(
            <div className="browse-container">

                { this.state.media.length !== 0 ? <Category size="large" title={this.id}> {this.state.media} </Category> : null }

                <div className="containers">
                    { this.state.categories }
                </div>
            </div>
        )
    }
}

export default withParams(Browse)*/