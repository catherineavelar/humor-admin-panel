'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const JEWEL = {
    ruby:     { bg: '#7f1d1d', text: '#fff1f2', accent: '#ef4444' },
    sapphire: { bg: '#1e3a5f', text: '#eff6ff', accent: '#3b82f6' },
}

export default function CaptionsPage() {
    const [stats, setStats] = useState({
        totalCaptions: 0,
        featuredCaptions: 0,
        avgLikes: 0,
    })
    const [topCaptions, setTopCaptions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchCaptions() {
            const [
                { count: total },
                { count: featured },
                { data: top },
                { data: likesData },
            ] = await Promise.all([
                supabase.from('captions').select('*', { count: 'exact', head: true }),
                supabase.from('captions').select('*', { count: 'exact', head: true }).eq('is_featured', true),
                supabase.from('captions').select('content, like_count').order('like_count', { ascending: false }).limit(5),
                supabase.from('captions').select('like_count').limit(1000),
            ])

            const avg = likesData ? Math.round(likesData.reduce((sum, c) => sum + (c.like_count || 0), 0) / likesData.length) : 0

            setStats({
                totalCaptions: total || 0,
                featuredCaptions: featured || 0,
                avgLikes: avg,
            })
            setTopCaptions(top || [])
            setLoading(false)
        }
        fetchCaptions()
    }, [])

    return (
        <div className="min-h-screen bg-white text-gray-900">
            <nav className="border-b border-gray-200 px-10 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3">
                    <img src="/logo2.png" alt="Humor Admin" className="h-12 w-auto" />
                    <span className="text-lg font-medium text-gray-900">Humor Admin Panel</span>
                </Link>
                <Link
                    href="/"
                    className="text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-900 hover:text-white transition-all duration-200 rounded-full px-5 py-2"
                >
                    ← Back
                </Link>
            </nav>

            <main className="px-10 py-16 max-w-4xl mx-auto">
                <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-1">Captions</h1>
                <p className="text-gray-400 text-sm mb-12">Caption summary and highlights</p>

                {loading ? (
                    <p className="text-gray-400 text-sm">Loading...</p>
                ) : (
                    <div className="flex flex-col gap-12">

                        {/* Jewel stat cards */}
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'Total Captions',    value: stats.totalCaptions.toLocaleString(),    jewel: JEWEL.ruby },
                                { label: 'Featured Captions', value: stats.featuredCaptions.toLocaleString(), jewel: JEWEL.sapphire },
                            ].map((card) => (
                                <div
                                    key={card.label}
                                    className="rounded-2xl p-7 flex flex-col justify-between"
                                    style={{ backgroundColor: card.jewel.bg, minHeight: 130 }}
                                >
                                    <p className="text-4xl font-semibold tracking-tight" style={{ color: card.jewel.text }}>
                                        {card.value}
                                    </p>
                                    <p className="text-xs font-semibold uppercase tracking-widest mt-2" style={{ color: card.jewel.accent }}>
                                        {card.label}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Top captions */}
                        <div>
                            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
                                Top 5 captions by likes
                            </h3>
                            <div className="flex flex-col gap-2">
                                {topCaptions.map((caption, index) => (
                                    <div
                                        key={index}
                                        className="border border-gray-200 rounded-xl px-5 py-4 flex items-center gap-5 hover:border-gray-400 transition"
                                    >
                                        <span className="text-sm font-bold text-gray-900 w-5 shrink-0">
                                            {index + 1}
                                        </span>
                                        <p className="text-sm text-gray-700 flex-1 leading-relaxed">
                                            "{caption.content}"
                                        </p>
                                        <div className="text-right shrink-0">
                                            <p className="text-sm font-semibold text-gray-900">{caption.like_count}</p>
                                            <p className="text-xs text-gray-400">likes</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                )}
            </main>
        </div>
    )
}