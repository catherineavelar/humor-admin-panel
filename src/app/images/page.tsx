'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function ImagesPage() {
    const [images, setImages] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editValues, setEditValues] = useState({ url: '', additional_context: '', is_public: true })
    const [showCreate, setShowCreate] = useState(false)
    const [newImage, setNewImage] = useState({ url: '', additional_context: '', is_public: true })

    useEffect(() => {
        fetchImages()
    }, [])

    async function fetchImages() {
        const { data } = await supabase
            .from('images')
            .select('id, url, is_public, additional_context, created_datetime_utc')
            .order('created_datetime_utc', { ascending: false })
            .limit(50)
        setImages(data || [])
        setLoading(false)
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
                <div className="flex items-center justify-between mt-8 mb-1">
                    <h2 className="text-2xl font-medium">Images</h2>
                    <button
                        onClick={() => setShowCreate(!showCreate)}
                        className="text-sm bg-gray-900 text-white rounded-lg px-4 py-2 hover:bg-gray-700 transition"
                    >
                        + Add Image
                    </button>
                </div>
                <p className="text-gray-400 text-sm mb-8">Create, view, edit and delete images</p>

                {/* Create form */}
                {showCreate && (
                    <div className="border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
                        <h3 className="font-medium mb-4">New Image</h3>
                        <div className="flex flex-col gap-3">
                            <input
                                type="text"
                                placeholder="Image URL"
                                value={newImage.url}
                                onChange={(e) => setNewImage({ ...newImage, url: e.target.value })}
                                className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full"
                            />
                            <input
                                type="text"
                                placeholder="Additional context (optional)"
                                value={newImage.additional_context}
                                onChange={(e) => setNewImage({ ...newImage, additional_context: e.target.value })}
                                className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full"
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
                                <button onClick={createImage} className="text-sm bg-gray-900 text-white rounded-lg px-4 py-2 hover:bg-gray-700 transition">
                                    Create
                                </button>
                                <button onClick={() => setShowCreate(false)} className="text-sm border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 transition">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {loading ? (
                    <p className="text-gray-400">Loading...</p>
                ) : (
                    <div className="flex flex-col gap-3">
                        {images.map((img) => (
                            <div key={img.id} className="border border-gray-200 rounded-xl p-4">
                                {editingId === img.id ? (
                                    <div className="flex flex-col gap-3">
                                        <input
                                            type="text"
                                            value={editValues.url}
                                            onChange={(e) => setEditValues({ ...editValues, url: e.target.value })}
                                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full"
                                            placeholder="Image URL"
                                        />
                                        <input
                                            type="text"
                                            value={editValues.additional_context}
                                            onChange={(e) => setEditValues({ ...editValues, additional_context: e.target.value })}
                                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full"
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
                                            <button onClick={() => updateImage(img.id)} className="text-sm bg-gray-900 text-white rounded-lg px-4 py-2 hover:bg-gray-700 transition">
                                                Save
                                            </button>
                                            <button onClick={() => setEditingId(null)} className="text-sm border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 transition">
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 truncate w-72">{img.url || 'No URL'}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {new Date(img.created_datetime_utc).toLocaleDateString()} · {img.is_public ? 'Public' : 'Private'}
                                            </p>
                                            {img.additional_context && (
                                                <p className="text-xs text-gray-500 mt-1 truncate w-72">{img.additional_context}</p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => { setEditingId(img.id); setEditValues({ url: img.url || '', additional_context: img.additional_context || '', is_public: img.is_public }) }}
                                                className="text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => deleteImage(img.id)}
                                                className="text-xs text-red-400 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 transition"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}