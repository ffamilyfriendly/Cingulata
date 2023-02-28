import { MouseEvent } from "react"
import styling from "./Button.module.css"
import { Styles } from "../generic"
import Icon, { IconType } from "../Icon"

interface ButtonProps {
    style: Styles,
    children: string,
    width?: "wide"|"full",
    disabled?: boolean,
    onclick?: Function,
    icon?: IconType
}

export default function Button({ style, children, disabled = false, width, icon, ...props }: ButtonProps) {

    const handleOnClick = ( event: MouseEvent<HTMLButtonElement> ) => {
        if(disabled) return event.preventDefault()
        if(props.onclick) props.onclick(event)
    }
    return (
        <button onClick={handleOnClick} className={ styling.button + ` ${style} ${width ? styling[width] : ""} ${disabled ? styling.disabled : ""}` }>
            { icon ? <Icon className={ icon === "loading" ? styling.icon_loading : "" } type={icon} /> : null }
            <p>{ children }</p>
        </button>
    )
}