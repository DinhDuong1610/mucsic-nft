"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Music2, Sparkles, Disc3, Library, PlusCircle } from "lucide-react"
import { WalletConnect } from "./WalletConnect"

const navItems = [
    {
        href: "/",
        label: "Studio",
        icon: Sparkles,
    },
    {
        href: "/mint",
        label: "Mint NFT",
        icon: PlusCircle,
    },
    {
        href: "/my-nfts",
        label: "Bộ sưu tập",
        icon: Library,
    },
]

export function StudioNavbar() {
    const pathname = usePathname()

    return (
        <nav className="glass-nav sticky top-0 z-50">
            <div className="studio-container">
                <div className="flex min-h-[76px] items-center justify-between gap-4">
                    <Link href="/" className="group flex items-center gap-3">
                        <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 shadow-2xl shadow-purple-500/20 backdrop-blur-xl transition-all duration-300 group-hover:scale-105 group-hover:border-cyan-300/40">
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500 via-fuchsia-500 to-cyan-400 opacity-90" />
                            <div className="absolute inset-[1px] rounded-2xl bg-slate-950/20" />
                            <Music2 className="relative z-10 h-6 w-6 text-white drop-shadow" />
                        </div>

                        <div className="hidden sm:block">
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-black tracking-tight text-white">
                                    SonicMint
                                </span>
                                <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-100">
                                    AI NFT
                                </span>
                            </div>
                            <p className="mt-0.5 text-xs font-medium text-slate-400">
                                AI Music • IPFS • Sepolia
                            </p>
                        </div>
                    </Link>

                    <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] p-1.5 shadow-inner shadow-white/5 backdrop-blur-xl md:flex">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const active =
                                item.href === "/"
                                    ? pathname === "/"
                                    : pathname.startsWith(item.href)

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={[
                                        "group relative flex items-center gap-2 overflow-hidden rounded-full px-4 py-2.5 text-sm font-bold transition-all duration-300",
                                        active
                                            ? "bg-white text-slate-950 shadow-lg shadow-cyan-500/15"
                                            : "text-slate-300 hover:bg-white/10 hover:text-white",
                                    ].join(" ")}
                                >
                                    {active && (
                                        <span className="absolute inset-0 bg-gradient-to-r from-cyan-200 via-white to-fuchsia-200 opacity-90" />
                                    )}
                                    <Icon className="relative z-10 h-4 w-4" />
                                    <span className="relative z-10">{item.label}</span>
                                </Link>
                            )
                        })}
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-xs font-bold text-emerald-100 lg:flex">
                            <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.9)]" />
                            Sepolia Ready
                        </div>

                        <WalletConnect />
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-3 md:hidden">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const active =
                            item.href === "/"
                                ? pathname === "/"
                                : pathname.startsWith(item.href)

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={[
                                    "flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold",
                                    active
                                        ? "border-cyan-300/40 bg-cyan-300/15 text-cyan-50"
                                        : "border-white/10 bg-white/[0.045] text-slate-300",
                                ].join(" ")}
                            >
                                <Icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        )
                    })}
                </div>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-300/30 to-transparent" />
        </nav>
    )
}