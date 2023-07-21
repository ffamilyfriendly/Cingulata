import { Entity as ApiEntity, Metadata } from "@/lib/api/managers/ContentManager";
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
import Input from "@/components/Input";

export default function Home() {
    const id = useRouter().query["id"]
    if(typeof id !== "string") return <p>something went wrong</p>

    const [ entity, setEntity ] = useState<ApiEntity|null>()
    const [ status, setStatus ] = useState<{ title: string, message: string, icon?: IconType, style: Styles }>()
    const [ metadata, setMetadata ] = useState<{ name: string, description: string, thumbnail: string, banner: string, language: string, age_rating: string, rating: number, duration: number }>()

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

    const onEdit = ( e: { name: string, description: string, thumbnail: string, banner: string, language: string, age_rating: string, rating: number } ): void => {    
        setMetadata({ ...e, duration: entity?.duration||0 })
    }

    const shallowCopy = () => {
        const ob1 = Object.assign({}, entity)
        if(ob1.metadata) {
            ob1.metadata = Object.assign(ob1.metadata, metadata)
        }

        return ob1
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
                            <MetaDataEditor onEdit={onEdit} entity={ entity } />
                        </div>

                        <div className={ style.sourceSection }>
                            <h2>Sources</h2>
                            <SourceEditor entity={ entity } />
                        </div>

                        <div className={ style.previewSection }>
                            <Entity entity={shallowCopy()} />
                        </div>
                    </section>
                </div>
            </main>
        </AuthedComponent>
    )
}