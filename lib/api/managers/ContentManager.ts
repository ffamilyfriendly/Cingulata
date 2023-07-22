import { isReturnStatement } from "typescript";
import { Client } from "../client";
import { Rest, Routes, SuccessResponse } from "../rest";

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
    position: number,
    name: string,
    source_type: "Video"|"Audio"|"Subtitle"
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
    position?: number,
    name?: string
}

type SourceCreate = {
    parent: string,
    path: string,
    position?: number,
    name?: string,
    source_type: SourceType
}

export enum SourceType {
    Video,
    Audio,
    Subtitle,
}

export class Source {
    id: string
    length: number
    raw_parent: string
    path: string
    position: number
    displayname: string
    type: SourceType

    manager: ContentManager
    constructor(data: rawSource, ContentManager: ContentManager) {
        this.id = data.id
        this.length = data.length
        this.raw_parent = data.parent
        this.path = data.path
        this.position = data.position

        // These properties are not yet added to the API
        this.displayname = data.name
        this.type = SourceType[data.source_type]

        this.manager = ContentManager
    }

    edit(data: SourceEdit) {
        return this.manager.editSource(this.id, data)
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
        return this.manager.editMetadata(this.raw_parent, data)
    }

    delete() {
        return this.manager.deleteMetadata(this.raw_parent)
    }

    get parent(): Promise<Entity> {
        return this.manager.get(this.raw_parent)
    }
}

export function SortBySourceType( t: SourceType, arr: Source[] ) {
    return arr.filter( i => i.type === t ).sort(( a, b ) => a.position - b.position)
}

export class Entity {
    creator_id: number
    id: string
    type: EntityTypes
    public: boolean
    position: number

    sources: { 
        [ key in SourceType ]: Source[]
     }

    metadata?: Metadata
    next_id?: string
    parent_id: string
    
    manager: ContentManager

    constructor(data: rawEntity, ContentManager: ContentManager) {
        this.creator_id = data.creator_uid
        this.id = data.id
        this.type = EntityTypes[data.entity_type]
        this.public = !data.flag
        this.position = data.position

        /*
            NOTE FOR POST VACATION JOHN:
            I want to init this in a way that is not hard-coded. I could not figure out how to do this but its possible.
            fix this, please. You oath
        */
        this.sources = { [SourceType.Audio]: [], [SourceType.Video]: [], [SourceType.Subtitle]: [] }

        const tmpArr = data.sources.map(source => new Source(source, ContentManager))
        for(const src of tmpArr) {
            if(!this.sources[src.type]) this.sources[src.type] = []
            this.sources[src.type]?.push(src)
        }

        if(data.metadata) this.metadata = new Metadata(data.metadata, ContentManager)

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

    get duration(): number {
        let dur = 0

        for(const src of (this.type === (EntityTypes.Movie|EntityTypes.Series) ? this.sources[SourceType.Video] : this.sources[SourceType.Audio]))
            dur += src.length

        return dur
    }

    edit(data: { parent?: string, flag?: number, position?: number, next?: string }): Promise<SuccessResponse> {
        return this.manager.editEntity(this.id, data)
    }

    /*
        interface rawSource {
    id: string,
    length: number,
    parent: string,
    path: string,
    position: string
}
    */

    createSource(data: { path: string, name?: string, type: SourceType, position?: number }) {
        return this.manager.createSource({ parent: this.id, path: data.path, name: data.name, source_type: data.type, position: data.position })
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

    createEntity( data: { parent?: string, isPublic: boolean, type: EntityTypes, position?: number, next?: string } ): Promise<Entity> {
        return new Promise((resolve, reject) => {
            this.rest.post(Routes.Entity("entity"), { parent: data.parent, flag: Number(!data.isPublic), entity_type: EntityTypes[data.type] as string, position: data.position, next: data.next })
                .then((c) => {
                    if(c.type === "CONTENT" && typeof c.data === "string") resolve(this.get(c.data))
                })
                .catch(reject)
        })
    }

    createMetadata( data: rawMetadata ): Promise<Entity> {
        return new Promise((resolve, reject) => {
            this.rest.post("/content/metadata", data)
                .then(() => {
                    const d = this.cache.get(data.parent)
                    if(d) {
                        d.metadata = new Metadata(data, this)
                        resolve(d)
                    } else {
                        resolve(this.get(data.parent))
                    }
                })
                .catch(reject)
        })
    }

    createSource( data: SourceCreate ): Promise<Entity> {
        return new Promise((resolve, reject) => {
            this.rest.post("/content/source", { ...data, source_type: SourceType[data.source_type] })
                .then(() => {
                    this.cache.delete(data.parent)
                    resolve(this.get(data.parent))
                })
                .catch(resolve)
        })
    }

    get(id: string, bypassCache: boolean = false): Promise<Entity> {
        return new Promise((resolve, reject) => {
            if(this.cache.has(id) && !bypassCache) {
                console.log("cache bounce")
                return this.cache.get(id)
            }
            this.rest.get(Routes.Entity(id))
                .then(rawEntityData => {
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
                    const promises: Promise<Entity>[] = rawEntities.data.map(entityId => this.get(entityId))
                    resolve(Promise.all(promises))
                })
        })
    }

    editEntity(id: string, data: { parent?: string, flag?: number, position?: number, next?: string }): Promise<SuccessResponse> {
        this.cache.delete(id)
        return this.rest.patch(Routes.EditEntity(id), data)
    }

    deleteEntity(id: string): Promise<SuccessResponse> {
        this.cache.delete(id)
        return this.rest.delete(Routes.Entity(id))
    }

    editMetadata(id: string, data: MetaDataEdit): Promise<SuccessResponse> {
        return this.rest.patch(Routes.EditMetaData(id), data)
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