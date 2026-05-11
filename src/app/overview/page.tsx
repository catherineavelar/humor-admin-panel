'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

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


                const { data: captionsData } = await supabase
                    .from('captions')
                    .select('created_datetime_utc')
                    .order('created_datetime_utc', { ascending: true })

                if (captionsData) {
                    const counts: Record<string, number> = {}
                    captionsData.forEach((c) => {
                        const date = new Date(c.created_datetime_utc)
                        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
                        counts[key] = (counts[key] || 0) + 1
                    })
                    setMonthlyData(Object.entries(counts).map(([month, count]) => ({ month, count })))
                }




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
                        borderColor: '#a78bfa',
                        backgroundColor: 'rgba(167, 139, 250, 0.1)',
                        borderWidth: 2,
                        pointRadius: 4,
                        pointBackgroundColor: '#a78bfa',
                        tension: 0.4,
                        fill: true,
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: { color: 'rgba(0,0,0,0.05)' },
                            ticks: { color: '#9ca3af' },
                        },
                        x: {
                            grid: { display: false },
                            ticks: { color: '#9ca3af' },
                        }
                    }
                }
            })
        }
        document.head.appendChild(script)
        return () => { if (chartInstance.current) chartInstance.current.destroy() }
    }, [monthlyData])

    return (
        <div className="min-h-screen bg-white text-gray-900">
            <nav className="border-b border-gray-200 px-8 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3">
                    <img src="/logo.png" alt="Humor Admin" className="h-12 w-auto" />
                    <span className="text-lg font-medium text-gray-900">Humor Admin Panel</span>
                </Link>
                <Link href="/" className="text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition">
                    ← Back
                </Link>
            </nav>

            <main className="p-8 max-w-3xl mx-auto">
                <h2 className="text-2xl font-medium mb-1 mt-8">Overview</h2>
                <p className="text-gray-400 text-sm mb-8">Platform stats and highlights</p>

                {loading ? (
                    <p className="text-gray-400">Loading...</p>
                ) : (
                    <div className="flex flex-col gap-8">

                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'Total Users', value: stats.totalProfiles.toLocaleString(), bg: 'bg-purple-50' },
                                { label: 'Total Images', value: stats.totalImages.toLocaleString(), bg: 'bg-teal-50' },
                                { label: 'Total Captions', value: stats.totalCaptions.toLocaleString(), bg: 'bg-pink-50' },
                                { label: 'Avg captions per image', value: stats.avgCaptionsPerImage.toLocaleString(), bg: 'bg-orange-50' },
                            ].map((card) => (
                                <div key={card.label} className={`${card.bg} rounded-xl p-6 border border-gray-100`}>
                                    <p className="text-3xl font-medium mb-1">{card.value}</p>
                                    <p className="text-gray-500 text-sm">{card.label}</p>
                                </div>
                            ))}
                        </div>

                        {topCaption && (
                            <div>
                                <h3 className="text-base font-medium mb-3 text-gray-700">Most liked caption</h3>
                                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                                    <p className="text-gray-900 text-lg mb-2">"{topCaption.content}"</p>
                                    <p className="text-gray-400 text-sm">{topCaption.like_count} likes</p>
                                </div>
                            </div>
                        )}

                        <div>
                            <h3 className="text-base font-medium mb-3 text-gray-700">Humor themes</h3>
                            <div className="flex flex-wrap gap-2">
                                {topThemes.map((theme) => (
                                    <span key={theme.name} className="bg-purple-50 text-purple-700 text-sm px-3 py-1.5 rounded-full border border-purple-100">
                    {theme.name}
                  </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-base font-medium mb-3 text-gray-700">Captions created over time</h3>
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                                <canvas ref={chartRef} />
                            </div>
                        </div>

                    </div>
                )}
            </main>
        </div>
    )
}