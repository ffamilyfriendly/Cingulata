import { Client } from "../client";
import { FailResponse, Rest, Routes, SuccessResponse } from "../rest";

export enum EntityTypes {
    Audio,
    Movie,
    Series,
    Category
}

interface rawSource {
    id: string,
    length: number,
    parent: string,
    path: string,
    position: string
}

interface rawMetadata {
    thumbnail: string,
    banner: string,
    description: string,
    name: string,
    rating: number,
    age_rating: string,
    language: string,
    year: number,
    parent: string
}

interface rawEntity {
    creator_uid: number,
    entity_type: "Audio"|"Movie"|"Series"|"Category",
    flag: number,
    id: string,
    metadata: rawMetadata,
    next: string,
    parent: string,
    position: number,
    sources: rawSource[]
}

type MetaDataEdit = {
    thumbnail?: string,
    banner?: string,
    description?: string,
    name?: string,
    rating?: number,
    age_rating?: string,
    language?: string,
    year?: number
}

type SourceEdit = {
    parent?: string,
    path?: string,
    position?: number
}

export class Source {
    id: string
    length: number
    raw_parent: string
    path: string
    position: string

    manager: ContentManager
    constructor(data: rawSource, ContentManager: ContentManager) {
        this.id = data.id
        this.length = data.length
        this.raw_parent = data.parent
        this.path = data.path
        this.position = data.position

        this.manager = ContentManager
    }

    edit(data: SourceEdit) {
        this.manager.editSource(this.id, data)
    }

    delete() {
        return this.manager.deleteSource(this.id)
    }

    get parent(): Promise<Entity> {
        return this.manager.get(this.raw_parent)
    }
}

export class Metadata {

    thumbnail: string
    banner: string
    description: string
    name: string
    rating: number
    age_rating: string
    language: string
    year: number
    raw_parent: string

    manager: ContentManager
    constructor(data: rawMetadata, ContentManager: ContentManager) {
        this.thumbnail = data.thumbnail
        this.banner = data.banner
        this.description = data.description
        this.name = data.name
        this.rating = data.rating
        this.age_rating = data.age_rating
        this.language = data.language
        this.year = data.year
        this.raw_parent = data.parent

        this.manager = ContentManager
    }

    edit(data: MetaDataEdit) {
        this.manager.editMetadata(this.raw_parent, data)
    }

    delete() {
        this.manager.deleteMetadata(this.raw_parent)
    }

    get parent(): Promise<Entity> {
        return this.manager.get(this.raw_parent)
    }
}

export class Entity {
    creator_id: number
    id: string
    type: EntityTypes
    public: boolean
    position: number
    sources: Source[]
    private next_id?: string
    private parent_id: string
    
    manager: ContentManager

    constructor(data: rawEntity, ContentManager: ContentManager) {
        this.creator_id = data.creator_uid
        this.id = data.id
        this.type = EntityTypes[data.entity_type]
        this.public = !data.flag
        this.position = data.position
        this.sources = data.sources.map(source => new Source(source, ContentManager))

        this.next_id = data.next
        this.parent_id = data.parent

        this.manager = ContentManager
    }

    get next(): null|Promise<Entity> {
        if(!this.next_id) return null
        return this.manager.get(this.next_id)
    }

    get parent(): null|Promise<Entity> {
        if(this.parent_id === "root") return null
        return this.manager.get(this.parent_id)
    }

    get children(): Promise<Entity[]> {
        return this.manager.getChildren(this.id)
    }

    get lastWatched(): Promise<number> {
        return new Promise((resolve, reject) => {
            this.manager.rest.get(Routes.LastWatched(this.id))
                .then(rawData => resolve(Number(rawData.data)))
                .catch(reject)
        })
    }

    edit(data: { parent?: string, flag?: number, position?: number, next?: string }): Promise<SuccessResponse> {
        return this.manager.editEntity(this.id, data)
    }

    delete(): Promise<SuccessResponse> {
        return this.manager.deleteEntity(this.id)
    }
}

export default class ContentManager {
    rest: Rest
    cache: Map<string, Entity>

    constructor(client: Client) {
        this.rest = client.rest
        this.cache = new Map<string, Entity>()
    }

    get(id: string): Promise<Entity> {
        return new Promise((resolve, reject) => {
            if(this.cache.has(id)) {
                console.log("cache bounce")
                return this.cache.get(id)
            }
            this.rest.get(Routes.Entity(id))
                .then(rawEntityData => {
                    console.log(rawEntityData)
                    const entity = new Entity(rawEntityData.data as rawEntity, this)
                    this.cache.set(id, entity)
                    resolve(entity)
                })
                .catch(reject)
        })
    }

    getChildren(parent: string): Promise<Entity[]> {
        return new Promise((resolve, reject) => {
            this.rest.get(Routes.GetChildren(parent))
                .then(rawEntities => {
                    if(!(rawEntities.data instanceof Array)) return
                    const rv: Entity[] = rawEntities.data.map(rawEntityData => new Entity(rawEntityData, this))
                    
                    // Add entities to cache
                    for(const e of rv)
                        this.cache.set(e.id, e)

                    resolve(rv)
                })
        })
    }

    editEntity(id: string, data: { parent?: string, flag?: number, position?: number, next?: string }): Promise<SuccessResponse> {
        this.cache.delete(id)
        return this.rest.patch(Routes.Entity(id), data)
    }

    deleteEntity(id: string): Promise<SuccessResponse> {
        this.cache.delete(id)
        return this.rest.delete(Routes.Entity(id))
    }

    editMetadata(id: string, data: MetaDataEdit): Promise<SuccessResponse> {
        return this.rest.patch(Routes.MetaData(id), data)
    }

    deleteMetadata(id: string): Promise<SuccessResponse> {
        return this.rest.delete(Routes.MetaData(id))
    }

    editSource(id: string, data: SourceEdit) {
        return this.rest.patch(Routes.Source(id), data)
    }

    deleteSource(id: string) {
        return this.rest.delete(Routes.Source(id))
    }
}