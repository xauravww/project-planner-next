"use client";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="en">
            <body style={{ background: "#fff" }}>
                <div
                    style={{
                        minHeight: "100vh",
                        background: "#fff",
                        color: "#000",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "1rem",
                        textAlign: "center",
                        fontFamily: "var(--font-mono), 'Space Mono', monospace",
                    }}
                >
                    <p style={{ fontSize: "12px", textTransform: "uppercase", color: "#FF4D00" }}>
                        Unexpected error
                    </p>
                    <h1
                        style={{
                            fontFamily: "var(--font-display), 'Archivo Black', sans-serif",
                            textTransform: "uppercase",
                            letterSpacing: "-0.04em",
                            fontSize: "clamp(2.5rem,10vw,8rem)",
                            lineHeight: "0.9",
                            margin: "1rem 0 0",
                        }}
                    >
                        Something went wrong
                    </h1>
                    <div style={{ width: "40px", height: "4px", background: "#FF4D00", marginTop: "1rem" }} />
                    <p style={{ marginTop: "1.25rem", maxWidth: "28rem", color: "rgba(0,0,0,0.7)" }}>
                        An unexpected error occurred. Try again, or head back home.
                    </p>
                    <button
                        onClick={reset}
                        style={{
                            marginTop: "2rem",
                            border: "2px solid #000",
                            background: "#000",
                            color: "#fff",
                            fontFamily: "var(--font-mono), 'Space Mono', monospace",
                            textTransform: "uppercase",
                            fontSize: "12px",
                            padding: "10px 18px",
                            cursor: "pointer",
                        }}
                    >
                        Try again
                    </button>
                </div>
            </body>
        </html>
    );
}
