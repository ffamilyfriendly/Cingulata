import { ChangeEvent, Dispatch, SetStateAction, useState } from "react"
import { Result } from "../generic"
import Icon, { IconType } from "../Icon"
import styling from "./Input.module.css"

type InputTypes = "color" | "date" | "email" | "file" | "checkbox" | "number" | "password" | "search" | "text"



interface InputProps {
    label?: string,
    icon?: IconType,
    placeholder?: string,
    type?: InputTypes,
    validate?: ( value: string ) => Result,
    setValue: Dispatch<SetStateAction<any | undefined>>,
    value: string
}

export default function( { icon = "star", placeholder = "...", type = "text", ...rest }: InputProps ) {

    const [ validationError, setValidationError ] = useState<Result|null>()

    const validate = ( event: ChangeEvent<HTMLInputElement> ) => {
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
            <div className={`${styling.container} ${(validationError ? styling.error : "")}`}>
                <div className={styling.icon}>
                    <Icon className={ validationError ? "error" : "info" } type={ icon } />
                </div>
                <input value={rest.value} onChange={validate} type={type} placeholder={placeholder} className={styling.input}></input>
                { validationError ? <div className={styling.error_message}> <Icon type="error"></Icon> {validationError.message}</div> : null }
            </div>
        </div>
    )
}