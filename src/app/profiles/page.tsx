'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function ProfilesPage() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        columbiaStudents: 0,
        superadmins: 0,
        newestMember: null as any,
        oldestMember: null as any,
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchProfiles() {
            const [
                { count: total },
                { count: columbia },
                { count: barnard },
                { count: superadmins },
                { data: newest },
                { data: oldest },
            ] = await Promise.all([
                supabase.from('profiles').select('*', { count: 'exact', head: true }),
                supabase.from('profiles').select('*', { count: 'exact', head: true }).ilike('email', '%@columbia.edu'),
                supabase.from('profiles').select('*', { count: 'exact', head: true }).ilike('email', '%@barnard.edu'),
                supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_superadmin', true),
                supabase.from('profiles').select('email, created_datetime_utc').order('created_datetime_utc', { ascending: false }).limit(1),
                supabase.from('profiles').select('email, created_datetime_utc').order('created_datetime_utc', { ascending: true }).limit(1),
            ])

            setStats({
                totalUsers: total || 0,
                columbiaStudents: (columbia || 0) + (barnard || 0),
                superadmins: superadmins || 0,
                newestMember: newest?.[0] || null,
                oldestMember: oldest?.[0] || null,
            })
            setLoading(false)
        }
        fetchProfiles()
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
                <h2 className="text-2xl font-medium mb-1 mt-8">Profiles</h2>
                <p className="text-gray-400 text-sm mb-8">User summary and highlights</p>

                {loading ? (
                    <p className="text-gray-400">Loading...</p>
                ) : (
                    <div className="flex flex-col gap-6">

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-purple-50 rounded-xl p-6 border border-gray-100">
                                <p className="text-3xl font-medium mb-1">{stats.totalUsers.toLocaleString()}</p>
                                <p className="text-gray-500 text-sm">Total users</p>
                            </div>
                            <div className="bg-teal-50 rounded-xl p-6 border border-gray-100">
                                <p className="text-3xl font-medium mb-1">{stats.columbiaStudents.toLocaleString()}</p>
                                <p className="text-gray-500 text-sm">Columbia & Barnard students</p>
                            </div>
                            <div className="bg-pink-50 rounded-xl p-6 border border-gray-100">
                                <p className="text-3xl font-medium mb-1">{stats.superadmins}</p>
                                <p className="text-gray-500 text-sm">Superadmins</p>
                            </div>
                            <div className="bg-orange-50 rounded-xl p-6 border border-gray-100">
                                <p className="text-3xl font-medium mb-1">
                                    {stats.totalUsers > 0 ? Math.round((stats.columbiaStudents / stats.totalUsers) * 100) : 0}%
                                </p>
                                <p className="text-gray-500 text-sm">Student ratio</p>
                            </div>
                        </div>

                        {stats.newestMember && (
                            <div>
                                <h3 className="text-base font-medium mb-3 text-gray-700">Newest member</h3>
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                    <p className="text-sm font-medium text-gray-700">{stats.newestMember.email}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        Joined {new Date(stats.newestMember.created_datetime_utc).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        )}

                        {stats.oldestMember && (
                            <div>
                                <h3 className="text-base font-medium mb-3 text-gray-700">Oldest member</h3>
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                    <p className="text-sm font-medium text-gray-700">{stats.oldestMember.email}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        Joined {new Date(stats.oldestMember.created_datetime_utc).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        )}

                    </div>
                )}
            </main>
        </div>
    )
}