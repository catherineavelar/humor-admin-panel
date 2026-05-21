'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const PAGE_SIZE = 10

type Filter = 'All' | 'Columbia' | 'Barnard' | 'Superadmins'
const FILTERS: Filter[] = ['All', 'Columbia', 'Barnard', 'Superadmins']

function buildQuery(filter: Filter, from: number, to: number) {
    let q = supabase
        .from('profiles')
        .select('email, first_name, last_name, is_superadmin, created_datetime_utc')
        .not('email', 'is', null)
        .neq('email', '')
        .order('created_datetime_utc', { ascending: false })
        .range(from, to)

    if (filter === 'Columbia')    q = q.ilike('email', '%@columbia.edu')
    if (filter === 'Barnard')     q = q.ilike('email', '%@barnard.edu')
    if (filter === 'Superadmins') q = q.eq('is_superadmin', true)

    return q
}

export default function ProfilesPage() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        columbiaStudents: 0,
        barnardStudents: 0,
        superadmins: 0,
        other: 0,
        newestMember: null as any,
        oldestMember: null as any,
    })

    const [activeFilter, setActiveFilter] = useState<Filter>('All')
    const [rows, setRows] = useState<any[]>([])
    const [page, setPage] = useState(0)
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [search, setSearch] = useState('')

    useEffect(() => { fetchStats() }, [])
    useEffect(() => { loadTab(activeFilter, 0) }, [activeFilter])

    async function fetchStats() {
        const [
            { count: total },
            { count: columbia },
            { count: barnard },
            { count: superadmins },
            { data: newest },
            { data: oldest },
        ] = await Promise.all([
            supabase.from('profiles').select('*', { count: 'exact', head: true }).not('email', 'is', null).neq('email', ''),
            supabase.from('profiles').select('*', { count: 'exact', head: true }).ilike('email', '%@columbia.edu'),
            supabase.from('profiles').select('*', { count: 'exact', head: true }).ilike('email', '%@barnard.edu'),
            supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_superadmin', true),
            supabase.from('profiles').select('email, created_datetime_utc').not('email', 'is', null).order('created_datetime_utc', { ascending: false }).limit(1),
            supabase.from('profiles').select('email, created_datetime_utc').not('email', 'is', null).order('created_datetime_utc', { ascending: true }).limit(1),
        ])

        const t = total || 0
        const c = columbia || 0
        const b = barnard || 0
        const s = superadmins || 0

        setStats({
            totalUsers: t,
            columbiaStudents: c,
            barnardStudents: b,
            superadmins: s,
            other: Math.max(0, t - c - b - s),
            newestMember: newest?.[0] || null,
            oldestMember: oldest?.[0] || null,
        })
    }

    async function loadTab(filter: Filter, pageNum: number) {
        if (pageNum === 0) { setLoading(true); setRows([]) }
        else setLoadingMore(true)

        const { data } = await buildQuery(filter, pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1)
        const fresh = data || []

        setRows((prev) => pageNum === 0 ? fresh : [...prev, ...fresh])
        setHasMore(fresh.length === PAGE_SIZE)
        setPage(pageNum)
        setLoading(false)
        setLoadingMore(false)
    }

    function handleFilter(f: Filter) {
        setActiveFilter(f)
        setSearch('')
    }

    const displayed = search.trim()
        ? rows.filter((p) =>
            p.email?.toLowerCase().includes(search.toLowerCase()) ||
            `${p.first_name || ''} ${p.last_name || ''}`.toLowerCase().includes(search.toLowerCase())
        )
        : rows

    const pct = (val: number) =>
        stats.totalUsers > 0 ? Math.round((val / stats.totalUsers) * 100) : 0

    const segmentData = [
        { key: 'columbia',    label: 'Columbia',    color: '#064e3b', value: stats.columbiaStudents, filter: 'Columbia' as Filter },
        { key: 'barnard',     label: 'Barnard',     color: '#1e3a5f', value: stats.barnardStudents,  filter: 'Barnard' as Filter },
        { key: 'superadmin',  label: 'Superadmins', color: '#78350f', value: stats.superadmins,      filter: 'Superadmins' as Filter },
        { key: 'other',       label: 'Other',       color: '#374151', value: stats.other,            filter: 'All' as Filter },
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
                <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-1">Profiles</h1>
                <p className="text-gray-400 text-sm mb-12">User summary and highlights</p>

                {/* Breakdown bar */}
                <div className="mb-12">
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">User breakdown</h3>
                    <p className="mb-3">
                        <span className="text-3xl font-semibold tracking-tight text-gray-900">
                            {stats.totalUsers.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-400 ml-2">total users</span>
                    </p>
                    <div className="flex w-full h-9 rounded-xl overflow-hidden gap-0.5 mb-5">
                        {segmentData.map((seg) => (
                            <div
                                key={seg.key}
                                className="h-full transition-opacity hover:opacity-80 cursor-pointer"
                                style={{
                                    backgroundColor: seg.color,
                                    width: `${pct(seg.value)}%`,
                                    minWidth: seg.value > 0 ? '4px' : '0',
                                }}
                                title={`${seg.label}: ${seg.value.toLocaleString()}`}
                                onClick={() => handleFilter(seg.filter)}
                            />
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-6">
                        {segmentData.map((seg) => (
                            <div key={seg.key} className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: seg.color }} />
                                <span className="text-xs text-gray-500">{seg.label}</span>
                                <span className="text-xs font-semibold text-gray-900">{seg.value.toLocaleString()}</span>
                                <span className="text-xs text-gray-400">{pct(seg.value)}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Member milestones */}
                {(stats.newestMember || stats.oldestMember) && (
                    <div className="mb-12">
                        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Member milestones</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {stats.newestMember && (
                                <div className="border border-gray-200 rounded-2xl p-5 hover:border-gray-400 transition">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Newest member</p>
                                    <p className="text-sm font-medium text-gray-900 truncate">{stats.newestMember.email}</p>
                                    <p className="text-xs text-gray-400 mt-1">Joined {new Date(stats.newestMember.created_datetime_utc).toLocaleDateString()}</p>
                                </div>
                            )}
                            {stats.oldestMember && (
                                <div className="border border-gray-200 rounded-2xl p-5 hover:border-gray-400 transition">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Oldest member</p>
                                    <p className="text-sm font-medium text-gray-900 truncate">{stats.oldestMember.email}</p>
                                    <p className="text-xs text-gray-400 mt-1">Joined {new Date(stats.oldestMember.created_datetime_utc).toLocaleDateString()}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Table */}
                <div>
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">All users</h3>

                    <div className="flex flex-col gap-3 mb-4">
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="border border-gray-200 rounded-full px-4 py-2 text-sm w-full focus:outline-none focus:border-gray-400"
                        />
                        <div className="flex gap-2 flex-wrap items-center">
                            {FILTERS.map((f) => (
                                <button
                                    key={f}
                                    onClick={() => handleFilter(f)}
                                    className={`text-xs font-medium px-4 py-1.5 rounded-full transition-all duration-150 ${
                                        activeFilter === f
                                            ? 'bg-gray-900 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {f}
                                </button>
                            ))}
                            <span className="text-xs text-gray-400 ml-auto">
                                {displayed.length} result{displayed.length !== 1 ? 's' : ''} loaded
                            </span>
                        </div>
                    </div>

                    {loading ? (
                        <p className="text-sm text-gray-400">Loading...</p>
                    ) : displayed.length === 0 ? (
                        <p className="text-sm text-gray-400">No profiles found.</p>
                    ) : (
                        <>
                            <div className="border border-gray-200 rounded-2xl overflow-hidden">
                                <div className="grid grid-cols-12 px-5 py-3 border-b border-gray-200 bg-gray-50">
                                    <span className="col-span-5 text-xs font-semibold uppercase tracking-widest text-gray-400">Email</span>
                                    <span className="col-span-4 text-xs font-semibold uppercase tracking-widest text-gray-400">Name</span>
                                    <span className="col-span-3 text-xs font-semibold uppercase tracking-widest text-gray-400">Joined</span>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {displayed.map((profile, i) => (
                                        <div
                                            key={profile.email + i}
                                            className="grid grid-cols-12 px-5 py-3.5 hover:bg-gray-50 transition items-center"
                                        >
                                            <span className="col-span-5 text-xs text-gray-700 truncate pr-3">{profile.email}</span>
                                            <span className="col-span-4 text-xs text-gray-500 truncate">
                                                {profile.first_name || profile.last_name
                                                    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
                                                    : profile.email?.split('@')[0] || '—'}
                                            </span>
                                            <span className="col-span-3 text-xs text-gray-400">
                                                {new Date(profile.created_datetime_utc).toLocaleDateString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {hasMore && !search && (
                                <div className="mt-4 flex justify-center">
                                    <button
                                        onClick={() => loadTab(activeFilter, page + 1)}
                                        disabled={loadingMore}
                                        className="text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-900 hover:text-white transition-all duration-200 rounded-full px-6 py-2 disabled:opacity-50"
                                    >
                                        {loadingMore ? 'Loading...' : 'Load more'}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    )
}