import { MouseEvent, useEffect, useState } from "react"
import styling from "./Button.module.css"
import { Styles } from "../generic"
import Icon, { IconType } from "../Icon"
import { useRouter } from "next/router"

interface ButtonProps {
    style: Styles,
    children: string,
    width?: "wide"|"full",
    disabled?: boolean,
    onclick?: Function|string,
    icon?: IconType,
    loading?: boolean
}

export default function Button({ style, children, disabled = false, width, icon, ...props }: ButtonProps) {

    const { push } = useRouter()

    const handleOnClick = ( event: MouseEvent<HTMLButtonElement> ) => {
        if(disabled) return event.preventDefault()
        if(!props.onclick) return

        if(typeof props.onclick === "string") push(props.onclick)
        else props.onclick(event)

    }
    if(props.loading) icon = "loading"

    return (
        <button onClick={handleOnClick} className={ styling.button + ` ${style} ${width ? styling[width] : ""} ${disabled ? styling.disabled : ""} ${ props.loading ? styling.loading : "" }` }>
            { icon ? <Icon className={ icon === "loading" ? styling.icon_loading : "" } type={icon} /> : null }
            <p>{ children }</p>
        </button>
    )
}