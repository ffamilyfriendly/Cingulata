import { MouseEventHandler, MouseEvent } from "react"
import Icon from "../Icon"
import style from "./Modal.module.css"

type clickEv = MouseEventHandler<HTMLButtonElement|HTMLDivElement>

interface ModalProps {
    title: string,
    children: JSX.Element|(JSX.Element|string)[],
    onclose: clickEv
}

export default function( { title, children, onclose }: ModalProps ) {

    const handleContainerClicked = (ev: MouseEvent<HTMLDivElement>) => {
        if(ev.target === ev.currentTarget) onclose(ev)
    }

    return (
        <div onClick={handleContainerClicked} className={style.container}>
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