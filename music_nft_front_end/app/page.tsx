'use client'

import Link from 'next/link'
import {
  ArrowRight,
  Cpu,
  Database,
  Disc3,
  Headphones,
  Image as ImageIcon,
  Music,
  Play,
  Rocket,
  Shield,
  Sparkles,
  Upload,
  Wallet,
  Wand2,
  Zap,
} from 'lucide-react'
import { StudioNavbar } from '@/components/StudioNavbar'
import { GenerateMusicForm } from '@/components/GenerateMusicForm'
import { UploadMusicForm } from '@/components/UploadMusicForm'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const stats = [
  {
    label: 'AI Pipeline',
    value: '2 bước',
    desc: 'Tạo nhạc và ảnh cover',
  },
  {
    label: 'Storage',
    value: 'IPFS',
    desc: 'Lưu metadata phi tập trung',
  },
  {
    label: 'Network',
    value: 'Sepolia',
    desc: 'Mint NFT trên testnet',
  },
]

const workflow = [
  {
    icon: Wand2,
    title: 'Nhập ý tưởng',
    desc: 'Viết prompt mô tả phong cách, cảm xúc hoặc bối cảnh bài nhạc bạn muốn tạo.',
  },
  {
    icon: Cpu,
    title: 'AI tạo nhạc',
    desc: 'Hệ thống gọi AI API để tạo file âm thanh và có thể sinh ảnh cover đi kèm.',
  },
  {
    icon: Database,
    title: 'Upload IPFS',
    desc: 'Nhạc, ảnh và metadata NFT được upload lên IPFS thông qua Pinata.',
  },
  {
    icon: Wallet,
    title: 'Mint NFT',
    desc: 'Kết nối MetaMask và mint tác phẩm thành NFT trên blockchain Sepolia.',
  },
]

const features = [
  {
    icon: Music,
    title: 'AI Music Generator',
    desc: 'Tạo nhạc từ prompt theo phong cách riêng, phù hợp demo AI kết hợp blockchain.',
    color: 'from-purple-500 to-fuchsia-500',
  },
  {
    icon: ImageIcon,
    title: 'NFT Metadata',
    desc: 'Tự động gom nhạc, ảnh cover, mô tả và thuộc tính thành metadata chuẩn NFT.',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    icon: Shield,
    title: 'Blockchain Ownership',
    desc: 'Mint NFT lên Sepolia để kiểm chứng quyền sở hữu và transaction trên Etherscan.',
    color: 'from-emerald-500 to-cyan-500',
  },
]

export default function Home() {
  return (
    <div className="studio-page">
      <StudioNavbar />

      <main className="relative z-10">
        {/* Hero */}
        <section className="studio-section pb-10 pt-16 lg:pb-16 lg:pt-24">
          <div className="studio-container">
            <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-8">
                <div className="studio-badge w-fit">
                  <Sparkles className="h-4 w-4 text-cyan-200" />
                  AI Music NFT Studio
                </div>

                <div className="space-y-6">
                  <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-[-0.075em] text-white sm:text-6xl lg:text-7xl xl:text-7xl">
                    Tạo nhạc bằng AI,
                    <br />
                    <span className="gradient-text">mint thành NFT.</span>
                  </h1>

                  <p className="max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
                    Biến một ý tưởng âm nhạc thành file nhạc, ảnh cover, metadata IPFS
                    và NFT trên blockchain chỉ trong một luồng thao tác.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <a
                    href="#studio-workspace"
                    className="studio-button px-6 py-3"
                  >
                    <Play className="h-5 w-5" />
                    Bắt đầu tạo nhạc
                    <ArrowRight className="h-5 w-5" />
                  </a>

                  <Link
                    href="/my-nfts"
                    className="studio-button-secondary px-6 py-3"
                  >
                    <Disc3 className="h-5 w-5" />
                    Xem bộ sưu tập
                  </Link>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {stats.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-3xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur-xl"
                    >
                      <div className="text-sm font-semibold text-slate-400">
                        {item.label}
                      </div>
                      <div className="mt-1 text-2xl font-black text-white">
                        {item.value}
                      </div>
                      <div className="mt-1 text-xs font-medium text-slate-500">
                        {item.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visual Hero Card */}
              <div className="relative">
                <div className="absolute -left-8 top-10 h-32 w-32 rounded-full bg-purple-500/30 blur-3xl" />
                <div className="absolute -right-8 bottom-10 h-40 w-40 rounded-full bg-cyan-500/25 blur-3xl" />

                <div className="studio-card studio-card-hover p-5 sm:p-6">
                  <div className="rounded-[24px] border border-white/10 bg-slate-950/55 p-5">
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">
                          Live Pipeline
                        </p>
                        <h2 className="mt-1 text-2xl font-black text-white">
                          SonicMint Engine
                        </h2>
                      </div>

                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-400 shadow-2xl shadow-cyan-500/20">
                        <Headphones className="h-6 w-6 text-white" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      {workflow.map((step, index) => {
                        const Icon = step.icon

                        return (
                          <div
                            key={step.title}
                            className="group flex gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition-all duration-300 hover:border-cyan-300/30 hover:bg-white/[0.07]"
                          >
                            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                              <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-300 text-[10px] font-black text-slate-950">
                                {index + 1}
                              </div>
                              <Icon className="h-5 w-5 text-cyan-100" />
                            </div>

                            <div>
                              <h3 className="font-black text-white">
                                {step.title}
                              </h3>
                              <p className="mt-1 text-sm leading-6 text-slate-400">
                                {step.desc}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="mt-5 rounded-2xl border border-emerald-300/15 bg-emerald-400/10 p-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-300/15">
                          <Zap className="h-5 w-5 text-emerald-200" />
                        </span>
                        <div>
                          <p className="font-black text-emerald-50">
                            Ready for Sepolia
                          </p>
                          <p className="text-sm text-emerald-100/70">
                            AI API, IPFS và smart contract đã kết nối.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* <div className="absolute -bottom-6 left-8 hidden rounded-3xl border border-white/10 bg-white/[0.07] px-5 py-4 shadow-2xl shadow-black/30 backdrop-blur-2xl lg:block">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-fuchsia-400/15">
                      <Rocket className="h-5 w-5 text-fuchsia-200" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-white">
                        Mint workflow
                      </p>
                      <p className="text-xs text-slate-400">
                        AI → IPFS → NFT
                      </p>
                    </div>
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        </section>

        {/* Workspace */}
        <section id="studio-workspace" className="studio-section py-12">
          <div className="studio-container">
            <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
              <div>
                <div className="studio-badge mb-4 w-fit">
                  <Disc3 className="h-4 w-4 text-cyan-200" />
                  Studio Workspace
                </div>

                <h2 className="text-4xl font-black text-white sm:text-5xl">
                  Chọn cách tạo NFT âm nhạc
                </h2>

                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">
                  Bạn có thể để AI tạo nhạc mới từ prompt, hoặc upload file nhạc và
                  cover có sẵn rồi đưa lên IPFS.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-4 text-sm text-slate-300 backdrop-blur-xl">
                <div className="flex items-center gap-2 font-bold text-white">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.9)]" />
                  Services online
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  localhost:8000 • localhost:3001 • Sepolia
                </p>
              </div>
            </div>

            <div className="studio-card p-4 sm:p-6 lg:p-8">
              <Tabs defaultValue="generate" className="w-full">
                <TabsList className="grid h-auto w-full grid-cols-1 gap-3 rounded-[24px] border border-white/10 bg-slate-950/50 p-2 sm:grid-cols-2">
                  <TabsTrigger
                    value="generate"
                    className="group flex min-h-[74px] items-center justify-start gap-4 rounded-[20px] border border-transparent px-5 text-left text-slate-300 transition-all duration-300 data-[state=active]:border-cyan-300/30 data-[state=active]:bg-white data-[state=active]:text-slate-950"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-400/15 text-purple-200 group-data-[state=active]:bg-purple-100 group-data-[state=active]:text-purple-700">
                      <Sparkles className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block text-base font-black">
                        Tạo nhạc bằng AI
                      </span>
                      <span className="mt-0.5 block text-xs font-medium opacity-70">
                        Nhập prompt và để AI tạo track mới
                      </span>
                    </span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="upload"
                    className="group flex min-h-[74px] items-center justify-start gap-4 rounded-[20px] border border-transparent px-5 text-left text-slate-300 transition-all duration-300 data-[state=active]:border-cyan-300/30 data-[state=active]:bg-white data-[state=active]:text-slate-950"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-200 group-data-[state=active]:bg-cyan-100 group-data-[state=active]:text-cyan-700">
                      <Upload className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block text-base font-black">
                        Upload file có sẵn
                      </span>
                      <span className="mt-0.5 block text-xs font-medium opacity-70">
                        Dùng nhạc và ảnh cover của riêng bạn
                      </span>
                    </span>
                  </TabsTrigger>
                </TabsList>

                <div className="mt-6 rounded-[24px] border border-white/10 bg-slate-950/35 p-4 sm:p-6">
                  <TabsContent value="generate" className="m-0">
                    <GenerateMusicForm />
                  </TabsContent>

                  <TabsContent value="upload" className="m-0">
                    <UploadMusicForm />
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="studio-section py-14">
          <div className="studio-container">
            <div className="mb-10 text-center">
              <div className="studio-badge mx-auto mb-4 w-fit">
                <Shield className="h-4 w-4 text-cyan-200" />
                Product Highlights
              </div>

              <h2 className="text-4xl font-black text-white sm:text-5xl">
                Một quy trình đầy đủ cho demo AI + Blockchain
              </h2>

              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-400">
                Giao diện tập trung vào trải nghiệm sản phẩm, còn logic phía sau vẫn
                giữ nguyên: AI API, Pinata IPFS và smart contract.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {features.map((item) => {
                const Icon = item.icon

                return (
                  <div
                    key={item.title}
                    className="studio-card studio-card-hover p-6"
                  >
                    <div
                      className={`mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br ${item.color} shadow-2xl shadow-purple-500/20`}
                    >
                      <Icon className="h-8 w-8 text-white" />
                    </div>

                    <h3 className="text-2xl font-black text-white">
                      {item.title}
                    </h3>

                    <p className="mt-3 leading-7 text-slate-400">
                      {item.desc}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="studio-section pt-8">
          <div className="studio-container">
            <div className="studio-card overflow-hidden p-8 sm:p-10 lg:p-12">
              <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <div className="studio-badge mb-4 w-fit">
                    <Zap className="h-4 w-4 text-yellow-200" />
                    Ready to mint
                  </div>

                  <h2 className="text-4xl font-black text-white sm:text-5xl">
                    Tạo tác phẩm âm nhạc đầu tiên của bạn
                  </h2>

                  <p className="mt-4 max-w-2xl leading-7 text-slate-400">
                    Sau khi tạo nhạc và upload IPFS thành công, bạn có thể chuyển
                    sang trang Mint để đưa tokenURI lên smart contract.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                  <a href="#studio-workspace" className="studio-button px-6 py-3">
                    Tạo nhạc ngay
                    <ArrowRight className="h-5 w-5" />
                  </a>

                  <Link href="/mint" className="studio-button-secondary px-6 py-3">
                    Đi tới Mint NFT
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 pb-10 pt-4">
        <div className="studio-container">
          <div className="studio-divider mb-6" />
          <div className="flex flex-col items-center justify-between gap-3 text-sm text-slate-500 md:flex-row">
            <p>
              SonicMint AI NFT Studio — AI Music, IPFS and Sepolia smart contract.
            </p>
            <p className="font-semibold text-slate-400">
              Built for blockchain learning project
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}