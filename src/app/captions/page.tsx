'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

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
                <h2 className="text-2xl font-medium mb-1 mt-8">Captions</h2>
                <p className="text-gray-400 text-sm mb-8">Caption summary and highlights</p>

                {loading ? (
                    <p className="text-gray-400">Loading...</p>
                ) : (
                    <div className="flex flex-col gap-8">

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-pink-50 rounded-xl p-6 border border-gray-100">
                                <p className="text-3xl font-medium mb-1">{stats.totalCaptions.toLocaleString()}</p>
                                <p className="text-gray-500 text-sm">Total captions</p>
                            </div>
                            <div className="bg-purple-50 rounded-xl p-6 border border-gray-100">
                                <p className="text-3xl font-medium mb-1">{stats.featuredCaptions.toLocaleString()}</p>
                                <p className="text-gray-500 text-sm">Featured captions</p>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-base font-medium mb-4 text-gray-700">Top 5 captions by likes</h3>
                            <div className="flex flex-col gap-3">
                                {topCaptions.map((caption, index) => (
                                    <div key={index} className="border border-gray-200 rounded-xl p-4 flex items-center gap-4">
                                        <span className="text-2xl font-medium text-gray-200 w-8">#{index + 1}</span>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-700">"{caption.content}"</p>
                                        </div>
                                        <span className="text-sm font-medium text-pink-400 whitespace-nowrap">{caption.like_count} likes</span>
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