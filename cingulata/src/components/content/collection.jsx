import React, { useEffect, useState } from "react"
import Image from "./image"
import "./collection.css"
import { client } from "../../App"
import Icon from "../icon"

// 300 - 48

function UserRating(props) {

    let [ rating, setRating ] = useState(0)

    if(!rating) {
        setInterval(() => {
            setRating(props.rating)
        }, 300) 
    }

    return (
        <svg className="userRating" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle style={{"fill": "#081c22"}} cx="50" cy="50%" r="50%"/>
            <circle strokeWidth="10" style={{"fill": "none", "stroke": "var(--primary)", "opacity": "0.3"}} cx="50%" cy="50%" r="40"/>
            <circle strokeDashoffset={300 - (rating*25)} className="ratings-innercircle" strokeWidth="10" style={{"fill": "none", "stroke": "var(--primary)"}} cx="50%" cy="50%" r="40"/>
            <text className="ratings-text" dominantBaseline="middle" textAnchor="middle" x="50%" y="55%">{props.rating}</text>
        </svg>
    )
}

function ExtendedView(props) {

    const item = props.data

    const handleClick = (ev) => {
        if(ev.target.classList.contains("extended-view") && props.onDismiss) props.onDismiss()
    }

    const [ next, setNext ] = useState()
    const [ length, setLength ] = useState()

    const getNext = () => {
        client.req(`/content/${item.next}`)
        .then((r) => {
            setNext(r.content)
        })
    }

    const getLength = () => {
        let reqs = []
        for(let source of item.sources) {
            reqs.push(client.req(`/content/source/${source.id}/info`))
        }
        Promise.all(reqs).then(values => {
            let len = 0
            for(let res of values) {
                len += res?.content?.playback_length
            }
            let hours = len / 60 / 60
            setLength(`${Math.floor(hours)}h ${Math.floor((hours % 1) * 100)}m`)
        })
        .catch(e => {
            // handling errors is for losers
            console.log(e)
        })
    }

    if(!next && item.next) getNext()
    if(!length && item.sources.length > 0) getLength()

    const handleNextClick = () => {
        switch(next.entity_type) {
            case "Category":
                window.location.href = `/b/${next.id}`
            break;
            default :
                window.location.href = `/consume/${next.id}`
            break;
        }
    }

    return (
        <div onClick={handleClick} className="extended-view">
            <div className="extended-body">
                <div className="photos">
                    <div className="center-thumbnail">
                        <Image src={item.metadata.thumbnail} alt={item.metadata.name} />
                        <div className="title">
                            <div className="title-contrast">
                                <h1 className={ "entity-title" + (item.metadata.name.length > 7 ? " long" : "") }>{item.metadata.name} <span className="gray">({item.metadata.year})</span></h1>
                                <p>{ length ? `${length} -` : null } {item.metadata.language}</p>
                            </div>
                            <UserRating rating={item.metadata.rating} />
                        </div>
                    </div>
                    <img className="banner" src={item.metadata.banner} alt="banner" />
                </div>
                <div className="extended-content">
                    <h1>{item.entity_type} Overview</h1>
                    <h3>Description</h3>
                    <p>{item.metadata.description}</p>
                    {
                        next ?
                        <div>
                            <h3>Next content</h3>
                            <Collection onClick={handleNextClick} data={next} />
                        </div> : null
                    }
                </div>
            </div>
        </div>
    )
}

const getAgeRatingLabel = (age) => {
    age = Number(age)
    let label = "G"
    if(age >= 13) label = "PG-13"
    if(age >= 17) label = "R"
    
    return label
}

export default function Collection(props) {
    const item = props.data
    let preventClickEvent = false
    let allowExtendedState = false
    let [ extended, setExtended ] = useState(false)

    const handleClick = (ev) => {
        if(preventClickEvent) {
            preventClickEvent = false
            return
        }
        if(props.onClick) props.onClick(ev)
    }

    const handleMouseDown = (ev) => {
        if(!props.allowExtended) return

        allowExtendedState = true
        setTimeout(() => {
            if(allowExtendedState) setExtended(true)
        }, 1000)
    }

    const handleMouseUp = (ev) => {
        allowExtendedState = false
        if(extended) preventClickEvent = true
    }

    console.log(item)

    const [ duration, setDuration ] = useState(0)

    useEffect(() => {
        if(item.entity_type == "Category") {
            client.req(`/content/${item.id}/children`)
            .then(r => {
                setDuration(`${r.content.length} children`) 
            })
            return
        }
        if(!item.sources) return
        let reqs = []
        for(let source of item.sources) {
            reqs.push(client.req(`/content/source/${source.id}/info`))
        }
        Promise.all(reqs).then(values => {
            let len = 0
            for(let res of values) {
                len += res?.content?.playback_length
            }
            let hours = len / 60 / 60
            setDuration(`${Math.floor(hours)}h ${Math.floor((hours % 1) * 100)}m`)
        })
        .catch(e => {
            // handling errors is for losers
            console.log(e)
        })
    })

    return (
        <div onMouseDown={handleMouseDown} onTouchStart={handleMouseDown} onMouseUp={handleMouseUp} onTouchEnd={handleMouseUp} onClick={handleClick} className="collection noselect">
            { extended ? <ExtendedView onDismiss={() => setExtended(false)} data={props.data} /> : null }
            <Image src={item.metadata.thumbnail} alt={item.metadata.name} />
            <div className="meta">
                <h2>{item.metadata.name}</h2>
                <div className="meta-row"> <span className="meta-agerating">{getAgeRatingLabel(item.metadata.age_rating)}</span> <span>{item.metadata.year}</span> • {duration} </div>
            </div>

            { item.entity_type == "Category" ? null : 
                <div className="collection-rating">
                    <Icon type="star" />
                    {item.metadata.rating}
                </div>
            }
        </div>
    )
}