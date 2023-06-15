export type Styles = "info" | "success" | "error" | "primary" | "secondary" | "tertiary" | "none"

export type Result = {
    ok: boolean,
    message: string
}

export type GenericChildrenProp = string | JSX.Element | JSX.Element[] | null