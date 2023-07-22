import { GenericChildrenProp } from "@/components/generic"
import Icon from "@/components/Icon"
import { useState } from "react"
import style from "./Sortable.module.css"
interface SortableItemProps {
    children: JSX.Element,
    position: number,
    onPosChange: ( currentIndex: number, newIndex: number ) => void
}

export interface SortableProps {
    children: JSX.Element[],
    onChange: ( item: number, newPosition: number ) => void
}

type EventType = React.MouseEvent<HTMLDivElement>|React.TouchEvent<HTMLDivElement>

export default function( { ...props }: SortableProps ) {

    const [ drag, setDrag ] = useState<number|null>()

    function SortableItem( { position, ...props }: SortableItemProps ) {

        const [ mouseOver, setMouseOver ] = useState(false)
        const [ dragged, setDragged ] = useState(false)
        const [ targeted, setTargeted ] = useState(false)

        const handleDown = (e: EventType) => {
            const target = e.target as HTMLElement
            if(![ "svt", "path", "DIV" ].includes(target.nodeName)) return console.log(target.nodeName)
            setDrag(position)
        }

        const handleUp = () => {
            if(targeted && typeof drag === "number") {
                props.onPosChange(drag, position)
            }
            setDrag(null)
        }

        const handleOver = () => {
            if( typeof drag === "number" && drag !== position ) setTargeted(true)
        }

        const handleLeave = () => {
            if(targeted) setTargeted(false)
        }

        let className = [ style.item ]
        if(drag === position) className.push( style.dragged )
        if( targeted ) className.push( style.target )

        return (
            <div
                onMouseDown={handleDown}
                onTouchStart={handleDown}

                onMouseUp={handleUp}
                onTouchEnd={handleUp}

                onMouseOver={handleOver}
                onPointerLeave={handleLeave}

                onMouseEnter={ () => {  } }
                onMouseLeave={ () => {  } }
                className={ className.join(" ") }
            >
                <Icon type="dots" />
                { props.children }
            </div>
        )
    }

    return (
        <div onTouchCancel={() => { alert("hi") }} onMouseLeave={ () => { setDrag(null) } } className={ style.sortable }>
            { props.children.map((c, idx) => <SortableItem onPosChange={props.onChange} position={idx}>{c}</SortableItem>) }
        </div>
    )
}