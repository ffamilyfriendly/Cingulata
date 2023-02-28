import { MouseEventHandler } from "react"
import Button from "../Button"
import Icon from "../Icon"
import style from "./Modal.module.css"

interface ModalProps {
    title: string,
    children: JSX.Element|(JSX.Element|string)[],
    onclose: MouseEventHandler<HTMLButtonElement>
}

export default function( { title, children, onclose }: ModalProps ) {

    return (
        <div className={style.container}>
            <div className={style.body}>
                <div className={style.header}>
                    <h2>{title}</h2>

                    <button onClick={onclose} className={style.close_btn}>
                        <Icon type="close" />
                    </button>
                </div>
                <div className={style.content}>
                    {children}
                </div>
            </div>
        </div>
    )
}