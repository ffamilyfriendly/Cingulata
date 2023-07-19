import { client } from "@/pages/_app"
import { useEffect, useState } from "react"
import { InputElementProps, InputProps } from "."
import { ToggleRow } from "../Admin/Invite/InviteCreator"
import styling from "./FileInput.module.css"
import Modal from "../Modal"
import Button from "../Button"

export interface FileInput extends InputProps {
    type: "file",
    fileTypes?: string[],
    multiple?: boolean,
    defaultDir?: string
}

const prettifyFilePath = ( p: string ) => p.split("/").slice(-1).join("")

function FileEntry({ filename, selectedFiles, multiple, ...fProps}: { filename: string, selectedFiles: Set<string>, multiple?: boolean, handleClick: (x: string, y: boolean) => void }) {
    return (
        <li>
            { ( selectedFiles.has(filename) || selectedFiles.size == 0 ) || multiple ?
                <ToggleRow stateManaged={false} key={filename} onClick={() => { fProps.handleClick(filename, selectedFiles.has(filename)) }} label={ prettifyFilePath(filename) } toggled={ selectedFiles.has(filename) } /> :
                <p className={ styling.fileCannotSelect }>{filename}</p>
            }
        </li>
    )
}

export default function( props: FileInput & InputElementProps ) {

    const [ modal, setModal ] = useState(false)

    function FileSelectModal() {
        const [ selectedFiles, setSelectedFiles ] = useState<Set<string>>( new Set(props.value instanceof Array ? props.value : [ typeof props.value === "string" ? props.value : "" ]) )
        selectedFiles.delete("")
        const [ dir, setDir ] = useState<string>((props.defaultDir||"/"))
        const [ dirFiles, setDirFiles ] = useState<string[]>()

        // this is a bodge to force update state
        const [ amntFiles, setAmntFiles ] = useState( selectedFiles.size )

        useEffect(() => {
            client.getDir(dir)
                .then((f) => {
                    setDirFiles(f.data)
                })
        }, [ dir ])


        const goBack = ( d: string ) => {
            const split = d.split("/").slice(0, -1).filter(f => !!f)
            return `/${split.join("/")}`
        }

        const handleClick = ( f: string, remove: boolean ) => {
            setSelectedFiles(state => {

                if(!remove && !props.multiple) state.clear()

                if(remove) {
                    if(!state.has(f)) return state
                    state.delete(f)
                    setAmntFiles(a => state.size)
                } else {
                    if(state.has(f)) return state
                    state.add(f)
                    setAmntFiles(a => state.size)
                }

                return state
            })
        }

        const handleAddMultiple = () => {
            for(const file of getOnlyFiles(dirFiles||[]))
                handleClick(file, false)
        }

        const getDirFromPath = ( p: string ) => p.split("/").slice(0, -1).join("/")
        const getOnlyFiles = ( files: string[] ) => files.filter(f => /.*\/[^=.]+\w+\.\w+$/gm.test(f) && (props.fileTypes ? props.fileTypes.includes(f.split(".").pop()||"") : true))

        const fileItems = getOnlyFiles(dirFiles||[]).map(f => <FileEntry handleClick={handleClick} filename={f} selectedFiles={selectedFiles} multiple={props.multiple} />)
        return (
            <Modal title="Select Files" onclose={() => { setModal(false) }}>

                { /* The Modal header with navigation tools */ }
                <div className={ styling.fileModalHeader }>
                    <Button onclick={() => { setDir( goBack(dir) ) }} icon="arrowLeft" style="tertiary">Back</Button>
                    <b>subdirs</b>
                    <select value={dir} onChange={(ev) => { setDir(ev.target.value) }} className={ styling.select }>
                        { <option value={dir}>(current) { dir }</option> }
                        { dirFiles?.filter(f => f.split("/").pop()?.split(".").length === 1).map(f => <option value={f}>/{prettifyFilePath(f)}</option>) }
                    </select>
                </div>

                <p>Index of <span className={ styling.filesPath }>{ getDirFromPath(dir)}/</span><span className={ styling.filesPathCurrent }>{ prettifyFilePath(dir) }</span> { props.fileTypes ? `| types: ${props.fileTypes.map(f => `*.${f}`).join(",")}` : null }</p>

                <ul className={ styling.files }>
                    { fileItems.length > 0 ? fileItems : <li>{getDirFromPath(dir)} is empty</li> }
                </ul>
                <div className={ styling.filesFooter }>
                    { props.multiple ? <Button onclick={handleAddMultiple} style="secondary" disabled={ getOnlyFiles(dirFiles||[]).length === 0 }>Select all</Button> : null }
                    <Button onclick={() => { props.validateFunc(Array.from(selectedFiles.values())); setModal(false) }} style="primary" disabled={amntFiles === 0}>{`${amntFiles} file${ amntFiles !== 1 ? "s" : ""}`}</Button>
                </div>
            </Modal>
        )
    }

    const val = (props.value instanceof Array ? props.value : [])

    return (
        <div className={ styling.file }>
            { modal ? <FileSelectModal /> : null }
            <p className={`${ styling.fileNames } ${ val.join(",") ? "" : styling.fileNamesEmpty}`}>{ val.join(", ") || "empty" }</p>
            <Button onclick={() => { setModal(true) }} disabled={ props.disabled } style="primary">Select</Button>
        </div>
    )
}