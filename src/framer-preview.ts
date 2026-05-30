export const ControlType = {
    Image: "image",
    Number: "number",
    Color: "color",
    Boolean: "boolean",
    String: "string",
} as const

type PropertyControls = Record<
    string,
    {
        hidden?: (props: Record<string, unknown>) => boolean
        [key: string]: unknown
    }
>

export function addPropertyControls(
    _component: unknown,
    _controls: PropertyControls
) {
    return undefined
}
