"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Disc3,
  ExternalLink,
  Image as ImageIcon,
  Library,
  Loader2,
  Music2,
  Pause,
  Play,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Wallet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { WalletConnect } from '@/components/WalletConnect'
import { useWallet } from '@/components/WalletProvider'
import { fetchUserNFTs, fetchTokenURI } from '@/lib/contract'
import { StudioNavbar } from '@/components/StudioNavbar'
import axios from 'axios'

interface NFT {
  tokenId: string
  metadataUri: string
  metadata?: {
    name: string
    description: string
    image: string
    animation_url: string
    music?: string
    attributes?: Array<{ trait_type: string; value: string }>
  }
}

const CONTRACT_ADDRESS = '0x335fd1a8321Fa31c4fAe09d80Cea41796508fc4D'

export default function MyNFTsPage() {
  const [nfts, setNfts] = useState<NFT[]>([])
  const [loading, setLoading] = useState(true)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const { account, isConnected } = useWallet()

  useEffect(() => {
    if (isConnected && account) {
      loadNFTs()
    } else {
      setLoading(false)
    }
  }, [isConnected, account])

  const loadNFTs = async () => {
    if (!account) return

    try {
      setLoading(true)
      const tokenIds = await fetchUserNFTs(account)

      const nftPromises = tokenIds.map(async (tokenId) => {
        try {
          const metadataUri = await fetchTokenURI(tokenId)
          const metadata = await fetchMetadata(metadataUri)
          return { tokenId, metadataUri, metadata }
        } catch (error) {
          console.error(`Error loading NFT ${tokenId}:`, error)
          return { tokenId, metadataUri: '', metadata: undefined }
        }
      })

      const nftData = await Promise.all(nftPromises)
      setNfts(nftData.filter(nft => nft.metadata))
    } catch (error) {
      console.error('Error loading NFTs:', error)
    } finally {
      setLoading(false)
    }
  }

  const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs'

  const extractIpfsPath = (uri: string) => {
    if (!uri) return ''

    if (uri.startsWith('ipfs://')) {
      return uri.replace('ipfs://', '')
    }

    if (uri.includes('/ipfs/')) {
      return uri.split('/ipfs/')[1]
    }

    try {
      const url = new URL(uri)
      const host = url.hostname
      const ipfsIndex = host.indexOf('.ipfs.')

      if (ipfsIndex > 0) {
        const cid = host.substring(0, ipfsIndex)
        const path = url.pathname.replace(/^\/+/, '')
        return path ? `${cid}/${path}` : cid
      }
    } catch {
      // ignore invalid URL
    }

    return uri
  }

  const toPinataUrl = (uri: string, parentUri?: string) => {
    if (!uri) return ''

    if (
      parentUri &&
      !uri.startsWith('ipfs://') &&
      !uri.startsWith('http://') &&
      !uri.startsWith('https://')
    ) {
      const parentPath = extractIpfsPath(parentUri)
      const parts = parentPath.split('/')

      if (parts[parts.length - 1]?.includes('.')) {
        parts.pop()
      }

      return `${PINATA_GATEWAY}/${parts.join('/')}/${uri}`
    }

    const ipfsPath = extractIpfsPath(uri)
    return `${PINATA_GATEWAY}/${ipfsPath}`
  }

  const fetchMetadata = async (uri: string): Promise<any> => {
    if (!uri || uri.includes('QmDummyHash123456789')) {
      throw new Error('Skip dummy metadata URI')
    }

    const httpUrl = toPinataUrl(uri)

    const response = await axios.get(httpUrl, {
      timeout: 20000,
    })

    return response.data
  }

  const getIpfsUrl = (uri: string, parentUri?: string) => {
    return toPinataUrl(uri, parentUri)
  }

  const togglePlay = (tokenId: string) => {
    setPlayingId(playingId === tokenId ? null : tokenId)
  }

  if (!isConnected) {
    return (
      <div className="studio-page">
        <StudioNavbar />

        <main className="studio-container py-14">
          <div className="mx-auto max-w-3xl">
            <Card className="studio-card p-6 text-center shadow-none sm:p-8 lg:p-10">
              <CardHeader className="p-0">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[28px] border border-cyan-300/20 bg-cyan-300/10 shadow-2xl shadow-cyan-500/10">
                  <Wallet className="h-10 w-10 text-cyan-100" />
                </div>

                <div className="studio-badge mx-auto mb-5 w-fit">
                  <Library className="h-4 w-4 text-cyan-200" />
                  Wallet Required
                </div>

                <CardTitle className="text-4xl font-black text-white sm:text-5xl">
                  Kết nối ví để xem bộ sưu tập
                </CardTitle>

                <CardDescription className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-400">
                  Trang này sẽ đọc NFT thuộc ví MetaMask của bạn trên Sepolia.
                  Hãy kết nối ví để tải danh sách NFT âm nhạc đã mint.
                </CardDescription>
              </CardHeader>

              <CardContent className="mt-8 flex justify-center p-0">
                <WalletConnect />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="studio-page">
      <StudioNavbar />

      <main className="relative z-10">
        <section className="studio-section pb-10 pt-14">
          <div className="studio-container">
            <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <div className="studio-badge mb-5 w-fit">
                  <Sparkles className="h-4 w-4 text-cyan-200" />
                  NFT Collection
                </div>

                <h1 className="text-5xl font-black leading-tight text-white sm:text-6xl lg:text-7xl">
                  Bộ sưu tập
                  <br />
                  <span className="gradient-text">Music NFT</span>
                </h1>

                <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-400">
                  Toàn bộ NFT âm nhạc đã mint từ ví của bạn. Metadata được đọc từ
                  IPFS, còn quyền sở hữu được xác minh qua smart contract trên Sepolia.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-300/15">
                    <CheckCircle2 className="h-6 w-6 text-emerald-200" />
                  </span>
                  <div>
                    <p className="text-sm font-black text-white">
                      Ví đã kết nối
                    </p>
                    <p className="max-w-[220px] truncate font-mono text-xs text-slate-500">
                      {account}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8 grid gap-4 md:grid-cols-3">
              <div className="studio-card p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-400/15">
                    <Disc3 className="h-6 w-6 text-purple-200" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-400">
                      Tổng NFT
                    </p>
                    <p className="text-3xl font-black text-white">
                      {loading ? '...' : nfts.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="studio-card p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/15">
                    <ShieldCheck className="h-6 w-6 text-cyan-200" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-400">
                      Network
                    </p>
                    <p className="text-3xl font-black text-white">
                      Sepolia
                    </p>
                  </div>
                </div>
              </div>

              <div className="studio-card p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/15">
                    <Music2 className="h-6 w-6 text-emerald-200" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-400">
                      Asset
                    </p>
                    <p className="text-3xl font-black text-white">
                      IPFS
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8 flex justify-end">
              <Button
                onClick={loadNFTs}
                disabled={loading}
                className="studio-button-secondary px-5 py-3"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCcw className="h-4 w-4" />
                )}
                Tải lại bộ sưu tập
              </Button>
            </div>

            {loading ? (
              <div className="studio-card p-10 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-400/15">
                  <Loader2 className="h-8 w-8 animate-spin text-cyan-200" />
                </div>
                <h2 className="text-3xl font-black text-white">
                  Đang tải bộ sưu tập...
                </h2>
                <p className="mt-3 text-slate-400">
                  Hệ thống đang đọc token từ smart contract và tải metadata IPFS.
                </p>
              </div>
            ) : nfts.length === 0 ? (
              <Card className="studio-card mx-auto max-w-3xl p-6 text-center shadow-none sm:p-8 lg:p-10">
                <CardHeader className="p-0">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[28px] border border-purple-300/20 bg-purple-300/10">
                    <AlertCircle className="h-10 w-10 text-purple-100" />
                  </div>

                  <CardTitle className="text-4xl font-black text-white">
                    Chưa có NFT hợp lệ
                  </CardTitle>

                  <CardDescription className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-400">
                    Có thể bạn chưa mint NFT nào, hoặc các NFT hiện có đang dùng
                    metadata test không hợp lệ. Hãy tạo và mint tác phẩm đầu tiên.
                  </CardDescription>
                </CardHeader>

                <CardContent className="mt-8 flex justify-center p-0">
                  <Link href="/" className="studio-button px-6 py-3">
                    <ArrowLeft className="h-5 w-5" />
                    Tạo nhạc ngay
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {nfts.map((nft) => {
                  const imageUrl = nft.metadata?.image
                    ? getIpfsUrl(nft.metadata.image, nft.metadataUri)
                    : ''

                  const audioUrl = getIpfsUrl(
                    nft.metadata?.animation_url || nft.metadata?.music || '',
                    nft.metadataUri
                  )

                  return (
                    <Card
                      key={nft.tokenId}
                      className="studio-card studio-card-hover overflow-hidden p-0 shadow-none"
                    >
                      <div className="relative">
                        <div className="aspect-square overflow-hidden bg-slate-950/60">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={nft.metadata?.name || `NFT #${nft.tokenId}`}
                              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                              onError={(e) => {
                                e.currentTarget.src =
                                  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="600"%3E%3Crect width="600" height="600" fill="%230f172a"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%2394a3b8" font-size="32"%3ENo Image%3C/text%3E%3C/svg%3E'
                              }}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <ImageIcon className="h-16 w-16 text-slate-500" />
                            </div>
                          )}
                        </div>

                        <div className="absolute left-4 top-4 rounded-full border border-white/15 bg-slate-950/65 px-3 py-1.5 text-xs font-black text-white backdrop-blur-xl">
                          Token #{nft.tokenId}
                        </div>

                        <button
                          type="button"
                          onClick={() => togglePlay(nft.tokenId)}
                          className="absolute bottom-4 right-4 flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white text-slate-950 shadow-2xl shadow-black/30 transition hover:scale-105"
                        >
                          {playingId === nft.tokenId ? (
                            <Pause className="h-6 w-6" />
                          ) : (
                            <Play className="ml-0.5 h-6 w-6" />
                          )}
                        </button>
                      </div>

                      <CardHeader className="p-5 pb-3">
                        <CardTitle className="min-h-[32px] text-2xl font-black text-white">
                          {nft.metadata?.name || `NFT #${nft.tokenId}`}
                        </CardTitle>

                        <CardDescription className="mt-2 min-h-[56px] text-sm leading-6 text-slate-400">
                          {nft.metadata?.description || 'Music NFT'}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-4 p-5 pt-0">
                        {playingId === nft.tokenId && audioUrl && (
                          <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-3">
                            <audio controls autoPlay className="w-full" src={audioUrl}>
                              Trình duyệt của bạn không hỗ trợ audio.
                            </audio>
                          </div>
                        )}

                        {nft.metadata?.attributes && nft.metadata.attributes.length > 0 && (
                          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                            <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                              Thuộc tính
                            </p>

                            <div className="grid gap-2">
                              {nft.metadata.attributes.map((attr, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between gap-3 rounded-xl bg-slate-950/45 px-3 py-2 text-sm"
                                >
                                  <span className="font-bold text-slate-400">
                                    {attr.trait_type}
                                  </span>
                                  <span className="text-right font-black text-white">
                                    {attr.value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <a
                          href={`https://sepolia.etherscan.io/token/${CONTRACT_ADDRESS}?a=${nft.tokenId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="studio-button-secondary w-full px-4 py-3 text-sm"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Xem trên Etherscan
                        </a>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="relative z-10 pb-10 pt-4">
        <div className="studio-container">
          <div className="studio-divider mb-6" />
          <div className="flex flex-col items-center justify-between gap-3 text-sm text-slate-500 md:flex-row">
            <p>
              SonicMint AI NFT Studio — Bộ sưu tập NFT âm nhạc trên Sepolia.
            </p>
            <p className="font-semibold text-slate-400">
              Powered by AI • IPFS • Smart Contract
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}