'use client'

import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Dashboard() {
    const cards = [
        { title: 'Overview', description: 'General stats and platform metrics', href: '/overview', emoji: '📊', bg: 'bg-purple-100' },
        { title: 'Images', description: 'Create, view, edit and delete images', href: '/images', emoji: '🖼️', bg: 'bg-teal-100' },
        { title: 'Captions', description: 'Browse and analyze captions', href: '/captions', emoji: '💬', bg: 'bg-pink-100' },
        { title: 'Profiles', description: 'View all user profiles', href: '/profiles', emoji: '👥', bg: 'bg-orange-100' },
    ]

    return (
        <div className="min-h-screen bg-white text-gray-900">
            <nav className="border-b border-gray-200 px-8 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3">
                    <img src="/logo.png" alt="Humor Admin" className="h-12 w-auto" />
                    <span className="text-lg font-medium text-gray-900">Humor Admin Panel</span>
                </Link>
                <button
                    onClick={async () => { await supabase.auth.signOut(); window.location.href = '/login' }}
                    className="text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition"
                >
                    Sign out
                </button>
            </nav>

            <main className="p-8 max-w-3xl mx-auto">
                <h2 className="text-2xl font-medium mb-1 mt-8">Admin Panel</h2>
                <p className="text-gray-400 text-sm mb-8">Select a section to get started</p>

                <div className="grid grid-cols-2 gap-12">
                    {cards.map((card) => (
                        <Link key={card.title} href={card.href}>
                            <div className="border border-gray-200 rounded-xl overflow-hidden hover:border-gray-400 transition cursor-pointer">
                                <div className={`${card.bg} h-28 flex items-center justify-center text-4xl`}>
                                    {card.emoji}
                                </div>
                                <div className="p-4">
                                    <h3 className="font-medium text-base mb-1">{card.title}</h3>
                                    <p className="text-gray-400 text-sm">{card.description}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    )
}