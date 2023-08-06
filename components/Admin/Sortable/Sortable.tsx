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

    function DropZone( { position }: { position: number } ) {
        const [ targeted, setTargeted ] = useState(false)

        const handleMouseOver = () => {
            if(typeof drag == "number" && drag !== position && drag !== position - 1) setTargeted(true)
        }

        const handleMouseUp = () => {
            if(typeof drag !== "number") return
            let pos = position
            if(position > drag) pos -= 1

            props.onChange(drag, pos)
            setTargeted(false)
            setDrag(null)
        }

        const handleLeave = () => {
            setTargeted(false)
        }

        const classList = [ style.dropZone ]

        if(targeted) classList.push( style.targeted )

        return (
            <div className={ classList.join(" ") }>
                <div
                    onMouseOver={handleMouseOver}
                    onPointerLeave={handleLeave}
                    onMouseUp={handleMouseUp}

                    className={ style.dropZoneTarget }
                > </div>
                { targeted && typeof drag == "number" ?
                    <div className={ style.item }>
                        <Icon type="arrowRight" />
                        { props.children[drag] }
                    </div> : null
                }
            </div>
        )
    }

    function SortableItem( { position, ...props }: SortableItemProps ) {

        const handleDown = (e: EventType) => {
            const target = e.target as HTMLElement
            if(![ "svt", "path", "DIV" ].includes(target.nodeName)) return console.log(target.nodeName)
            setDrag(position)
        }

        const handleUp = () => {
            setDrag(null)
        }

        let className = [ style.item ]
        if(drag === position) className.push( style.dragged )

        return (
            <div
                onMouseDown={handleDown}
                onTouchStart={handleDown}

                onMouseUp={handleUp}
                onTouchEnd={handleUp}

                onMouseEnter={ () => {  } }
                onMouseLeave={ () => {  } }
                className={ className.join(" ") }
            >
                <Icon type="dots" />
                { props.children }
            </div>
        )
    }

    let elements: JSX.Element[] = [ <DropZone position={0} /> ]
    
    for(let i = 0; i < props.children.length; i++) {
        const child = props.children[i]
        elements.push(<SortableItem onPosChange={props.onChange} position={i}>{child}</SortableItem>)
        elements.push( <DropZone position={i+1} /> )
    }

    return (
        <div onTouchCancel={() => { alert("hi") }} onMouseLeave={ () => { setDrag(null) } } className={ style.sortable }>
            { elements }
        </div>
    )
}