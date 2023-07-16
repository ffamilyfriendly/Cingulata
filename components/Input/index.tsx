import React, { ChangeEvent, Dispatch, SetStateAction, useRef, useState } from "react"
import { Stars } from "../entity/Entity"
import { Result } from "../generic"
import Icon, { IconType } from "../Icon"
import styling from "./Input.module.css"

type InputTypes = "color" | "date" | "email" | "file" | "checkbox" | "number" | "password" | "search" | "text" | "textbox" | "select" | "image" | "rating"



interface InputProps {
    label?: string,
    icon?: IconType,
    placeholder?: string,
    type?: InputTypes,
    validate?: ( value: string ) => Result,
    setValue: Dispatch<SetStateAction<any | undefined>>,
    value: string|number|boolean,
    disabled?: boolean,
    selectOptions?: { value: string, display: string }[]
}

interface InputElementProps extends InputProps {
    validateFunc( event: ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>|number ): void
}



function RatingsElement( { props }: { props: InputElementProps } ) {

    const [ value, setValue ] = useState( Number(props.value) )

    const onHover = (ev: React.MouseEvent<SVGSVGElement>, star: number) => {
        const target = ev.currentTarget.getBoundingClientRect()
        const mouse: { x: number, y: number } = { x: ev.clientX - target.x, y: ev.clientY - target.y }
        if(mouse.x < target.width/2) {
            setValue(star - 0.5)
        } else setValue(star)
    }

    const onClick = () => {
        props.validateFunc(value)
    }

    const onLeave = () => {
        setValue( Number(props.value) )
    }

    return (
        <div className={styling.rating}>
            <Stars onLeave={onLeave} onclick={onClick} onhover={onHover} value={ value } />
            <input value={value} onChange={(ev) => { setValue(Number(ev.target.value)) }} type="number" min={0} max={5} className={styling.ratingInput}></input>
        </div>
    )
}

function InputElement( props: InputElementProps ) {
    switch (props.type) {
        case "textbox":
            return <textarea disabled={props.disabled} value={ props.value.toString() } onChange={props.validateFunc} placeholder={props.placeholder} className={styling.textarea}></textarea>
        break;
        case "select":
            return (
                <select value={ props.value.toString() } onChange={props.validateFunc} className={ styling.select }>
                    { props.selectOptions?.map(c => <option key={ c.value } value={ c.value }>{ c.display }</option> ) }
                </select>
            )
        break;
        case "rating":
            return <RatingsElement props={props} />
        break;
        default:
            return <input disabled={props.disabled} value={typeof props.value !== "boolean" ? props.value : props.value.toString()} onChange={props.validateFunc} type={props.type} placeholder={props. placeholder} className={styling.input}></input>
        break;
    }
}

export default function( { icon, placeholder = "...", type = "text", ...rest }: InputProps ) {

    const [ validationError, setValidationError ] = useState<Result|null>()

    const validate = ( event: ChangeEvent<HTMLInputElement|HTMLTextAreaElement>|number ) => {
        if(rest.disabled) return
        if(typeof event === "number") {
            return rest.setValue(event)
        }
        rest.setValue(event.target.value)

        if(!rest.validate || event.target.value.trim().length === 0) return
        const res = rest.validate( event.target.value )
        
        if(!res.ok) setValidationError(res)
        if(res.ok && validationError !== null) {
            setValidationError(null)
        }
    }

    return (
        <div className={styling.outer}>
            { rest.label ? <h3 className={styling.label}>{rest.label}</h3> : null }
            <div className={`${styling.container} ${(validationError ? styling.error : "")} ${ rest.disabled ? styling.disabled : "" }`}>
                { icon ? 
                    <div className={styling.icon}>
                        <Icon className={ validationError ? "error" : "info" } type={ icon } />
                    </div> :
                    null
                }
                    <InputElement { ...rest } icon={ icon } placeholder={ placeholder } type={type} validateFunc={ validate } />
            </div>
            { validationError ? <div className={styling.error_message}> <Icon type="error"></Icon> {validationError.message}</div> : null }
        </div>
    )
}