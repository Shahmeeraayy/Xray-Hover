import * as React from "react"
import { addPropertyControls, ControlType } from "framer"
import {
    motion,
    useMotionTemplate,
    useMotionValue,
    useSpring,
    useTransform,
} from "framer-motion"

type InteractivePortraitProps = {
    image: string
    revealImage: string
    backgroundText: string
    backgroundTextColor: string
    backgroundTextOpacity: number
    borderRadius: number
    intensity: number
    glowColor: string
    glowStrength: number
    revealSize: number
    revealSoftness: number
    showText: boolean
    title: string
    subtitle: string
    textColor: string
    overlayDarkness: number
}

const spring = {
    stiffness: 170,
    damping: 24,
    mass: 0.65,
}

function withAlpha(color: string, alpha: number) {
    if (!color.startsWith("#")) return color

    const hex = color.slice(1)
    const normalized =
        hex.length === 3
            ? hex
                  .split("")
                  .map((value) => value + value)
                  .join("")
            : hex

    const r = parseInt(normalized.slice(0, 2), 16)
    const g = parseInt(normalized.slice(2, 4), 16)
    const b = parseInt(normalized.slice(4, 6), 16)

    return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function InteractivePortrait(props: InteractivePortraitProps) {
    const {
        image = "",
        revealImage = "",
        backgroundText = "",
        backgroundTextColor = "#D71920",
        backgroundTextOpacity = 74,
        borderRadius = 28,
        intensity = 12,
        glowColor = "#FFFFFF",
        glowStrength = 42,
        revealSize = 230,
        revealSoftness = 42,
        showText = true,
        title = "Portrait",
        subtitle = "Interactive hover portrait",
        textColor = "#FFFFFF",
        overlayDarkness = 72,
    } = props

    const containerRef = React.useRef<HTMLDivElement>(null)

    const pointerX = useMotionValue(0)
    const pointerY = useMotionValue(0)
    const glowX = useMotionValue(0)
    const glowY = useMotionValue(0)
    const glowOpacity = useMotionValue(0)

    const smoothX = useSpring(pointerX, spring)
    const smoothY = useSpring(pointerY, spring)
    const smoothGlowOpacity = useSpring(glowOpacity, {
        stiffness: 140,
        damping: 22,
    })

    const imageX = useTransform(
        smoothX,
        [-0.5, 0.5],
        [-intensity * 1.25, intensity * 1.25]
    )
    const imageY = useTransform(
        smoothY,
        [-0.5, 0.5],
        [-intensity * 1.25, intensity * 1.25]
    )
    const revealScale = useTransform(smoothGlowOpacity, [0, 1], [1.04, 1.08])

    const glowAlpha = Math.min(Math.max(glowStrength, 0), 100) / 100
    const textOpacity = Math.min(Math.max(backgroundTextOpacity, 0), 100) / 100
    const readableTextOpacity = Math.min(textOpacity + 0.12, 0.92)
    const softStop = Math.max(revealSize - revealSoftness, 0)
    const activeRevealImage = revealImage || image
    const spotlight = useMotionTemplate`radial-gradient(circle at ${glowX}px ${glowY}px, ${withAlpha(
        glowColor,
        glowAlpha
    )} 0%, ${withAlpha(glowColor, glowAlpha * 0.36)} 22%, rgba(255,255,255,0) 58%)`
    const revealMask = useMotionTemplate`radial-gradient(circle ${revealSize}px at ${glowX}px ${glowY}px, #000 0px, #000 ${softStop}px, rgba(0,0,0,0.6) ${
        revealSize - revealSoftness * 0.45
    }px, transparent ${revealSize}px)`
    const revealRing = useMotionTemplate`radial-gradient(circle ${revealSize}px at ${glowX}px ${glowY}px, transparent 0px, transparent ${Math.max(
        revealSize - 6,
        0
    )}px, ${withAlpha(glowColor, glowAlpha * 0.9)} ${revealSize}px, transparent ${
        revealSize + 2
    }px)`

    React.useEffect(() => {
        const bounds = containerRef.current?.getBoundingClientRect()
        if (!bounds) return

        glowX.set(bounds.width / 2)
        glowY.set(bounds.height / 2)
    }, [glowX, glowY])

    function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
        const bounds = containerRef.current?.getBoundingClientRect()
        if (!bounds) return

        const x = event.clientX - bounds.left
        const y = event.clientY - bounds.top

        glowX.set(x)
        glowY.set(y)
        glowOpacity.set(1)
        pointerX.set(x / bounds.width - 0.5)
        pointerY.set(y / bounds.height - 0.5)
    }

    function handlePointerLeave() {
        pointerX.set(0)
        pointerY.set(0)
        glowOpacity.set(0)

        const bounds = containerRef.current?.getBoundingClientRect()
        if (!bounds) return

        glowX.set(bounds.width / 2)
        glowY.set(bounds.height / 2)
    }

    return (
        <div
            ref={containerRef}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            style={{
                width: "100%",
                height: "100%",
                position: "relative",
                borderRadius,
                overflow: "hidden",
                background: "transparent",
                containerType: "size",
            }}
        >
            <motion.div
                style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    borderRadius,
                    overflow: "hidden",
                    background:
                        "linear-gradient(180deg, #f7f7f5 0%, #ececea 54%, #dfdfdc 100%)",
                    boxShadow: `0 24px 90px ${withAlpha(
                        glowColor,
                        glowAlpha * 0.26
                    )}`,
                }}
            >
                {image ? (
                    <>
                        <motion.img
                            src={image}
                            alt=""
                            draggable={false}
                            style={{
                                position: "absolute",
                                inset: "-5%",
                                width: "110%",
                                height: "110%",
                                objectFit: "cover",
                                objectPosition: "center center",
                                x: imageX,
                                y: imageY,
                                scale: 1.035,
                                userSelect: "none",
                                pointerEvents: "none",
                                filter: "saturate(0.96) contrast(1.02)",
                                zIndex: 2,
                            }}
                        />

                        {backgroundText && (
                            <motion.div
                                aria-hidden
                                style={{
                                    position: "absolute",
                                    left: "50%",
                                    top: "43%",
                                    zIndex: 1,
                                    width: "96%",
                                    transform: "translate(-50%, -50%)",
                                    color: backgroundTextColor,
                                    opacity: textOpacity,
                                    fontFamily:
                                        "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
                                    fontSize:
                                        "clamp(54px, min(14cqw, 15cqh), 220px)",
                                    lineHeight: 0.84,
                                    fontWeight: 900,
                                    letterSpacing: 0,
                                    textAlign: "center",
                                    textTransform: "uppercase",
                                    mixBlendMode: "normal",
                                    textShadow:
                                        "0 1px 0 rgba(255,255,255,0.52), 0 18px 60px rgba(0,0,0,0.16)",
                                    pointerEvents: "none",
                                    userSelect: "none",
                                }}
                            >
                                {backgroundText}
                            </motion.div>
                        )}

                        {backgroundText && (
                            <motion.div
                                aria-hidden
                                style={{
                                    position: "absolute",
                                    left: "50%",
                                    top: "43%",
                                    zIndex: 3,
                                    width: "96%",
                                    transform: "translate(-50%, -50%)",
                                    color: "transparent",
                                    opacity: readableTextOpacity,
                                    fontFamily:
                                        "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
                                    fontSize:
                                        "clamp(54px, min(14cqw, 15cqh), 220px)",
                                    lineHeight: 0.84,
                                    fontWeight: 900,
                                    letterSpacing: 0,
                                    textAlign: "center",
                                    textTransform: "uppercase",
                                    WebkitTextStroke: `clamp(1px, 0.34cqw, 4px) ${backgroundTextColor}`,
                                    textShadow: `0 18px 70px ${withAlpha(
                                        backgroundTextColor,
                                        0.24
                                    )}`,
                                    pointerEvents: "none",
                                    userSelect: "none",
                                }}
                            >
                                {backgroundText}
                            </motion.div>
                        )}

                        {activeRevealImage && (
                            <motion.div
                                aria-hidden
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    opacity: smoothGlowOpacity,
                                    WebkitMaskImage: revealMask,
                                    maskImage: revealMask,
                                    WebkitMaskRepeat: "no-repeat",
                                    maskRepeat: "no-repeat",
                                    pointerEvents: "none",
                                    zIndex: 4,
                                }}
                            >
                                <motion.img
                                    src={activeRevealImage}
                                    alt=""
                                    draggable={false}
                                    style={{
                                        position: "absolute",
                                        inset: "-6%",
                                        width: "112%",
                                        height: "112%",
                                        objectFit: "cover",
                                        objectPosition: "center center",
                                        x: imageX,
                                        y: imageY,
                                        scale: revealScale,
                                        userSelect: "none",
                                        pointerEvents: "none",
                                        filter: "saturate(1.18) contrast(1.12)",
                                    }}
                                />
                                <div
                                    style={{
                                        position: "absolute",
                                        inset: 0,
                                        background:
                                            "repeating-linear-gradient(115deg, rgba(255,255,255,0.16) 0px, rgba(255,255,255,0.16) 1px, transparent 1px, transparent 10px)",
                                        mixBlendMode: "overlay",
                                        opacity: 0.34,
                                    }}
                                />
                            </motion.div>
                        )}
                    </>
                ) : (
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 24,
                            color: "rgba(255,255,255,0.58)",
                            fontFamily:
                                "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
                            fontSize: 14,
                            lineHeight: 1.4,
                            textAlign: "center",
                        }}
                    >
                        Upload a portrait image
                    </div>
                )}

                <motion.div
                    aria-hidden
                    style={{
                        position: "absolute",
                        inset: 0,
                        zIndex: 5,
                        background: spotlight,
                        opacity: smoothGlowOpacity,
                        mixBlendMode: "screen",
                        pointerEvents: "none",
                    }}
                />

                <div
                    aria-hidden
                    style={{
                        position: "absolute",
                        inset: 0,
                        zIndex: 6,
                        background: `linear-gradient(to top, rgba(0,0,0,${
                            overlayDarkness / 100
                        }) 0%, rgba(0,0,0,${
                            overlayDarkness / 260
                        }) 42%, rgba(0,0,0,0) 72%)`,
                        pointerEvents: "none",
                    }}
                />

                <div
                    aria-hidden
                    style={{
                        position: "absolute",
                        inset: 0,
                        zIndex: 7,
                        borderRadius,
                        border: "1px solid rgba(255,255,255,0.22)",
                        boxShadow:
                            "inset 0 1px 0 rgba(255,255,255,0.34), inset 0 -1px 0 rgba(255,255,255,0.1)",
                        background:
                            "linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.035) 42%, rgba(255,255,255,0.12))",
                        pointerEvents: "none",
                    }}
                />

                <motion.div
                    aria-hidden
                    style={{
                        position: "absolute",
                        inset: 0,
                        zIndex: 8,
                        background: revealRing,
                        opacity: smoothGlowOpacity,
                        mixBlendMode: "screen",
                        pointerEvents: "none",
                    }}
                />

                {showText && (
                    <motion.div
                        style={{
                            position: "absolute",
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 9,
                            padding: "clamp(18px, 7cqw, 34px)",
                            color: textColor,
                            fontFamily:
                                "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
                            pointerEvents: "none",
                        }}
                    >
                        <div
                            style={{
                                margin: 0,
                                fontSize: "clamp(22px, 9cqw, 44px)",
                                lineHeight: 1,
                                fontWeight: 700,
                                letterSpacing: 0,
                                overflowWrap: "anywhere",
                            }}
                        >
                            {title}
                        </div>
                        {subtitle && (
                            <div
                                style={{
                                    marginTop: 8,
                                    fontSize: "clamp(13px, 3.5cqw, 16px)",
                                    lineHeight: 1.35,
                                    fontWeight: 500,
                                    letterSpacing: 0,
                                    opacity: 0.78,
                                    overflowWrap: "anywhere",
                                }}
                            >
                                {subtitle}
                            </div>
                        )}
                    </motion.div>
                )}
            </motion.div>
        </div>
    )
}

addPropertyControls(InteractivePortrait, {
    image: {
        type: ControlType.Image,
        title: "Image",
    },
    revealImage: {
        type: ControlType.Image,
        title: "Reveal",
    },
    backgroundText: {
        type: ControlType.String,
        title: "BG Text",
        defaultValue: "",
    },
    backgroundTextColor: {
        type: ControlType.Color,
        title: "BG Text Color",
        defaultValue: "#D71920",
    },
    backgroundTextOpacity: {
        type: ControlType.Number,
        title: "BG Text Opacity",
        defaultValue: 74,
        min: 0,
        max: 100,
        step: 1,
        unit: "%",
    },
    borderRadius: {
        type: ControlType.Number,
        title: "Radius",
        defaultValue: 28,
        min: 0,
        max: 80,
        step: 1,
        unit: "px",
    },
    intensity: {
        type: ControlType.Number,
        title: "Parallax",
        defaultValue: 12,
        min: 0,
        max: 30,
        step: 1,
    },
    glowColor: {
        type: ControlType.Color,
        title: "Glow Color",
        defaultValue: "#FFFFFF",
    },
    glowStrength: {
        type: ControlType.Number,
        title: "Glow",
        defaultValue: 42,
        min: 0,
        max: 100,
        step: 1,
        unit: "%",
    },
    revealSize: {
        type: ControlType.Number,
        title: "Reveal Size",
        defaultValue: 230,
        min: 80,
        max: 520,
        step: 1,
        unit: "px",
    },
    revealSoftness: {
        type: ControlType.Number,
        title: "Soft Edge",
        defaultValue: 42,
        min: 8,
        max: 140,
        step: 1,
        unit: "px",
    },
    showText: {
        type: ControlType.Boolean,
        title: "Text",
        defaultValue: true,
        enabledTitle: "Show",
        disabledTitle: "Hide",
    },
    title: {
        type: ControlType.String,
        title: "Title",
        defaultValue: "Portrait",
        hidden: (props) => !props.showText,
    },
    subtitle: {
        type: ControlType.String,
        title: "Subtitle",
        defaultValue: "Interactive hover portrait",
        hidden: (props) => !props.showText,
    },
    textColor: {
        type: ControlType.Color,
        title: "Text Color",
        defaultValue: "#FFFFFF",
        hidden: (props) => !props.showText,
    },
    overlayDarkness: {
        type: ControlType.Number,
        title: "Overlay",
        defaultValue: 72,
        min: 0,
        max: 100,
        step: 1,
        unit: "%",
    },
})
