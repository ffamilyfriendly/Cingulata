import { Entity as ApiEntity } from "@/lib/api/managers/ContentManager";
import Entity from "@/components/entity/Entity"
import { UserPermissions } from "@/lib/api/managers/UserManager";
import { client } from "@/pages/_app";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { IconType } from "@/components/Icon";
import { Styles } from "@/components/generic";

import AuthedComponent from "@/components/AuthedComponent";
import StatusBox from "@/components/StatusBox";
import StickyHeader from "@/components/StickyHeader";
import BaseEntityEditor from "@/components/Admin/Entity/BaseEntityEditor";
import SourceEditor from "@/components/Admin/Entity/SourceEditor";
import MetaDataEditor from "@/components/Admin/Entity/MetaDataEditor";

import GenericStyles from "@/styles/common.module.css"
import style from "./content.module.css"

export default function Home() {
    const id = useRouter().query["id"]
    if(typeof id !== "string") return <p>something went wrong</p>

    const [ entity, setEntity ] = useState<ApiEntity|null>()
    const [ status, setStatus ] = useState<{ title: string, message: string, icon?: IconType, style: Styles }>()

    useEffect(() => {
        client.content.get(id, true)
            .then(setEntity)
            .catch((e) => {
                setError(`${e.type} error`, e.message)
                console.error(e)
            })
    }, [])

    const setError = ( title: string, message: string ) => {
        setStatus({ title, style: "error", icon:"error", message })
    }

    if(!entity) return <p>loading</p>

    return (
        <AuthedComponent requires={UserPermissions.ManageContent}>
            <StickyHeader title={ entity?.metadata?.name ? entity.metadata.name : "Content" } link={{ title: "Settings", href: "/settings" }} />
            <main className={`${GenericStyles.centerHorizontal} ${GenericStyles.container}`}>
                <div>
                    { status ? <StatusBox style={status.style} icon={status.icon} title={status.title}><p>{status.message}</p></StatusBox> : null}
                    
                    <section className={ style.mainSection }>
                        <div className={ style.baseSection }>
                            <h2>Base data</h2>
                            <BaseEntityEditor entity={ entity } />
                        </div>

                        <div className={ style.metaSection }>
                            <h2>Metadata</h2>
                            <MetaDataEditor entity={ entity } />
                        </div>

                        <div className={ style.sourceSection }>
                            <h2>Sources</h2>
                            <SourceEditor entity={ entity } />
                        </div>

                        <div className={ style.previewSection }>
                            <Entity entity={entity} />
                        </div>
                    </section>
                </div>
            </main>
        </AuthedComponent>
    )
}