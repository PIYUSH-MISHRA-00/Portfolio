import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-dark-300 text-white">
            <h2 className="text-4xl font-bold mb-4">Not Found</h2>
            <p className="mb-6 text-gray-400">Could not find requested resource</p>
            <Link href="/" className="px-6 py-2 bg-neon-cyan/20 text-neon-cyan border border-neon-cyan rounded-full hover:bg-neon-cyan hover:text-dark-300 transition-all">
                Return Home
            </Link>
        </div>
    )
}
