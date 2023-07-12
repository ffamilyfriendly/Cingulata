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
import Modal from '@/components/Modal'
import InviteCreator from '@/components/Admin/Invite/InviteCreator'
import NewEntity from '@/components/Admin/Entity/NewEntity'

type SettingsPropsRow = { icon: IconType, label: string, onClick?: Function, href?: string }
interface SettingsProps {
  rows: SettingsPropsRow[],
  label?: String
}
export function SettingsSection( { rows, label }: SettingsProps ) {

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
      { label ? <h3>{ label }</h3> : null }
      { rows.map( r =>
        <div key={ r.label } className={Styling.row}>
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

function UserSettings() {

  const [ user, setUser ] = useState<User>()

  useEffect(() => {
    if(client.user) setUser(client.user)
  }, [ client.user ])

  return (
    <>
      <SettingsSection label="User" rows={[
        (user ? { icon: "user", label: user.email, href: "/settings/user" } : { icon: "user", label: "Log in", href: "/auth/login" }),
        { icon: "cog", label: "Local Settings", href: "/settings/local" }
        
      ]} />
      
    </>
  )
}

function ContentSettings() {
  const [ modal, setModal ] = useState(false)

  return (
    <AuthedComponent requires={UserPermissions.ManageContent}>
      <>{ modal ? <NewEntity /> : null }</>
      <SettingsSection label="Content" rows={[
        { icon: "plus", label: "new", onClick: () => { setModal(true) } },
        { icon:"list", label: "show all", href: "/settings/content/" }
      ]} />
    </AuthedComponent>
  )
}

function InviteSettings() {
  const [ inviteModal, setInviteModal ] = useState(false)

  return (
    <AuthedComponent requires={UserPermissions.GenerateInvite}>
      <>{ inviteModal ? <Modal title='Create Invite' onclose={() => { setInviteModal(false) }}><InviteCreator /></Modal> : null }</>
      <SettingsSection label="Invites" rows={[
        { icon: "plus", label: "new", onClick: () => { setInviteModal(true) } },
        { icon: "list", label: "manage existing", href: "/settings/invites" }
      ]} />
    </AuthedComponent>
  )
}

export default function Home() {

  return (
    <>
        <main className={`${GenericStyles.centerHorizontal} ${GenericStyles.container}`}>
          <div className={Styling.settings}>
            <UserSettings />
            <ContentSettings />
            <InviteSettings />
          </div>
        </main>
    </>
  )
}
