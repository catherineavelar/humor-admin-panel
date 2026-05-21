'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const JEWEL = {
    emerald: { bg: '#064e3b', text: '#ecfdf5', accent: '#10b981' },
    sapphire: { bg: '#1e3a5f', text: '#eff6ff', accent: '#3b82f6' },
    ruby:     { bg: '#7f1d1d', text: '#fff1f2', accent: '#ef4444' },
    amber:    { bg: '#78350f', text: '#fffbeb', accent: '#f59e0b' },
}

export default function OverviewPage() {
    const [stats, setStats] = useState({
        totalProfiles: 0,
        totalImages: 0,
        totalCaptions: 0,
        totalVotes: 0,
        totalSaves: 0,
        avgCaptionsPerImage: 0,
    })
    const [topCaption, setTopCaption] = useState<any>(null)
    const [topThemes, setTopThemes] = useState<any[]>([])
    const [monthlyData, setMonthlyData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const chartRef = useRef<HTMLCanvasElement>(null)
    const chartInstance = useRef<any>(null)

    useEffect(() => {
        async function fetchAll() {
            const [
                { count: profiles },
                { count: images },
                { count: captions },
                { count: votes },
                { count: saves },
            ] = await Promise.all([
                supabase.from('profiles').select('*', { count: 'exact', head: true }),
                supabase.from('images').select('*', { count: 'exact', head: true }),
                supabase.from('captions').select('*', { count: 'exact', head: true }),
                supabase.from('caption_votes').select('*', { count: 'exact', head: true }),
                supabase.from('caption_saves').select('*', { count: 'exact', head: true }),
            ])

            const totalImages = images || 0
            const totalCaptions = captions || 0

            setStats({
                totalProfiles: profiles || 0,
                totalImages,
                totalCaptions,
                totalVotes: votes || 0,
                totalSaves: saves || 0,
                avgCaptionsPerImage: totalImages > 0 ? Math.round(totalCaptions / totalImages) : 0,
            })

            const { data: topCaptionData } = await supabase
                .from('captions')
                .select('content, like_count')
                .order('like_count', { ascending: false })
                .limit(1)
                .single()
            setTopCaption(topCaptionData)

            const { data: themesData } = await supabase
                .from('humor_themes')
                .select('name')
                .limit(8)
            setTopThemes(themesData || [])

            const hardcodedMonthly = [
                { month: '2025-02', count: 20 },
                { month: '2025-03', count: 699 },
                { month: '2025-04', count: 14965 },
                { month: '2025-05', count: 1869 },
                { month: '2025-06', count: 720 },
                { month: '2025-07', count: 1791 },
                { month: '2025-08', count: 16604 },
                { month: '2025-09', count: 4002 },
                { month: '2025-10', count: 816 },
                { month: '2025-11', count: 5225 },
                { month: '2025-12', count: 650 },
                { month: '2026-01', count: 6696 },
                { month: '2026-02', count: 6604 },
                { month: '2026-03', count: 19957 },
                { month: '2026-04', count: 15446 },
                { month: '2026-05', count: 8750 },
            ]
            setMonthlyData(hardcodedMonthly)

            setLoading(false)
        }
        fetchAll()
    }, [])

    useEffect(() => {
        if (monthlyData.length === 0 || !chartRef.current) return

        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js'
        script.onload = () => {
            if (chartInstance.current) chartInstance.current.destroy()
            const ctx = chartRef.current!.getContext('2d')!
            chartInstance.current = new (window as any).Chart(ctx, {
                type: 'line',
                data: {
                    labels: monthlyData.map((d) => d.month),
                    datasets: [{
                        label: 'Captions created',
                        data: monthlyData.map((d) => d.count),
                        borderColor: '#1e3a5f',
                        backgroundColor: 'rgba(30, 58, 95, 0.06)',
                        borderWidth: 2,
                        pointRadius: 4,
                        pointBackgroundColor: '#1e3a5f',
                        tension: 0.4,
                        fill: true,
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: { color: 'rgba(0,0,0,0.04)' },
                            ticks: { color: '#9ca3af', font: { size: 11 } },
                        },
                        x: {
                            grid: { display: false },
                            ticks: { color: '#9ca3af', font: { size: 11 }, maxRotation: 45 },
                        }
                    }
                }
            })
        }
        document.head.appendChild(script)
        return () => { if (chartInstance.current) chartInstance.current.destroy() }
    }, [monthlyData])

    const statCards = [
        { label: 'Total Users',            value: stats.totalProfiles.toLocaleString(),       jewel: JEWEL.emerald },
        { label: 'Total Images',           value: stats.totalImages.toLocaleString(),          jewel: JEWEL.sapphire },
        { label: 'Total Captions',         value: stats.totalCaptions.toLocaleString(),        jewel: JEWEL.ruby },
        { label: 'Avg captions per image', value: stats.avgCaptionsPerImage.toLocaleString(),  jewel: JEWEL.amber },
    ]

    const themeColors = [
        '#064e3b', '#1e3a5f', '#7f1d1d', '#78350f',
        '#3b0764', '#134e4a', '#1e1b4b', '#4c1d95',
    ]

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
                <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-1">Overview</h1>
                <p className="text-gray-400 text-sm mb-12">Platform stats and highlights</p>

                {loading ? (
                    <p className="text-gray-400 text-sm">Loading...</p>
                ) : (
                    <div className="flex flex-col gap-12">

                        {/* Stat cards */}
                        <div className="grid grid-cols-2 gap-3">
                            {statCards.map((card) => (
                                <div
                                    key={card.label}
                                    className="rounded-2xl p-7 flex flex-col justify-between"
                                    style={{ backgroundColor: card.jewel.bg, minHeight: 130 }}
                                >
                                    <p
                                        className="text-4xl font-semibold tracking-tight mb-2"
                                        style={{ color: card.jewel.text }}
                                    >
                                        {card.value}
                                    </p>
                                    <p
                                        className="text-sm font-medium uppercase tracking-widest"
                                        style={{ color: card.jewel.accent }}
                                    >
                                        {card.label}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Most liked caption */}
                        {topCaption && (
                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
                                    Most liked caption
                                </h3>
                                <div className="border border-gray-200 rounded-2xl p-8 relative overflow-hidden">
                                    <span
                                        className="absolute top-4 left-6 text-8xl font-serif leading-none select-none"
                                        style={{ color: 'rgba(0,0,0,0.05)' }}
                                    >
                                        "
                                    </span>
                                    <p className="text-gray-900 text-xl font-medium leading-relaxed mb-4 relative z-10">
                                        {topCaption.content}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                                            {topCaption.like_count} likes
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Humor themes */}
                        <div>
                            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
                                Humor themes
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {topThemes.map((theme, i) => (
                                    <span
                                        key={theme.name}
                                        className="text-white text-xs font-medium px-4 py-2 rounded-full"
                                        style={{ backgroundColor: themeColors[i % themeColors.length] }}
                                    >
                                        {theme.name}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Chart */}
                        <div>
                            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
                                Captions created over time
                            </h3>
                            <div className="border border-gray-200 rounded-2xl p-6">
                                <canvas ref={chartRef} />
                            </div>
                        </div>

                    </div>
                )}
            </main>
        </div>
    )
}