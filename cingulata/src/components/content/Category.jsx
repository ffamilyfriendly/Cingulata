import React from "react";
import { client } from "../../App";
import ScrollContainer from "../scrollContainer/ScrollContainer";
import Entity from "./Entity";
import "./category.css"

export default class Category extends React.Component {

    constructor(props) {
        super(props)
        this.state = { children: [ ...props.children||[] ] }
    }

    componentDidMount() {
        if(this.props.id) {
            client.getChildren(this.props.id)
            .then(r => {
                const contents = []
                for(let [key, value] of r) {
                    console.log(value)
                    contents.push(<Entity key={key} data={value} />)
                }

                console.log(contents)

                this.setState(s => {
                    s.children = contents
                    return s
                })
            })
        }
    }

    render() {
        return (
            <div className={("category " + (this.props.size || "normal"))}>
                <h2> {this.props.title} </h2>
                <ScrollContainer>
                    { this.state.children }
                </ScrollContainer>
            </div>
        )
    }
}