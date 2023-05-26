import { Client } from "../client";
import { Rest } from "../rest";

export class UserManager {

    rest: Rest
    constructor(client: Client) {
        this.rest = client.rest
    }
}