import { Entity as ApiEntity, EntityTypes } from "@/lib/api/managers/ContentManager"
import { MouseEventHandler } from "react"
import Icon from "../Icon"
import style from "./Entity.module.css"

type StarHoverEvent = ( event: React.MouseEvent<SVGSVGElement, MouseEvent>, starValue: number ) => void

export function Stars( { value, max = 5, ...rest }: { value: number, max?: number, onclick?: MouseEventHandler, onhover?: StarHoverEvent, onLeave?: MouseEventHandler } ) {
    let stars: JSX.Element[] = []

    for(let i = 0; i < max; i++) {
        const starRating = i + 1
        const state = starRating <= value ? "starFilled" : (starRating - 0.5) <= value ? "starHalfFilled" : "starUnfilled"
        if(state === "starHalfFilled") {
            stars.push( 
                <Icon key={`star_${i}`} type="star" onClick={rest.onclick} onLeave={rest.onLeave} onHover={(ev) => {rest.onhover ? rest.onhover(ev, i+1) : null}} className={ style[state] }>
                    <linearGradient id="grad">
                        <stop offset="50%" stop-color="var(--primary)"/>
                        <stop offset="50%" stop-color="var(--lifted)"/>
                    </linearGradient>
                </Icon>
            )
        } else stars.push( <Icon key={`star_${i}`} type="star" onClick={rest.onclick} onLeave={rest.onLeave} onHover={(ev) => {rest.onhover ? rest.onhover(ev, i+1) : null}} className={ style[state] } /> )
        
    }

    return (
        <div className={ style.starContainer }>
            { stars }
        </div>
    )
}

export default function Entity( { entity, ...props }: { entity: ApiEntity } ) {
    console.log()
    return (
        <div className={ `${style.entity} ${style[EntityTypes[entity.type]]}` }>
            <h4> { entity.metadata?.name } </h4>
            { entity.metadata?.rating }
        </div>
    )
}