import React from 'react';
import { Search } from 'lucide-react';

const Hero = () => {
    const categories = [
        'Product Managers', 'Career Coaches', 'Software Engineers',
        'Leadership Mentors', 'UX Designers', 'Data Scientists', 'Startup Founders'
    ];

    return (
        <section className="bg-[#021f1a] text-[#f8faf9] py-20 px-6 text-center overflow-hidden relative">
            {/* Subtle Noise/Texture background simulation */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/asfalt-dark.png")' }}></div>

            <div className="max-w-4xl mx-auto relative z-10">
                <h1 className="text-5xl md:text-7xl font-serif mb-6 leading-tight">
                    1-on-1 Mentorship in <br />
                    <span className="text-[#4ade80] italic">Real Time</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                    Learn a new skill, launch a project, land your dream career.
                </p>

                <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8">
                    <div className="relative w-full max-w-xl">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by company, skills or role"
                            className="w-full bg-[#052e28] border border-gray-800 rounded-lg py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#008ba3] transition-all"
                        />
                    </div>
                    <button className="bg-[#008ba3] hover:bg-[#00a8c2] text-white px-8 py-4 rounded-lg font-semibold transition-all shadow-lg active:scale-95 whitespace-nowrap">
                        Find mentors
                    </button>
                </div>

                <div className="flex flex-wrap justify-center gap-3">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            className="px-5 py-2 bg-[#1a3a35] hover:bg-[#25524b] text-sm text-gray-300 rounded-full transition-colors border border-transparent hover:border-gray-700"
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Hero;
