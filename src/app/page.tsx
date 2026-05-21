'use client'

import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Poppins } from 'next/font/google'

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '600'] })

export default function Dashboard() {
    const cards = [
        {
            title: 'Overview',
            description: 'General stats and platform metrics',
            href: '/overview',
            coverBg: '#1a1a2e',
            labelColor: '#e8c84a',
            image: null,
        },
        {
            title: 'Images',
            description: 'Create, view, edit and delete images',
            href: '/images',
            coverBg: '#2d1b4e',
            labelColor: '#c084fc',
            image: null,
        },
        {
            title: 'Captions',
            description: 'Browse and analyze captions',
            href: '/captions',
            coverBg: '#1b3a2d',
            labelColor: '#4ade80',
            image: null,
        },
        {
            title: 'Profiles',
            description: 'View all user profiles',
            href: '/profiles',
            coverBg: '#3a1a1a',
            labelColor: '#fb923c',
            image: null,
        },
    ]

    return (
        <div className="min-h-screen bg-white text-gray-900">
            <nav className="border-b border-gray-200 px-10 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3">
                    <img src="/logo2.png" alt="Humor Admin" className="h-12 w-auto" />
                    <span className="text-lg font-medium text-gray-900">Humor Admin Panel</span>
                </Link>
                <button
                    onClick={async () => { await supabase.auth.signOut(); window.location.href = '/login' }}
                    className="text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-900 hover:text-white transition-all duration-200 rounded-full px-5 py-2"
                >
                    Sign out
                </button>
            </nav>

            <main className="px-10 py-16 max-w-4xl mx-auto">
                <h1 className={`${poppins.className} text-3xl font-semibold tracking-tight text-gray-900 mb-10`}>
                    What would you like to manage?
                </h1>

                <div className="grid grid-cols-2 gap-2">
                    {cards.map((card) => (
                        <Link key={card.title} href={card.href}>
                            <div className="bg-gray-100 rounded-2xl flex flex-col items-center py-14 px-6 gap-6 hover:bg-gray-200 transition cursor-pointer group">

                                {/* Vinyl stage */}
                                <div className="relative" style={{ width: 240, height: 200 }}>

                                    {/* Record — slides out to the right on hover */}
                                    <div
                                        className="absolute rounded-full flex items-center justify-center z-10 transition-all duration-500 ease-in-out group-hover:translate-x-10"
                                        style={{
                                            width: 175,
                                            height: 175,
                                            top: '50%',
                                            right: 0,
                                            transform: 'translateY(-50%)',
                                            background: 'radial-gradient(circle, #2a2a2a 0%, #111 35%, #1c1c1c 50%, #111 65%, #181818 80%, #0d0d0d 100%)',
                                            boxShadow: 'inset 0 0 0 8px rgba(255,255,255,0.025), inset 0 0 0 20px rgba(255,255,255,0.015), inset 0 0 0 34px rgba(255,255,255,0.025), inset 0 0 0 48px rgba(255,255,255,0.015)',
                                        }}
                                    >
                                        <div
                                            className="rounded-full flex items-center justify-center"
                                            style={{ width: 52, height: 52, backgroundColor: card.labelColor }}
                                        >
                                            <div className="rounded-full" style={{ width: 10, height: 10, background: '#ffffff' }} />
                                        </div>
                                    </div>

                                    {/* Album cover */}
                                    <div
                                        className="absolute top-0 left-0 rounded-lg overflow-hidden z-20"
                                        style={{ width: 200, height: 200, backgroundColor: card.coverBg }}
                                    >
                                        {card.image ? (
                                            <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <span className="text-white/20 text-xs uppercase tracking-widest">{card.title}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Label below */}
                                <div className="text-center">
                                    <p className="text-xs font-medium uppercase tracking-widest text-gray-900 mb-1">{card.title}</p>
                                    <p className="text-xs text-gray-400">{card.description}</p>
                                </div>

                            </div>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    )
}