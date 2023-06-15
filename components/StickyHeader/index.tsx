import Link from "next/link"
import { useEffect, useState } from "react"
import Icon from "../Icon"
import Styling from "./StickyHeader.module.css"

interface StickyHeaderProps {
    title: string,
    link: { title: string, href: string }
}
export default function StickyHeader( props: StickyHeaderProps ) {

    const [ scroll, setScroll ] = useState(0)

    const handleScrolled = () => {
        setScroll(window.scrollY)
    }

    useEffect(() => {
        window.addEventListener("scroll", handleScrolled, { passive: true })

        return () => {
            window.removeEventListener("scroll", handleScrolled)
        }
    }, [])

    return (
        <div className={`${Styling.StickyHeader} ${scroll > 10 ? Styling.scrolled : ""}`}>
            <Link className={Styling.link} href={props.link.href}> <Icon type="arrowLeft" /> {props.link.title}</Link>
            <h2>{props.title}</h2>
        </div>
    )
}