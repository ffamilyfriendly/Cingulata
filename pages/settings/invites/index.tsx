import AuthedComponent from "@/components/AuthedComponent";
import StickyHeader from "@/components/StickyHeader";
import { Invite } from "@/lib/api/managers/InviteManager";
import { has_permission, UserPermissions } from "@/lib/api/managers/UserManager";
import { client } from "@/pages/_app";
import { useEffect, useState } from "react";
import GenericStyles from "@/styles/common.module.css"
import style from "./invites.module.css"
import Button from "@/components/Button";

// stolen from https://blog.webdevsimplified.com/2020-07/relative-time-format/
// and modified slightly to be TS compliant
const formatter = new Intl.RelativeTimeFormat(undefined, {
    numeric: "auto",
  })
  
  const DIVISIONS: { amount: number, name: Intl.RelativeTimeFormatUnit }[] = [
    { amount: 60, name: "seconds" },
    { amount: 60, name: "minutes" },
    { amount: 24, name: "hours" },
    { amount: 7, name: "days" },
    { amount: 4.34524, name: "weeks" },
    { amount: 12, name: "months" },
    { amount: Number.POSITIVE_INFINITY, name: "years" },
  ]
  
  function formatTimeAgo(date: Date) {
    let duration = (date.getTime() - Date.now()) / 1000
  
    for (let i = 0; i < DIVISIONS.length; i++) {
      const division = DIVISIONS[i]
      if (Math.abs(duration) < division.amount) {
        return formatter.format(Math.round(duration), division.name)
      }
      duration /= division.amount
    }
  }

function TableEntry( { data, ...props }: { data: Invite, onDelete: Function } ) {

    let rv: string[] = []

    const getPermsString = ( p: number ) => {

        if(has_permission(p, UserPermissions.Administrator))
            return "Administrator"

        for(const permKey of Object.keys(UserPermissions).filter(i => isNaN(Number(i)) && i !== "IsUser")) {
            const permVal = UserPermissions[permKey as keyof typeof UserPermissions]
            if(has_permission(p, permVal))
                rv.push(permKey)
        }
            
        return rv.join(", ")
    }

    const handleClick = () => {
        data.delete()
            .then(() => {
                props.onDelete(data.id)
            })
            .catch(e => {
                console.log(e)
            })
    }

    return (
        <tr className={ style.tr }>
            <td> { data.id } </td>
            <td> { data.expires.getTime() !== 0 ? formatTimeAgo( data.expires ) : "doesnt expire" } </td>
            <td> { data.uses === -1 ? "∞" : data.uses } </td>
            <td className={ style.permstd }> { getPermsString(data.permissions) } </td>
            <td> <Button onclick={handleClick} style="error" width="full">Delete</Button> </td>
        </tr>
    )
}

export default function Home() {

    const [ invites, setInvites ] = useState<Invite[]>()

    useEffect(() => {
        client.invites.invites
            .then(invites => {
                setInvites(invites)
            })
    }, [ ])

    const handleDelete = ( id: string ) => {
        setInvites(inv => {
            return inv?.filter( invite => invite.id !== id )
        })
    }

    return (
        <AuthedComponent requires={UserPermissions.GenerateInvite}>
            <StickyHeader title="Invites" link={{ title: "Settings", href: "/settings" }} />
            <main className={`${GenericStyles.centerHorizontal} ${GenericStyles.container}`}>
                <table className={ style.table }>
                    <tr className={ style.header }>
                        <th> id </th>
                        <th> expires </th>
                        <th> uses </th>
                        <th> permissions </th>
                        <th> action </th>
                    </tr>
                    { invites?.map( m => <TableEntry key={ m.id } onDelete={handleDelete} data={m} /> ) }
                </table>
            </main>
        </AuthedComponent>
    )
}