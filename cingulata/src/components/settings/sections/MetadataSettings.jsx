import React, { useState } from "react"
import { client } from "../../../App"
import Collection from "../../content/collection"
import Modal from "../../modal/modal"
import "./metadata.css"

/**
pub struct MetaData {
    pub thumbnail: Option<String>,
    pub banner: Option<String>,
    pub description: Option<String>,
    pub name: Option<String>,
    pub rating: Option<f32>,
    pub age_rating: Option<String>,
    pub language: Option<String>,
    pub year: Option<u16>
}
edit path: same as above but everything is an option
*/

/*
age_rating	"15"
banner	"asdasdasd"
description	"asdasd"
language	"english"
name	"asdasd"
rating	1
year	"1945"
*/


function MetaDataImport(props) {
    const provider = {
        Audio: {
            name: "Storytel",
            href: "https://storytel.com"
        },
        Movie: {
            name: "themoviedb.org",
            href: "https://www.themoviedb.org/"
        }
    }[props.type] || { name: `no provider exists for ${props.type}`, href: "https://obama.com" }

    let [ results, setResults ] = useState([ ])
    let [ query, setQuery ] = useState("")

    let { setThumbnail, setBanner, setDescription, setName, setRating, setAgeRating, setLanguage, setYear } = props.setters

    const importData = (data) => {
        props.setModal(false)
        setThumbnail(data.thumbnail)
        setBanner(data.banner)
        setDescription(data.description)
        setName(data.name)
        setRating(data.rating)
        setAgeRating(data.age_rating)
        setLanguage(data.language)
        setYear(data.year)
    }

    const doSearch = (v) => {
        setQuery(v.target.value)

        if(!query || query.length < 3) return

        client.req(`/metadata/${props.type.toLowerCase()}?query=${query}`)
        .then(res => {
            let results = []

            for(let r of res.content) {
                const data = {
                    metadata: {
                        thumbnail: r.thumbnail,
                        name: r.name,
                        description: r.description
                    }
                }

                results.push(<Collection onClick={ () => importData(r) } key={Math.random()} data={data} />)
            }

            setResults(results)
        })
        .catch(err => {
            console.error(err)
        })
    }

    return (
        <Modal title="Import Metadata" onDismiss={() => { props.setModal(false) }}>
            <input onChange={doSearch} className="metadata-search" value={query} placeholder="search" type="search" />
            <div className="results">
                { results }
            </div>
            <p className="metadata-promo">Metadata provided by <a href={provider.href}>{provider.name}</a></p>
        </Modal>
    )
}

// onSubmit, edit
export default function MetaDataManager(props) {
    const [thumbnail, setThumbnail] = useState(props.thumbnail||"")
    const [banner, setBanner] = useState(props.banner||"")
    const [description, setDescription] = useState(props.description||"")
    const [name, setName] = useState(props.name||"")
    const [rating, setRating] = useState(props.rating||0)
    // age rating??? really??? why did I include this in the api
    const [age_rating, setAgeRating] = useState(props.age_rating||15)
    const [language, setLanguage] = useState(props.language||"english")
    // this variable is kinda stupid. Why did i include that in okapi????
    const [year, setYear] = useState(props.year || (new Date()).getFullYear())

    const [metadatamodal, setMetadataModal] = useState(false)

    // parent is not to be changed 
    const parent = props.parent

    const submitEntity = () => {
        let errs = ""
        if(!props.edit && (!thumbnail || !banner || !description || !name || !rating || !age_rating || !language || !year)) errs += "missing required fields."
        if(errs.length > 0) return props.setStatus(errs, "error", 5)

        let url = "/content/metadata"
        let body = { parent, thumbnail, banner, description, name, rating, age_rating: age_rating.toString(), language, year }
        
        if(props.edit) {
            url = `/content/metadata/${parent}`
            delete body.parent
        }

        client.req(url, body, { method: props.edit ? "PATCH" : "POST" })
        .then((e) => {
            console.log(e)
            if(!props.edit) props.onSubmit()
            props.setStatus("saved metadata data", "success", 5)
        })
        .catch(e => {
            props.setStatus("Something went wrong. (check logs)", "error", 5)
            console.error(e)
        })
    }

    return(
        <div className="baseEntity">
            { metadatamodal ? <MetaDataImport setters={ { setThumbnail, setBanner, setDescription, setName, setRating, setAgeRating, setLanguage, setYear } } setModal={setMetadataModal} type={props.type} /> : null }
            <button onClick={() => { setMetadataModal(true) }} className="btn btn-primary full-width">Import metadata</button>
            <div className="row">
                <p>Name</p>
                <input onChange={(ev) => setName(ev.target.value)} type="text" value={name} placeholder="really cool title" />
            </div>
            <div className="fat-row">
                <p>Description</p>
                <textarea onChange={(ev) => setDescription(ev.target.value)} type="textbox" value={description} placeholder="hello there. Im a description" />
            </div>
            <div className="row">
                <p>Thumbnail</p>
                <input type="url" onChange={(ev) => setThumbnail(ev.target.value)} value={thumbnail} placeholder="https://i.imgur.com/jWr67J8.png" />
            </div>
            <div className="row">
                <p>Banner image</p>
                <input type="url" onChange={(ev) => setBanner(ev.target.value)} value={banner} placeholder="https://i.imgur.com/jWr67J8.png" />
            </div>
            <div className="row">
                <p>Publication year</p>
                <input type="number" onChange={(ev) => setYear(Number(ev.target.value))} value={year} />
            </div>
            <div className="row">
                <p>Language</p>
                <input type="text" onChange={(ev) => setLanguage(ev.target.value)} value={language} />
            </div>
            <div className="row">
                <p>Age rating</p>
                <input onChange={(ev) => setAgeRating(ev.target.value)} type="number" min="0" max="18" value={age_rating} />
            </div>
            <div className="row">
                <p>Rating <small>n/10</small></p>
                <input onChange={(ev) => setRating(Number(ev.target.value))} type="number" min="0" max="10" value={rating} />
            </div>

            <button onClick={submitEntity} className="btn btn-success full-width">Submit</button>
        </div>
    )
}
