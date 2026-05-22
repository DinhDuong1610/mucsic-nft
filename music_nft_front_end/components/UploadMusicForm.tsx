"use client"

import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import {
    AlertTriangle,
    ArrowRight,
    CheckCircle2,
    Database,
    Disc3,
    ExternalLink,
    FileAudio,
    FileText,
    Image as ImageIcon,
    Loader2,
    Music,
    RefreshCcw,
    Upload,
    User,
} from 'lucide-react'
import { useToast } from './ui/use-toast'

interface UploadStatus {
    status: 'idle' | 'uploading' | 'completed' | 'error'
    progress: number
    musicUrl?: string
    coverUrl?: string
    metadataUri?: string
    folderCid?: string
    gatewayUrl?: string
    tokenURIGateway?: string
    error?: string
}

export function UploadMusicForm() {
    const [musicFile, setMusicFile] = useState<File | null>(null)
    const [coverFile, setCoverFile] = useState<File | null>(null)
    const [musicName, setMusicName] = useState('')
    const [artist, setArtist] = useState('')
    const [description, setDescription] = useState('')
    const [status, setStatus] = useState<UploadStatus>({
        status: 'idle',
        progress: 0,
    })
    const { toast } = useToast()

    const handleUpload = async () => {
        if (!musicFile) {
            toast({
                title: 'Lỗi',
                description: 'Vui lòng chọn file nhạc',
                variant: 'destructive',
            })
            return
        }

        if (!coverFile) {
            toast({
                title: 'Lỗi',
                description: 'Vui lòng chọn ảnh cover',
                variant: 'destructive',
            })
            return
        }

        if (!musicName.trim()) {
            toast({
                title: 'Lỗi',
                description: 'Vui lòng nhập tên bài nhạc',
                variant: 'destructive',
            })
            return
        }

        try {
            setStatus({ status: 'uploading', progress: 10 })

            // Create FormData
            const formData = new FormData()
            formData.append('track', musicFile)
            formData.append('cover', coverFile)
            formData.append('name', musicName.trim())
            formData.append('prompt', description.trim() || musicName.trim())
            formData.append('username', artist.trim() || 'Unknown Artist')

            setStatus({ status: 'uploading', progress: 30 })

            // Upload to IPFS backend
            const IPFS_API_URL = process.env.IPFS_API_URL || 'http://localhost:3001'
            const response = await fetch(`${IPFS_API_URL}/upload`, {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Failed to upload to IPFS')
            }

            setStatus({ status: 'uploading', progress: 80 })

            const data = await response.json()

            console.log('Backend response:', data)

            const ipfsToGateway = (ipfsUrl: string) => {
                if (!ipfsUrl) return ''
                if (ipfsUrl.startsWith('ipfs://')) {
                    const ipfsPath = ipfsUrl.replace('ipfs://', '')
                    const [cid, ...pathParts] = ipfsPath.split('/')
                    const path = pathParts.join('/')

                    return `/api/ipfs-proxy?cid=${cid}${path ? `&path=${encodeURIComponent(path)}` : ''}`
                }
                return ipfsUrl
            }

            setStatus({
                status: 'completed',
                progress: 100,
                musicUrl: ipfsToGateway(data.trackUrl),
                coverUrl: ipfsToGateway(data.coverUrl),
                metadataUri: data.metadataUri || data.tokenURI,
                folderCid: data.folderCid,
                gatewayUrl: data.gatewayUrl,
                tokenURIGateway: data.tokenURIGateway,
            })

            localStorage.setItem('pendingMint', JSON.stringify({
                musicUrl: ipfsToGateway(data.trackUrl),
                coverUrl: ipfsToGateway(data.coverUrl),
                metadataUri: data.metadataUri || data.tokenURI,
                name: musicName.trim(),
                artist: artist.trim() || 'Unknown Artist',
            }))

            toast({
                title: 'Thành công!',
                description: 'File đã được upload lên IPFS',
            })
        } catch (error: any) {
            console.error('Error uploading to IPFS:', error)
            setStatus({
                status: 'error',
                progress: 0,
                error: error.message || 'Có lỗi xảy ra khi upload',
            })
            toast({
                title: 'Lỗi',
                description: error.message || 'Có lỗi xảy ra khi upload',
                variant: 'destructive',
            })
        }
    }

    const handleReset = () => {
        setMusicFile(null)
        setCoverFile(null)
        setMusicName('')
        setArtist('')
        setDescription('')
        setStatus({
            status: 'idle',
            progress: 0,
        })
    }

    const isUploading = status.status === 'uploading'

    const statusLabel = {
        idle: 'Sẵn sàng upload',
        uploading: 'Đang upload lên IPFS...',
        completed: 'Upload hoàn tất',
        error: 'Có lỗi xảy ra',
    }[status.status]

    return (
        <Card className="studio-card border-white/10 bg-transparent p-5 shadow-none sm:p-6 lg:p-8">
            <CardHeader className="space-y-5 p-0 pb-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <div className="studio-badge mb-4 w-fit">
                            <Upload className="h-4 w-4 text-cyan-200" />
                            Manual Upload
                        </div>

                        <CardTitle className="text-3xl font-black text-white sm:text-4xl">
                            Upload nhạc có sẵn
                        </CardTitle>

                        <CardDescription className="mt-3 max-w-2xl text-base leading-7 text-slate-400">
                            Chọn file nhạc, ảnh cover và thông tin metadata. Hệ thống sẽ upload
                            lên IPFS và tạo tokenURI để mint NFT.
                        </CardDescription>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur-xl">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/15">
                                <Database className="h-5 w-5 text-cyan-200" />
                            </div>
                            <div>
                                <p className="text-sm font-black text-white">Pinata IPFS</p>
                                <p className="text-xs font-medium text-slate-500">Track + Cover + Metadata</p>
                            </div>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-6 p-0">
                <div className="grid gap-5 lg:grid-cols-[1fr_330px]">
                    <div className="space-y-5">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-[26px] border border-white/10 bg-slate-950/45 p-5">
                                <label className="mb-4 flex items-center gap-2 text-sm font-black text-white">
                                    <FileAudio className="h-4 w-4 text-purple-200" />
                                    File nhạc
                                </label>

                                <Input
                                    type="file"
                                    accept=".wav,.mp3,.ogg,audio/wav,audio/mpeg,audio/ogg"
                                    onChange={(e) => setMusicFile(e.target.files?.[0] || null)}
                                    disabled={isUploading}
                                    className="studio-input cursor-pointer border-white/10 bg-white/[0.035] file:mr-4 file:rounded-full file:border-0 file:bg-purple-500 file:px-4 file:py-2 file:text-sm file:font-bold file:text-white hover:file:bg-purple-600"
                                />

                                <div className="mt-4 min-h-[44px] rounded-2xl border border-white/10 bg-white/[0.035] p-3">
                                    {musicFile ? (
                                        <div className="flex items-center gap-3 text-sm text-emerald-100">
                                            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300" />
                                            <span className="line-clamp-1 font-bold">{musicFile.name}</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 text-sm text-slate-500">
                                            <Disc3 className="h-5 w-5 shrink-0" />
                                            <span>Chưa chọn file nhạc</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-[26px] border border-white/10 bg-slate-950/45 p-5">
                                <label className="mb-4 flex items-center gap-2 text-sm font-black text-white">
                                    <ImageIcon className="h-4 w-4 text-cyan-200" />
                                    Ảnh cover
                                </label>

                                <Input
                                    type="file"
                                    accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                                    onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                                    disabled={isUploading}
                                    className="studio-input cursor-pointer border-white/10 bg-white/[0.035] file:mr-4 file:rounded-full file:border-0 file:bg-cyan-500 file:px-4 file:py-2 file:text-sm file:font-bold file:text-white hover:file:bg-cyan-600"
                                />

                                <div className="mt-4 min-h-[44px] rounded-2xl border border-white/10 bg-white/[0.035] p-3">
                                    {coverFile ? (
                                        <div className="flex items-center gap-3 text-sm text-emerald-100">
                                            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300" />
                                            <span className="line-clamp-1 font-bold">{coverFile.name}</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 text-sm text-slate-500">
                                            <ImageIcon className="h-5 w-5 shrink-0" />
                                            <span>Chưa chọn ảnh cover</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-[26px] border border-white/10 bg-slate-950/45 p-5">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-fuchsia-400/15">
                                    <FileText className="h-5 w-5 text-fuchsia-200" />
                                </div>
                                <div>
                                    <h3 className="font-black text-white">Thông tin metadata</h3>
                                    <p className="text-sm text-slate-500">
                                        Những thông tin này sẽ được ghi vào metadata NFT.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-white">
                                        Tên bài nhạc <span className="text-rose-300">*</span>
                                    </label>
                                    <Input
                                        placeholder="Ví dụ: Sunset Dreams"
                                        value={musicName}
                                        onChange={(e) => setMusicName(e.target.value)}
                                        disabled={isUploading}
                                        className="studio-input border-white/10 bg-white/[0.035]"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-black text-white">
                                        <User className="h-4 w-4 text-cyan-200" />
                                        Nghệ sĩ
                                    </label>
                                    <Input
                                        placeholder="Ví dụ: Duong Dinh"
                                        value={artist}
                                        onChange={(e) => setArtist(e.target.value)}
                                        disabled={isUploading}
                                        className="studio-input border-white/10 bg-white/[0.035]"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-black text-white">
                                        Mô tả
                                    </label>
                                    <Textarea
                                        placeholder="Mô tả ngắn về bài nhạc, cảm xúc, phong cách hoặc câu chuyện phía sau tác phẩm..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={4}
                                        disabled={isUploading}
                                        className="studio-input min-h-[120px] resize-none border-white/10 bg-white/[0.035] leading-7"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[26px] border border-white/10 bg-slate-950/45 p-5">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-200">
                                    Upload Status
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
                                            : "bg-cyan-400/15",
                                ].join(" ")}
                            >
                                {status.status === 'completed' ? (
                                    <CheckCircle2 className="h-6 w-6 text-emerald-200" />
                                ) : status.status === 'error' ? (
                                    <AlertTriangle className="h-6 w-6 text-rose-200" />
                                ) : isUploading ? (
                                    <Loader2 className="h-6 w-6 animate-spin text-cyan-200" />
                                ) : (
                                    <Upload className="h-6 w-6 text-cyan-200" />
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
                                    className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 transition-all duration-500"
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

                        <div className="mt-6 space-y-3">
                            {status.status !== 'completed' && (
                                <Button
                                    onClick={handleUpload}
                                    disabled={isUploading}
                                    className="studio-button w-full px-6 py-6 text-base"
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Đang upload...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="mr-2 h-5 w-5" />
                                            Upload lên IPFS
                                        </>
                                    )}
                                </Button>
                            )}

                            {status.status === 'completed' && (
                                <div className="grid gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={handleReset}
                                        className="studio-button-secondary w-full px-6 py-6 text-base"
                                    >
                                        <RefreshCcw className="mr-2 h-5 w-5" />
                                        Upload file khác
                                    </Button>

                                    <Button
                                        onClick={() => window.location.href = '/mint'}
                                        className="studio-button w-full px-6 py-6 text-base"
                                    >
                                        Mint NFT
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {status.status === 'completed' && (
                    <div className="rounded-[28px] border border-white/10 bg-slate-950/45 p-5">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-400/15">
                                <Music className="h-5 w-5 text-purple-200" />
                            </div>
                            <div>
                                <h3 className="font-black text-white">Preview NFT Asset</h3>
                                <p className="text-sm text-slate-500">
                                    File đã được upload thành công và sẵn sàng mint.
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
                                        onError={(e) => {
                                            console.error('Image failed to load:', status.coverUrl)
                                            e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect width="160" height="160" fill="%230f172a"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%2394a3b8">No Image</text></svg>'
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="nft-media-frame flex aspect-square w-full items-center justify-center">
                                    <ImageIcon className="h-10 w-10 text-slate-500" />
                                </div>
                            )}

                            <div className="flex min-w-0 flex-col justify-center rounded-3xl border border-white/10 bg-white/[0.035] p-5">
                                <div className="mb-4">
                                    <p className="text-lg font-black text-white">
                                        {musicName || 'Untitled Track'}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        {artist || 'Unknown Artist'}
                                    </p>
                                </div>

                                {status.musicUrl ? (
                                    <audio
                                        controls
                                        className="w-full"
                                        onError={(e) => {
                                            console.error('Audio failed to load:', status.musicUrl)
                                            console.error('Audio error:', e.currentTarget.error)
                                        }}
                                    >
                                        <source src={status.musicUrl} type="audio/mpeg" />
                                        <source src={status.musicUrl} type="audio/wav" />
                                        <source src={status.musicUrl} type="audio/ogg" />
                                        Trình duyệt của bạn không hỗ trợ audio.
                                    </audio>
                                ) : (
                                    <p className="text-sm text-rose-300">Music URL not available</p>
                                )}
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
                                <h3 className="font-black text-white">IPFS Information</h3>
                                <p className="text-sm text-cyan-100/65">
                                    Metadata đã được tạo và lưu trên IPFS.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
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
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}