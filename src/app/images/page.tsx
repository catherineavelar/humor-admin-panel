'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const JEWEL = {
    emerald:  { bg: '#064e3b', text: '#ecfdf5', accent: '#10b981' },
    sapphire: { bg: '#1e3a5f', text: '#eff6ff', accent: '#3b82f6' },
    ruby:     { bg: '#7f1d1d', text: '#fff1f2', accent: '#ef4444' },
}

export default function ImagesPage() {
    const [images, setImages] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editValues, setEditValues] = useState({ url: '', additional_context: '', is_public: true })
    const [showCreate, setShowCreate] = useState(false)
    const [showImages, setShowImages] = useState(false)
    const [newImage, setNewImage] = useState({ url: '', additional_context: '', is_public: true })
    const [stats, setStats] = useState({ total: 0, public: 0, private: 0 })
    const [mostCaptioned, setMostCaptioned] = useState<any[]>([])
    const [mostVoted, setMostVoted] = useState<any[]>([])

    useEffect(() => {
        fetchImages()
        fetchStats()
    }, [])

    async function fetchImages() {
        const { data } = await supabase
            .from('images')
            .select('id, url, is_public, additional_context, created_datetime_utc')
            .order('created_datetime_utc', { ascending: false })
            .limit(10)
        setImages(data || [])
        setLoading(false)
    }

    async function fetchStats() {
        const [
            { count: total },
            { count: publicCount },
            { count: privateCount },
        ] = await Promise.all([
            supabase.from('images').select('*', { count: 'exact', head: true }),
            supabase.from('images').select('*', { count: 'exact', head: true }).eq('is_public', true),
            supabase.from('images').select('*', { count: 'exact', head: true }).eq('is_public', false),
        ])
        setStats({ total: total || 0, public: publicCount || 0, private: privateCount || 0 })

        setMostCaptioned([
            { url: 'https://images.almostcrackd.ai/2877cb7c-4ef9-4fcc-921c-8ca87d6ed47f/4f431d13-ad38-46a8-90bf-5091b80df439.jpeg', count: 1455 },
            { url: 'https://images.almostcrackd.ai/2877cb7c-4ef9-4fcc-921c-8ca87d6ed47f/c959b09a-2388-445d-86ef-aa6f8908e642.jpeg', count: 1441 },
            { url: 'https://images.almostcrackd.ai/2877cb7c-4ef9-4fcc-921c-8ca87d6ed47f/023f7611-15eb-4bbd-8855-f0eb1020800c.png', count: 618 },
            { url: 'https://images.almostcrackd.ai/2877cb7c-4ef9-4fcc-921c-8ca87d6ed47f/67db49ad-5e32-436f-869c-cef5e436b06f.jpeg', count: 617 },
            { url: 'https://images.almostcrackd.ai/2877cb7c-4ef9-4fcc-921c-8ca87d6ed47f/6c4b3371-e5c5-4a24-a0dc-8ca8719edf5c.jpeg', count: 616 },
        ])

        setMostVoted([
            { url: 'https://images.almostcrackd.ai/5863fa06-60c2-4297-8b1d-87f9ef525389/f8c1c614-31cf-44e0-8dc5-7bdb9ae66179.jpeg', count: 911 },
            { url: 'https://images.almostcrackd.ai/ce57a05d-8c60-4215-8846-d4bdfd2353e3/09378640-98b3-416c-9c61-c1ba71e3bd11.jpeg', count: 692 },
            { url: 'https://images.almostcrackd.ai/3caa0904-5aa6-4e7a-ad80-6d9bc0a6be0b/50189558-2437-48c3-acc5-f9e4a7950b12.png', count: 612 },
            { url: 'https://images.almostcrackd.ai/3caa0904-5aa6-4e7a-ad80-6d9bc0a6be0b/faf811a5-ee67-47e8-80bc-a1e45255f613.jpeg', count: 609 },
            { url: 'https://images.almostcrackd.ai/98df57b4-8664-44f5-aee4-bdf668a57748/91a595c4-927e-4666-9a9f-b3148091a44f.jpeg', count: 536 },
        ])
    }

    async function createImage() {
        const { data } = await supabase
            .from('images')
            .insert([{ url: newImage.url, additional_context: newImage.additional_context, is_public: newImage.is_public }])
            .select()
        if (data) {
            setImages([data[0], ...images])
            setShowCreate(false)
            setNewImage({ url: '', additional_context: '', is_public: true })
        }
    }

    async function updateImage(id: string) {
        await supabase
            .from('images')
            .update({ url: editValues.url, additional_context: editValues.additional_context, is_public: editValues.is_public })
            .eq('id', id)
        setImages(images.map((img) => img.id === id ? { ...img, ...editValues } : img))
        setEditingId(null)
    }

    async function deleteImage(id: string) {
        if (!confirm('Are you sure you want to delete this image?')) return
        await supabase.from('images').delete().eq('id', id)
        setImages(images.filter((img) => img.id !== id))
    }

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
                <div className="flex items-start justify-between mb-12">
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-1">Images</h1>
                        <p className="text-gray-400 text-sm">Manage and explore image statistics</p>
                    </div>
                </div>

                {/* Jewel stat cards */}
                <div className="grid grid-cols-3 gap-3 mb-12">
                    {[
                        { label: 'Total Images', value: stats.total.toLocaleString(),   jewel: JEWEL.emerald },
                        { label: 'Public',        value: stats.public.toLocaleString(),  jewel: JEWEL.sapphire },
                        { label: 'Private',       value: stats.private.toLocaleString(), jewel: JEWEL.ruby },
                    ].map((card) => (
                        <div
                            key={card.label}
                            className="rounded-2xl p-6 flex flex-col justify-between"
                            style={{ backgroundColor: card.jewel.bg, minHeight: 110 }}
                        >
                            <p className="text-3xl font-semibold tracking-tight" style={{ color: card.jewel.text }}>
                                {card.value}
                            </p>
                            <p className="text-xs font-semibold uppercase tracking-widest mt-2" style={{ color: card.jewel.accent }}>
                                {card.label}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Top 5 rankings */}
                <div className="grid grid-cols-2 gap-8 mb-12">
                    {[
                        { title: 'Top 5 most captioned', items: mostCaptioned, label: 'captions' },
                        { title: 'Top 5 most voted',     items: mostVoted,     label: 'votes' },
                    ].map((section) => (
                        <div key={section.title}>
                            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
                                {section.title}
                            </h3>
                            <div className="flex flex-col gap-2">
                                {section.items.map((img, index) => (
                                    <div
                                        key={index}
                                        className="border border-gray-200 rounded-xl p-3 flex items-center gap-4 hover:border-gray-400 transition"
                                    >
                                        <span className="text-sm font-bold text-gray-900 w-6 shrink-0">
                                            {index + 1}
                                        </span>
                                        <img
                                            src={img.url}
                                            alt={`rank ${index + 1}`}
                                            className="w-20 h-14 object-cover rounded-lg shrink-0"
                                        />
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {img.count.toLocaleString()}
                                            </p>
                                            <p className="text-xs text-gray-400">{section.label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Add Image section */}
                <div className="rounded-2xl border border-gray-200 overflow-hidden mb-8">
                    <div className="flex items-center justify-between px-6 py-5 bg-gray-50">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900">Add a new image</h3>
                            <p className="text-xs text-gray-400 mt-0.5">Provide a URL to add an image to the database</p>
                        </div>
                        <button
                            onClick={() => setShowCreate(!showCreate)}
                            className="text-xs font-semibold text-gray-900 bg-white border border-gray-200 hover:bg-gray-100 transition-all duration-200 rounded-full px-4 py-2"
                        >
                            {showCreate ? 'Cancel' : '+ Add Image'}
                        </button>
                    </div>
                    {showCreate && (
                        <div className="px-6 py-5 border-t border-gray-200">
                            <div className="flex flex-col gap-3">
                                <input
                                    type="text"
                                    placeholder="Image URL"
                                    value={newImage.url}
                                    onChange={(e) => setNewImage({ ...newImage, url: e.target.value })}
                                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-gray-400"
                                />
                                <input
                                    type="text"
                                    placeholder="Additional context (optional)"
                                    value={newImage.additional_context}
                                    onChange={(e) => setNewImage({ ...newImage, additional_context: e.target.value })}
                                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-gray-400"
                                />
                                <label className="flex items-center gap-2 text-sm text-gray-600">
                                    <input
                                        type="checkbox"
                                        checked={newImage.is_public}
                                        onChange={(e) => setNewImage({ ...newImage, is_public: e.target.checked })}
                                    />
                                    Public
                                </label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={createImage}
                                        className="text-sm font-medium text-white bg-gray-900 hover:bg-gray-700 rounded-full px-4 py-2 transition"
                                    >
                                        Create
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Recent images */}
                <div className="rounded-2xl border-2 border-gray-900 overflow-hidden">
                    <div
                        className="flex items-center justify-between px-6 py-5"
                        style={{ backgroundColor: '#111827' }}
                    >
                        <div>
                            <h3 className="text-sm font-semibold text-white">Recent images</h3>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Showing the 10 most recent images. Edit or delete below.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowImages(!showImages)}
                            className="text-xs font-semibold text-gray-900 bg-white hover:bg-gray-100 transition-all duration-200 rounded-full px-4 py-2"
                        >
                            {showImages ? 'Hide images' : 'Show images'}
                        </button>
                    </div>

                    {showImages && (
                        loading ? (
                            <p className="text-gray-400 text-sm px-6 py-5">Loading...</p>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {images.map((img) => (
                                    <div key={img.id} className="px-6 py-4">
                                        {editingId === img.id ? (
                                            <div className="flex flex-col gap-3">
                                                <input
                                                    type="text"
                                                    value={editValues.url}
                                                    onChange={(e) => setEditValues({ ...editValues, url: e.target.value })}
                                                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-gray-400"
                                                    placeholder="Image URL"
                                                />
                                                <input
                                                    type="text"
                                                    value={editValues.additional_context}
                                                    onChange={(e) => setEditValues({ ...editValues, additional_context: e.target.value })}
                                                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-gray-400"
                                                    placeholder="Additional context"
                                                />
                                                <label className="flex items-center gap-2 text-sm text-gray-600">
                                                    <input
                                                        type="checkbox"
                                                        checked={editValues.is_public}
                                                        onChange={(e) => setEditValues({ ...editValues, is_public: e.target.checked })}
                                                    />
                                                    Public
                                                </label>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => updateImage(img.id)}
                                                        className="text-sm font-medium text-white bg-gray-900 hover:bg-gray-700 rounded-full px-4 py-2 transition"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingId(null)}
                                                        className="text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-2 transition"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    {img.url && (
                                                        <img
                                                            src={img.url}
                                                            alt="image"
                                                            className="w-20 h-14 object-cover rounded-lg shrink-0"
                                                        />
                                                    )}
                                                    <div>
                                                        <p className="text-xs text-gray-400">
                                                            {new Date(img.created_datetime_utc).toLocaleDateString()} ·{' '}
                                                            <span className={img.is_public ? 'text-emerald-600' : 'text-gray-400'}>
                                                                {img.is_public ? 'Public' : 'Private'}
                                                            </span>
                                                        </p>
                                                        {img.additional_context && (
                                                            <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                                                                {img.additional_context}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditingId(img.id)
                                                            setEditValues({ url: img.url || '', additional_context: img.additional_context || '', is_public: img.is_public })
                                                        }}
                                                        className="text-xs font-medium text-gray-600 border border-gray-200 rounded-full px-3 py-1.5 hover:bg-gray-100 transition"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => deleteImage(img.id)}
                                                        className="text-xs font-medium text-red-500 border border-red-200 rounded-full px-3 py-1.5 hover:bg-red-50 transition"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>
            </main>
        </div>
    )
}