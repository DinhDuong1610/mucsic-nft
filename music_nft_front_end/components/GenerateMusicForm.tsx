"use client"

import { useState } from 'react'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Database,
  Disc3,
  ExternalLink,
  Image as ImageIcon,
  Loader2,
  Music2,
  Play,
  Sparkles,
  Wand2,
} from 'lucide-react'
import { useToast } from './ui/use-toast'
import axios from 'axios'

interface GenerationStatus {
  status: 'idle' | 'generating' | 'uploading' | 'completed' | 'error'
  progress: number
  musicUrl?: string
  coverUrl?: string
  metadataUri?: string
  folderCid?: string
  gatewayUrl?: string
  tokenURIGateway?: string
  error?: string
}

export function GenerateMusicForm() {
  const [prompt, setPrompt] = useState('')
  const [status, setStatus] = useState<GenerationStatus>({
    status: 'idle',
    progress: 0,
  })
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const { toast } = useToast()

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập prompt để tạo nhạc',
        variant: 'destructive',
      })
      return
    }

    try {
      setStatus({ status: 'generating', progress: 10 })

      // Gọi AI API để tạo nhạc
      const aiResponse = await axios.post('/api/generate-music', {
        prompt: prompt.trim(),
      })

      // Hiển thị nhạc và ảnh NGAY SAU KHI GENERATE XONG
      setAudioUrl(aiResponse.data.musicUrl)
      setStatus({
        status: 'uploading',
        progress: 50,
        musicUrl: aiResponse.data.musicUrl,
        coverUrl: aiResponse.data.coverUrl,
      })

      // Upload lên IPFS và tạo metadata
      const ipfsResponse = await axios.post('/api/upload-ipfs', {
        musicUrl: aiResponse.data.musicUrl,
        coverUrl: aiResponse.data.coverUrl,
        prompt: prompt.trim(),
      })

      setStatus({
        status: 'completed',
        progress: 100,
        musicUrl: aiResponse.data.musicUrl,
        coverUrl: aiResponse.data.coverUrl,
        metadataUri: ipfsResponse.data.metadataUri,
        folderCid: ipfsResponse.data.folderCid,
        gatewayUrl: ipfsResponse.data.gatewayUrl,
        tokenURIGateway: ipfsResponse.data.tokenURIGateway,
      })

      // Lưu vào localStorage để dùng ở trang mint
      localStorage.setItem('pendingMint', JSON.stringify({
        musicUrlLocal: aiResponse.data.musicUrl,
        coverUrlLocal: aiResponse.data.coverUrl,
        musicUrlIpfs: ipfsResponse.data.musicUrl,
        coverUrlIpfs: ipfsResponse.data.coverUrl,
        metadataUri: ipfsResponse.data.metadataUri,
        prompt: prompt.trim(),
      }))

      toast({
        title: 'Thành công!',
        description: 'Nhạc đã được tạo và upload lên IPFS',
      })
    } catch (error: any) {
      console.error('Error generating music:', error)
      setStatus({
        status: 'error',
        progress: 0,
        error: error.response?.data?.error || 'Có lỗi xảy ra khi tạo nhạc',
      })
      toast({
        title: 'Lỗi',
        description: error.response?.data?.error || 'Có lỗi xảy ra khi tạo nhạc',
        variant: 'destructive',
      })
    }
  }

  const isProcessing = status.status === 'generating' || status.status === 'uploading'

  const statusLabel = {
    idle: 'Sẵn sàng tạo nhạc',
    generating: 'Đang tạo nhạc bằng AI...',
    uploading: 'Đang upload lên IPFS...',
    completed: 'Hoàn thành',
    error: 'Có lỗi xảy ra',
  }[status.status]

  return (
    <Card className="studio-card border-white/10 bg-transparent p-5 shadow-none sm:p-6 lg:p-8">
      <CardHeader className="space-y-5 p-0 pb-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="studio-badge mb-4 w-fit">
              <Wand2 className="h-4 w-4 text-cyan-200" />
              AI Generator
            </div>

            <CardTitle className="text-3xl font-black text-white sm:text-4xl">
              Tạo nhạc từ prompt
            </CardTitle>

            <CardDescription className="mt-3 max-w-2xl text-base leading-7 text-slate-400">
              Mô tả cảm xúc, thể loại, nhạc cụ hoặc bối cảnh. AI sẽ tạo file nhạc,
              ảnh cover và tự động đưa metadata lên IPFS.
            </CardDescription>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-400/15">
                <Sparkles className="h-5 w-5 text-purple-200" />
              </div>
              <div>
                <p className="text-sm font-black text-white">AI Pipeline</p>
                <p className="text-xs font-medium text-slate-500">MusicGen + IPFS</p>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-0">
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-sm font-black text-white">
              <Music2 className="h-4 w-4 text-cyan-200" />
              Prompt tạo nhạc
            </label>

            <div className="relative">
              <Textarea
                placeholder='Ví dụ: "A calm piano melody with soft ambient background and cinematic atmosphere"'
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={7}
                disabled={isProcessing}
                className="studio-input min-h-[190px] resize-none border-white/10 bg-slate-950/45 p-5 text-base leading-7 text-white placeholder:text-slate-500"
              />

              <div className="pointer-events-none absolute bottom-4 right-4 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-bold text-slate-400 backdrop-blur-xl">
                {prompt.length} ký tự
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Style
                </p>
                <p className="mt-1 text-sm font-bold text-slate-200">
                  Piano, Jazz, EDM
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Mood
                </p>
                <p className="mt-1 text-sm font-bold text-slate-200">
                  Calm, Epic, Dark
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Output
                </p>
                <p className="mt-1 text-sm font-bold text-slate-200">
                  Track + Cover
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[26px] border border-white/10 bg-slate-950/45 p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-200">
                  Status
                </p>
                <h3 className="mt-1 text-xl font-black text-white">
                  {statusLabel}
                </h3>
              </div>

              <div
                className={[
                  "flex h-12 w-12 items-center justify-center rounded-2xl",
                  status.status === 'completed'
                    ? "bg-emerald-400/15"
                    : status.status === 'error'
                      ? "bg-rose-400/15"
                      : "bg-purple-400/15",
                ].join(" ")}
              >
                {status.status === 'completed' ? (
                  <CheckCircle2 className="h-6 w-6 text-emerald-200" />
                ) : status.status === 'error' ? (
                  <AlertTriangle className="h-6 w-6 text-rose-200" />
                ) : isProcessing ? (
                  <Loader2 className="h-6 w-6 animate-spin text-cyan-200" />
                ) : (
                  <Disc3 className="h-6 w-6 text-purple-200" />
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-slate-300">Tiến trình</span>
                <span className="font-black text-white">{status.progress}%</span>
              </div>

              <div className="relative h-3 overflow-hidden rounded-full bg-white/10">
                <div
                  className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-cyan-400 transition-all duration-500"
                  style={{ width: `${status.progress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent" />
                </div>
              </div>

              {status.error && (
                <div className="rounded-2xl border border-rose-300/20 bg-rose-400/10 p-4 text-sm font-medium text-rose-100">
                  {status.error}
                </div>
              )}
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isProcessing}
              className="studio-button mt-6 w-full px-6 py-6 text-base"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5" />
                  Tạo nhạc AI
                </>
              )}
            </Button>
          </div>
        </div>

        {(status.status === 'uploading' || status.status === 'completed') && audioUrl && (
          <div className="rounded-[28px] border border-white/10 bg-slate-950/45 p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/15">
                <Music2 className="h-5 w-5 text-cyan-200" />
              </div>
              <div>
                <h3 className="font-black text-white">Bản xem trước</h3>
                <p className="text-sm text-slate-500">
                  Nghe thử track vừa được tạo trước khi mint NFT.
                </p>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-[160px_1fr]">
              {status.coverUrl ? (
                <div className="nft-media-frame aspect-square w-full overflow-hidden">
                  <img
                    src={status.coverUrl}
                    alt="Cover"
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="nft-media-frame flex aspect-square w-full items-center justify-center">
                  <ImageIcon className="h-10 w-10 text-slate-500" />
                </div>
              )}

              <div className="flex min-w-0 flex-col justify-center rounded-3xl border border-white/10 bg-white/[0.035] p-5">
                <p className="mb-3 text-sm font-bold text-slate-400">
                  Generated track
                </p>
                <audio controls className="w-full">
                  <source src={audioUrl} type="audio/wav" />
                  Trình duyệt của bạn không hỗ trợ audio.
                </audio>
              </div>
            </div>
          </div>
        )}

        {status.metadataUri && (
          <div className="rounded-[28px] border border-cyan-300/15 bg-cyan-400/10 p-5">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-300/15">
                <Database className="h-5 w-5 text-cyan-100" />
              </div>
              <div>
                <h3 className="font-black text-white">IPFS Metadata</h3>
                <p className="text-sm text-cyan-100/65">
                  Token URI đã sẵn sàng để mint NFT.
                </p>
              </div>
            </div>

            {/* <div className="space-y-4">
              {status.folderCid && (
                <div>
                  <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-100/70">
                    Folder CID
                  </p>
                  <p className="break-all rounded-2xl border border-white/10 bg-slate-950/55 p-3 font-mono text-xs text-cyan-50">
                    {status.folderCid}
                  </p>
                </div>
              )}

              <div>
                <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-100/70">
                  Token URI
                </p>
                <p className="break-all rounded-2xl border border-white/10 bg-slate-950/55 p-3 font-mono text-xs text-cyan-50">
                  {status.metadataUri}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                {status.tokenURIGateway && (
                  <a
                    href={status.tokenURIGateway}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="studio-button-secondary px-5 py-3 text-sm"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Xem metadata
                  </a>
                )}

                {status.gatewayUrl && (
                  <a
                    href={status.gatewayUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="studio-button-secondary px-5 py-3 text-sm"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Xem IPFS folder
                  </a>
                )}
              </div>
            </div> */}
          </div>
        )}

        {status.status === 'completed' && (
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={() => window.location.href = '/mint'}
              className="studio-button flex-1 px-6 py-6 text-base"
            >
              Mint NFT ngay
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}