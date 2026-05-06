'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalProfiles: 0,
        totalImages: 0,
        totalCaptions: 0,
        totalVotes: 0,
        totalCaptionSaves: 0,
        totalReportedImages: 0,
        totalReportedCaptions: 0,
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchStats() {
            const [
                { count: profiles },
                { count: images },
                { count: captions },
                { count: votes },
                { count: saves },
                { count: reportedImages },
                { count: reportedCaptions },
            ] = await Promise.all([
                supabase.from('profiles').select('*', { count: 'exact', head: true }),
                supabase.from('images').select('*', { count: 'exact', head: true }),
                supabase.from('captions').select('*', { count: 'exact', head: true }),
                supabase.from('caption_votes').select('*', { count: 'exact', head: true }),
                supabase.from('caption_saves').select('*', { count: 'exact', head: true }),
                supabase.from('reported_images').select('*', { count: 'exact', head: true }),
                supabase.from('reported_captions').select('*', { count: 'exact', head: true }),
            ])

            setStats({
                totalProfiles: profiles || 0,
                totalImages: images || 0,
                totalCaptions: captions || 0,
                totalVotes: votes || 0,
                totalCaptionSaves: saves || 0,
                totalReportedImages: reportedImages || 0,
                totalReportedCaptions: reportedCaptions || 0,
            })
            setLoading(false)
        }
        fetchStats()
    }, [])

    const statCards = [
        { label: 'Total Users', value: stats.totalProfiles, color: 'bg-blue-500' },
        { label: 'Total Images', value: stats.totalImages, color: 'bg-purple-500' },
        { label: 'Total Captions', value: stats.totalCaptions, color: 'bg-pink-500' },
        { label: 'Caption Votes', value: stats.totalVotes, color: 'bg-yellow-500' },
        { label: 'Caption Saves', value: stats.totalCaptionSaves, color: 'bg-green-500' },
        { label: 'Reported Images', value: stats.totalReportedImages, color: 'bg-red-500' },
        { label: 'Reported Captions', value: stats.totalReportedCaptions, color: 'bg-orange-500' },
    ]

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <nav className="bg-gray-900 border-b border-gray-800 px-8 py-4 flex items-center justify-between">
                <h1 className="text-xl font-bold">🎭 Humor Admin</h1>
                <div className="flex gap-6 text-sm">
                    <Link href="/" className="text-white font-semibold">Dashboard</Link>
                    <Link href="/profiles" className="text-gray-400 hover:text-white">Profiles</Link>
                    <Link href="/images" className="text-gray-400 hover:text-white">Images</Link>
                    <Link href="/captions" className="text-gray-400 hover:text-white">Captions</Link>
                </div>
                <button
                    onClick={async () => { await supabase.auth.signOut(); window.location.href = '/login' }}
                    className="text-sm text-gray-400 hover:text-white"
                >
                    Sign out
                </button>
            </nav>

            <main className="p-8">
                <h2 className="text-2xl font-bold mb-2">Dashboard</h2>
                <p className="text-gray-400 mb-8">Live statistics from The Humor Project</p>

                {loading ? (
                    <p className="text-gray-400">Loading stats...</p>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {statCards.map((card) => (
                            <div key={card.label} className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                                <div className={`w-3 h-3 rounded-full ${card.color} mb-3`} />
                                <p className="text-3xl font-bold">{card.value.toLocaleString()}</p>
                                <p className="text-gray-400 text-sm mt-1">{card.label}</p>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}