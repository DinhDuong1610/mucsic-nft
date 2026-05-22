"use client"

import { useWallet } from "./WalletProvider"
import { Wallet, LogOut, CheckCircle2 } from "lucide-react"

export function WalletConnect() {
  const { account, connectWallet, disconnectWallet, isConnected } = useWallet()

  const handleConnect = async () => {
    try {
      await connectWallet()
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    }
  }

  if (isConnected && account) {
    return (
      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-sm font-bold text-cyan-50 shadow-lg shadow-cyan-500/10 sm:flex">
          <CheckCircle2 className="h-4 w-4 text-emerald-300" />
          <span>
            {account.slice(0, 6)}...{account.slice(-4)}
          </span>
        </div>

        <button
          type="button"
          onClick={disconnectWallet}
          className="group inline-flex h-11 items-center justify-center gap-2 rounded-full border border-rose-300/20 bg-rose-400/10 px-4 text-sm font-bold text-rose-100 shadow-lg shadow-rose-500/10 hover:border-rose-300/40 hover:bg-rose-400/15"
        >
          <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          <span className="hidden sm:inline">Ngắt ví</span>
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={handleConnect}
      className="group relative inline-flex h-11 items-center justify-center gap-2 overflow-hidden rounded-full border border-purple-300/30 bg-white px-4 text-sm font-black text-slate-950 shadow-xl shadow-purple-500/20 hover:shadow-cyan-500/25"
    >
      <span className="absolute inset-0 bg-gradient-to-r from-cyan-200 via-white to-fuchsia-200 opacity-100" />
      <span className="absolute inset-0 translate-x-[-120%] skew-x-[-18deg] bg-white/45 transition-transform duration-700 group-hover:translate-x-[160%]" />
      <Wallet className="relative z-10 h-4 w-4" />
      <span className="relative z-10">Kết nối ví</span>
    </button>
  )
}