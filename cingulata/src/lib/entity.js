export class MetaData {
    constructor(parent, data, http) {
        this.parent = parent
        this.ageRating = data.age_rating
        this.name = data.name
        this.banner = data.banner
        this.thumbnail = data.thumbnail
        this.description = data.description
        this.language = data.language
        this.rating = data.rating
        this.year = data.year

        this.http = http
    }

    delete() {
        return new Promise((resolve, reject) => {
            this.http(`/content/${this.id}/metadata`, null, { method: "DELETE" })
            .then(() => resolve(this))
            .catch(e => reject(e))
        })
    }
}

export class Source {
    constructor(parent, data, http) {
        this.parent = parent
        this.id = data.id
        this.path = data.path
        this.position = data.position
        this.length = data.length
    }

    delete() {
        return new Promise((resolve, reject) => {
            this.http(`/content/${this.id}/source`, null, { method: "DELETE" })
            .then(() => resolve(this))
            .catch(e => reject(e))
        })
    }
}

/*
{
  "id": "7663234223340148693",
  "parent": "root",
  "flag": 1,
  "entity_type": "Audio",
  "creator_uid": 9,
  "position": 0,
  "sources": [
    {
      "id": "13262680081067581078",
      "parent": "7663234223340148693",
      "path": "edited",
      "position": 2
    },
    {
      "id": "18139209889691151936",
      "parent": "7663234223340148693",
      "path": "Audio",
      "position": 2
    },
    {
      "id": "13740461394287687084",
      "parent": "7663234223340148693",
      "path": "Audio",
      "position": 2
    }
  ],
  "metadata": {
    "parent": "7663234223340148693",
    "thumbnail": "img",
    "banner": "img",
    "description": "cool movie",
    "name": "cum",
    "rating": 5,
    "age_rating": "pg12",
    "language": "SWEDEN!!!",
    "year": 1912
  },
  "next": "asdasd"
}
*/

export default class Entity {
    constructor(data, http) {
        this.id = data.id
        this.parent = data.parent
        this.type = data.entity_type
        this.creatorId = data.creator_uid
        this.position = data.position
        this.flag = data.flag

        this.metadata = data.metadata ? new MetaData(this, data.metadata, http) : null
        this.sources = new Map()
        for(let source of data.sources.sort((a, b) => a.position - b.position))
            this.sources.set(source.id, new Source(this, source, http))

        this.http = http
    }

    delete() {
        return new Promise((resolve, reject) => {
            this.http(`/content/${this.id}/entity`, null, { method: "DELETE" })
            .then(() => resolve(this))
            .catch(e => reject(e))
        })
    }
}