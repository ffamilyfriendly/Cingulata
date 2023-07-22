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

export function formatAsTime( secs: number ): string {
    let time = ""
    const hrs = secs / (60*60)
    const minutes = (secs / 60) - Math.floor(hrs) * 60

    if(Math.floor(hrs) !== 0) time += `${Math.round(hrs)}h `
    time += `${Math.round(minutes)}m`

    return time
}

function GenericEntity( { entity, ...props }: { entity: ApiEntity } ) {
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
                <div className={`${style.row} ${style.metaRow}`}>
                    { entity?.metadata?.age_rating ? <p className={style.pgRated}>{ entity.metadata?.age_rating }</p> : null}
                    <p>{entity.metadata?.year}</p>
                    <p>{formatAsTime(entity.duration||0)}</p>
                </div>
            </div>
        </div>
    )
}


export default function Entity( { entity, ...props }: { entity: ApiEntity } ) {
    switch (entity.type) {
        case EntityTypes.Movie:
        case EntityTypes.Audio:
            return <GenericEntity entity={entity} {...props} />
        break;
        default:
            return <p>not implemented</p>
    }
}