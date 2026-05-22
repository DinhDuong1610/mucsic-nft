"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Database,
  Disc3,
  ExternalLink,
  Image as ImageIcon,
  Loader2,
  Music2,
  Rocket,
  ShieldCheck,
  Sparkles,
  Wallet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { WalletConnect } from '@/components/WalletConnect'
import { useWallet } from '@/components/WalletProvider'
import { useToast } from '@/components/ui/use-toast'
import { mintNFT } from '@/lib/contract'
import { StudioNavbar } from '@/components/StudioNavbar'

interface PendingMint {
  musicUrlLocal?: string
  coverUrlLocal?: string
  musicUrlIpfs?: string
  coverUrlIpfs?: string

  // Legacy support
  musicUrl?: string
  coverUrl?: string

  metadataUri: string
  prompt?: string
  name?: string
  artist?: string
}

export default function MintPage() {
  const [pendingMint, setPendingMint] = useState<PendingMint | null>(null)
  const [isMinting, setIsMinting] = useState(false)
  const { account, isConnected } = useWallet()
  const { toast } = useToast()

  useEffect(() => {
    const stored = localStorage.getItem('pendingMint')
    if (stored) {
      setPendingMint(JSON.parse(stored))
    }
  }, [])

  const handleMint = async () => {
    if (!isConnected || !account) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng kết nối ví MetaMask trước',
        variant: 'destructive',
      })
      return
    }

    if (!pendingMint) {
      toast({
        title: 'Lỗi',
        description: 'Không có nhạc để mint',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsMinting(true)
      const txHash = await mintNFT(account, pendingMint.metadataUri)

      toast({
        title: 'Thành công!',
        description: `NFT đã được mint! TX: ${txHash.slice(0, 10)}...`,
      })

      // Xóa pending mint sau khi thành công
      localStorage.removeItem('pendingMint')
      setPendingMint(null)
    } catch (error: any) {
      console.error('Error minting NFT:', error)
      toast({
        title: 'Lỗi',
        description: error.message || 'Có lỗi xảy ra khi mint NFT',
        variant: 'destructive',
      })
    } finally {
      setIsMinting(false)
    }
  }

  if (!pendingMint) {
    return (
      <div className="studio-page">
        <StudioNavbar />

        <main className="studio-container py-14">
          <div className="mx-auto max-w-3xl">
            <Card className="studio-card p-6 shadow-none sm:p-8 lg:p-10">
              <CardHeader className="p-0 text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[28px] border border-cyan-300/20 bg-cyan-300/10 shadow-2xl shadow-cyan-500/10">
                  <AlertCircle className="h-10 w-10 text-cyan-100" />
                </div>

                <div className="studio-badge mx-auto mb-5 w-fit">
                  <Disc3 className="h-4 w-4 text-cyan-200" />
                  No pending NFT
                </div>

                <CardTitle className="text-4xl font-black text-white sm:text-5xl">
                  Chưa có nhạc để mint
                </CardTitle>

                <CardDescription className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-400">
                  Bạn cần tạo nhạc bằng AI hoặc upload file nhạc trước. Sau khi có
                  tokenURI IPFS, hệ thống sẽ đưa bạn đến bước mint NFT.
                </CardDescription>
              </CardHeader>

              <CardContent className="mt-8 flex flex-col items-center gap-4 p-0 sm:flex-row sm:justify-center">
                <Link href="/" className="studio-button px-6 py-3">
                  <ArrowLeft className="h-5 w-5" />
                  Quay lại Studio
                </Link>

                <Link href="/my-nfts" className="studio-button-secondary px-6 py-3">
                  <Disc3 className="h-5 w-5" />
                  Xem bộ sưu tập
                </Link>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  const coverSrc = pendingMint.coverUrlLocal || pendingMint.coverUrl
  const musicSrc = pendingMint.musicUrlLocal || pendingMint.musicUrl
  const title = pendingMint.name || 'AI Music NFT'
  const artist = pendingMint.artist || 'AI Composer'
  const description = pendingMint.prompt || pendingMint.name || 'AI generated music NFT'

  return (
    <div className="studio-page">
      <StudioNavbar />

      <main className="relative z-10">
        <section className="studio-section pb-10 pt-14">
          <div className="studio-container">
            <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <div className="studio-badge mb-5 w-fit">
                  <Rocket className="h-4 w-4 text-cyan-200" />
                  Mint Transaction
                </div>

                <h1 className="text-5xl font-black leading-tight text-white sm:text-6xl lg:text-7xl">
                  Mint Music
                  <br />
                  <span className="gradient-text">NFT của bạn</span>
                </h1>

                <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-400">
                  Kiểm tra thông tin tác phẩm, xác nhận tokenURI và ký giao dịch
                  bằng MetaMask để mint NFT lên Sepolia.
                </p>
              </div>

              <div className="rounded-3xl border border-emerald-300/20 bg-emerald-400/10 p-4 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-300/15">
                    <ShieldCheck className="h-6 w-6 text-emerald-200" />
                  </span>
                  <div>
                    <p className="text-sm font-black text-emerald-50">
                      Sepolia Network
                    </p>
                    <p className="text-xs text-emerald-100/70">
                      Smart contract ready
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
              {/* Preview NFT */}
              <Card className="studio-card p-5 shadow-none sm:p-6 lg:p-8">
                <CardHeader className="p-0 pb-6">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="studio-badge mb-4 w-fit">
                        <Sparkles className="h-4 w-4 text-cyan-200" />
                        NFT Preview
                      </div>

                      <CardTitle className="text-3xl font-black text-white sm:text-4xl">
                        {title}
                      </CardTitle>

                      <CardDescription className="mt-2 text-base text-slate-400">
                        Nghệ sĩ: {artist}
                      </CardDescription>
                    </div>

                    <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-500 to-cyan-400 shadow-2xl shadow-cyan-500/20">
                      <Music2 className="h-7 w-7 text-white" />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6 p-0">
                  <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
                    <div className="nft-media-frame aspect-square w-full overflow-hidden">
                      {coverSrc ? (
                        <img
                          src={coverSrc}
                          alt="Cover"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            // Fallback to IPFS if local fails
                            if (
                              pendingMint.coverUrlIpfs &&
                              e.currentTarget.src !== pendingMint.coverUrlIpfs
                            ) {
                              e.currentTarget.src = pendingMint.coverUrlIpfs
                            }
                          }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ImageIcon className="h-16 w-16 text-slate-500" />
                        </div>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-col gap-5">
                      <div className="rounded-[26px] border border-white/10 bg-slate-950/45 p-5">
                        <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-cyan-100/70">
                          Mô tả / Prompt
                        </p>
                        <p className="leading-7 text-slate-300">
                          {description}
                        </p>
                      </div>

                      {musicSrc && (
                        <div className="rounded-[26px] border border-white/10 bg-slate-950/45 p-5">
                          <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-400/15">
                              <Disc3 className="h-5 w-5 text-purple-200" />
                            </div>
                            <div>
                              <h3 className="font-black text-white">
                                Audio Preview
                              </h3>
                              <p className="text-sm text-slate-500">
                                Nghe lại track trước khi mint.
                              </p>
                            </div>
                          </div>

                          <audio controls className="w-full">
                            <source src={musicSrc} type="audio/wav" />
                            {pendingMint.musicUrlIpfs && (
                              <source src={pendingMint.musicUrlIpfs} type="audio/mpeg" />
                            )}
                            Trình duyệt của bạn không hỗ trợ audio.
                          </audio>
                        </div>
                      )}

                      <div className="rounded-[26px] border border-cyan-300/15 bg-cyan-400/10 p-5">
                        <div className="mb-4 flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-300/15">
                            <Database className="h-5 w-5 text-cyan-100" />
                          </div>
                          <div>
                            <h3 className="font-black text-white">
                              Metadata URI
                            </h3>
                            <p className="text-sm text-cyan-100/65">
                              TokenURI sẽ được ghi vào smart contract.
                            </p>
                          </div>
                        </div>

                        {/* <p className="break-all rounded-2xl border border-white/10 bg-slate-950/55 p-4 font-mono text-xs leading-6 text-cyan-50">
                          {pendingMint.metadataUri}
                        </p> */}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mint Panel */}
              <Card className="studio-card p-5 shadow-none sm:p-6 lg:p-7">
                <CardHeader className="p-0 pb-6">
                  <div className="studio-badge mb-4 w-fit">
                    <Wallet className="h-4 w-4 text-cyan-200" />
                    Wallet & Mint
                  </div>

                  <CardTitle className="text-3xl font-black text-white">
                    Xác nhận mint
                  </CardTitle>

                  <CardDescription className="mt-2 leading-7 text-slate-400">
                    Kết nối ví MetaMask và ký giao dịch để tạo NFT.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-5 p-0">
                  <div className="rounded-[26px] border border-white/10 bg-slate-950/45 p-5">
                    <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                      Trạng thái ví
                    </p>

                    {isConnected && account ? (
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/15">
                          <CheckCircle2 className="h-5 w-5 text-emerald-200" />
                        </div>

                        <div className="min-w-0">
                          <p className="font-black text-emerald-50">
                            Ví đã kết nối
                          </p>
                          <p className="mt-1 break-all font-mono text-xs leading-5 text-emerald-100/70">
                            {account}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-400/15">
                            <AlertCircle className="h-5 w-5 text-amber-200" />
                          </div>

                          <div>
                            <p className="font-black text-amber-50">
                              Chưa kết nối ví
                            </p>
                            <p className="mt-1 text-sm leading-6 text-amber-100/70">
                              Bạn cần kết nối MetaMask trước khi mint NFT.
                            </p>
                          </div>
                        </div>

                        <WalletConnect />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                        Network
                      </p>
                      <p className="mt-2 font-black text-white">
                        Sepolia
                      </p>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                        Storage
                      </p>
                      <p className="mt-2 font-black text-white">
                        IPFS
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[26px] border border-white/10 bg-slate-950/45 p-5">
                    <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                      Checklist
                    </p>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm text-slate-300">
                        <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                        Metadata IPFS đã sẵn sàng
                      </div>

                      <div className="flex items-center gap-3 text-sm text-slate-300">
                        <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                        Smart contract đã deploy
                      </div>

                      <div className="flex items-center gap-3 text-sm text-slate-300">
                        {isConnected ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-amber-300" />
                        )}
                        Ví MetaMask đã kết nối
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleMint}
                    disabled={!isConnected || isMinting}
                    className="studio-button w-full px-6 py-7 text-base"
                    size="lg"
                  >
                    {isMinting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Đang mint NFT...
                      </>
                    ) : (
                      <>
                        <Rocket className="mr-2 h-5 w-5" />
                        Mint NFT lên Sepolia
                      </>
                    )}
                  </Button>

                  {!isConnected && (
                    <p className="text-center text-sm font-medium text-slate-500">
                      Vui lòng kết nối ví MetaMask để bật nút mint.
                    </p>
                  )}

                  <div className="flex flex-col gap-3 pt-2">
                    <Link href="/" className="studio-button-secondary px-5 py-3 text-sm">
                      <ArrowLeft className="h-4 w-4" />
                      Quay lại Studio
                    </Link>

                    <Link href="/my-nfts" className="studio-button-secondary px-5 py-3 text-sm">
                      <ExternalLink className="h-4 w-4" />
                      Xem bộ sưu tập NFT
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}