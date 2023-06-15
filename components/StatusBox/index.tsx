import { Dispatch, SetStateAction } from "react"
import { GenericChildrenProp, Styles } from "../generic"
import Icon, { IconType } from "../Icon"
import style from "./Statusbox.module.css"

interface StatusBoxProps {
    children: GenericChildrenProp,
    style: Styles,
    icon?: IconType,
    setDismiss?: Dispatch<SetStateAction<any | undefined>>,
    title: string
}

export default function( { title, setDismiss, icon = "star", ...props }: StatusBoxProps ) {
    return(
        <div className={`${style.main} ${props.style} cramped-row`}>
            <Icon className={style.icon} type={icon} />
            <div className="stack">
                <b>{title}</b>
                { props.children }
            </div>
        </div>
    )
}