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
    loading?: boolean,
    loadWithPromise?: Promise<any>|Promise<any>[]|null
}

function ButtonIcon( props: { icon: IconType, loading: boolean } ) {
    const iconName: IconType = props.loading ? "loading" : props.icon
    return (
        <Icon className={ iconName === "loading" ? styling.icon_loading : "" } type={ iconName } />
    )
}

export default function Button({ style, children, disabled = false, width, icon, ...props }: ButtonProps) {

    const { push } = useRouter()
    const [ loading, setLoading ] = useState(false)

    const handleOnClick = ( event: MouseEvent<HTMLButtonElement> ) => {
        if(disabled||loading) return event.preventDefault()
        if(!props.onclick) return

        if(typeof props.onclick === "string") push(props.onclick)
        else props.onclick(event)
    }

    useEffect(() => {
        if(props.loading) {
            setLoading(true)
        }
        if(props.loadWithPromise) {
            setLoading(true)
            Promise.all( props.loadWithPromise instanceof Array ? props.loadWithPromise : [ props.loadWithPromise ] )
                .then(() => {
                    setLoading(false)
                })
        }
    }, [props.loadWithPromise])

    return (
        <button onClick={handleOnClick} className={ styling.button + ` ${style} ${width ? styling[width] : ""} ${(disabled || loading) ? styling.disabled : ""} ${ props.loading ? styling.loading : "" }` }>
            { icon || loading ? <ButtonIcon icon={ icon||"star" } loading={loading} /> : null }
            <p>{ children }</p>
        </button>
    )
}