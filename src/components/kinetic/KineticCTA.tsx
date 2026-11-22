"use client";

export function KineticCTA() {
    return (
        <section id="contact" className="bg-[#FF4D00] py-16">
            <div className="container mx-auto px-4 max-w-[1400px] text-center">
                <h2 className="type-display text-[length:clamp(2.5rem,14vw,10rem)] leading-[0.9] text-black">
                    Start planning
                    <br />
                    <span>your next build</span>
                </h2>
                <div className="mt-10 flex justify-center">
                    <a
                        href="/signup"
                        className="inline-flex items-center rounded-full bg-black text-white font-mono text-sm uppercase px-8 py-4 transition-transform hover:scale-110"
                    >
                        Get started free
                    </a>
                </div>
            </div>
        </section>
    );
}
