import { Entity as ApiEntity, EntityTypes } from "@/lib/api/managers/ContentManager"
import Image from "next/image"
import { MouseEventHandler } from "react"
import Icon from "../Icon"
import style from "./Entity.module.css"

type StarHoverEvent = ( event: React.MouseEvent<SVGSVGElement, MouseEvent>, starValue: number ) => void

export function Stars( { value, max = 5, ...rest }: { value: number, max?: number, onclick?: MouseEventHandler, onhover?: StarHoverEvent, onLeave?: MouseEventHandler, className?: string } ) {
    let stars: JSX.Element[] = []

    for(let i = 0; i < max; i++) {
        const starRating = i + 1
        const state = starRating <= value ? "starFilled" : (starRating - 0.5) <= value ? "starHalfFilled" : "starUnfilled"
        if(state === "starHalfFilled") {
            stars.push( 
                <Icon key={`star_${i}`} type="star" onClick={rest.onclick} onLeave={rest.onLeave} onHover={(ev) => {rest.onhover ? rest.onhover(ev, i+1) : null}} className={ style[state] }>
                    <linearGradient id="grad">
                        <stop offset="50%" stopColor="var(--primary)"/>
                        <stop offset="50%" stopColor="var(--lifted)"/>
                    </linearGradient>
                </Icon>
            )
        } else stars.push( <Icon key={`star_${i}`} type="star" onClick={rest.onclick} onLeave={rest.onLeave} onHover={(ev) => {rest.onhover ? rest.onhover(ev, i+1) : null}} className={ style[state] } /> )
        
    }

    return (
        <div className={ `${style.starContainer} ${rest.className}` }>
            { stars }
        </div>
    )
}

export default function Entity( { entity, ...props }: { entity: ApiEntity } ) {
    console.log(entity, entity.duration)
    return (
        <div className={ `${style.entity} ${style[EntityTypes[entity.type]]}` }>
            <div className={style.image}>
                <Image fill={true} src={entity.metadata?.thumbnail||""} alt={`Thumbnail of ${entity.metadata?.name}`} />
            </div>
            <div className={style.col}>
                <div className={style.header}>
                    <h4> { entity.metadata?.name } </h4>
                    <Stars className={style.stars} value={entity.metadata?.rating||0} />
                </div>
                <div className={style.row}>
                    <p className={style.pgRated}>{ entity.metadata?.age_rating }</p>
                    <p>{entity.metadata?.year}</p>
                    <p>{entity.duration} aids</p>
                </div>
            </div>
        </div>
    )
}