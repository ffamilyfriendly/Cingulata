import AuthedComponent from '@/components/AuthedComponent'
import { User, UserPermissions } from '@/lib/api/managers/UserManager'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import { client } from '../_app'
import GenericStyles from "@/styles/common.module.css"
import Styling from "@/styles/pages/settings.module.css"
import Icon, { IconType } from '@/components/Icon'
import Link from 'next/link'
import { GenericChildrenProp } from '@/components/generic'
import Button from '@/components/Button'

type SettingsPropsRow = { icon: IconType, label: string, onClick?: Function, href?: string }
interface SettingsProps {
  rows: SettingsPropsRow[]
}
export function SettingsSection( { rows }: SettingsProps ) {

  function ActionIcon( props: SettingsPropsRow ): GenericChildrenProp {
    if(props.href) {
      return (
        <Link href={props.href||"/404"}> <Icon type="arrowRight" /> </Link>
      )
    } else if(props.onClick) {

      const handleClick = () => {
        if(props.onClick) props.onClick()
      }

      return (
        <p onClick={handleClick}>
          <Icon type="arrowRight"></Icon>
        </p>
      )
    }

    return null
  }

  return (
    <div className={Styling.section}>
      { rows.map( r =>
        <div className={Styling.row}>
          <div className={Styling.meta}>
            <Icon type={r.icon} />
            <p>{r.label}</p>
          </div>
          { ActionIcon(r) }
        </div> 
      )}
    </div>
  )
}

function HelloUser() {

  const [ user, setUser ] = useState<User>()

  useEffect(() => {
    if(client.user) setUser(client.user)
  }, [ client.user ])

  return (
    <>
      <SettingsSection rows={[
        (user ? { icon: "user", label: user.email, href: "/settings/user" } : { icon: "user", label: "Log in", href: "/auth/login" }),
        { icon: "cog", label: "Local Settings", href: "/settings/local" }
        
      ]} />
    </>
  )
}

export default function Home() {

  return (
    <>
        <main className={`${GenericStyles.centerHorizontal} ${GenericStyles.container}`}>
          <div className={Styling.settings}>
            <HelloUser />
          </div>
        </main>
    </>
  )
}
