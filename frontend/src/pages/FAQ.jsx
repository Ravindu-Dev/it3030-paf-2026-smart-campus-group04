const faqs = [
    {
        question: "How do I book a facility or asset?",
        answer: "First, you need to sign in using your university Google account. Once signed in, navigate to 'Facilities & Assets' via the navigation bar. You can view availability and click 'Book Now' to secure your time slot."
    },
    {
        question: "Can I cancel my facility booking?",
        answer: "Yes, you can cancel your booking from the 'My Bookings' section in your dashboard. Please note that cancellations should be made at least 2 hours prior to your scheduled slot to avoid penalties."
    },
    {
        question: "How do I report a maintenance issue?",
        answer: "If you encounter a broken asset or facility issue, sign in to the portal, go to 'Maintenance Portal', and click 'Create Ticket'. Provide details and attach a picture if possible. A technician will be assigned to resolve it."
    },
    {
        question: "Who can access the Smart Campus Operations Hub?",
        answer: "The platform is available to all registered students, faculty, and administrative staff at the university. You only need your official university email domain to log in via Single Sign-On (SSO)."
    },
    {
        question: "How will I know if my ticket is resolved?",
        answer: "You will receive real-time status updates on your ticket dashboard. You can also view technician comments and resolution notes directly within the specific ticket details."
    },
    {
        question: "Is there a mobile app available?",
        answer: "The Smart Campus Operations Hub is a fully responsive Progressive Web App. You can access it from any mobile browser and even add it to your home screen for an app-like experience."
    }
];

export default function FAQ() {
    return (
        <div className="min-h-screen bg-slate-900 pb-32 relative overflow-hidden">
            {/* Background mesh */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[100px]" />
            </div>

            {/* Header / Hero */}
            <div className="pt-32 pb-20 text-center px-4 sm:px-6 lg:px-8 relative z-10 border-b border-slate-800/50 mb-12">
                <h1 className="text-5xl sm:text-6xl font-extrabold text-white tracking-tight mb-6 drop-shadow-lg">
                    Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Questions</span>
                </h1>
                <p className="text-xl text-slate-300 max-w-2xl mx-auto drop-shadow-md">
                    Find quick answers to common questions about using the Smart Campus Operations platform.
                </p>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <details
                            key={index}
                            className="group bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden transition-all duration-300 hover:border-blue-500/30 hover:shadow-[0_10px_30px_-15px_rgba(59,130,246,0.2)]"
                        >
                            <summary className="flex items-center justify-between p-6 cursor-pointer font-medium text-white hover:bg-slate-800/80 transition-colors">
                                <span className="text-lg">{faq.question}</span>
                                <span className="transition duration-300 group-open:-rotate-180 bg-slate-700/50 p-2 rounded-full group-hover:bg-blue-500/20 group-hover:text-blue-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                </span>
                            </summary>
                            <div className="p-6 pt-0 text-slate-300 leading-relaxed border-t border-slate-700/50 mt-1 pb-6 bg-slate-800/20">
                                <span className="block pt-5">{faq.answer}</span>
                            </div>
                        </details>
                    ))}
                </div>

                {/* Bottom CTA Card */}
                <div className="mt-16 text-center p-12 bg-gradient-to-br from-blue-900/30 to-slate-900 border border-blue-500/30 rounded-3xl backdrop-blur-xl shadow-2xl">
                    <h3 className="text-3xl font-bold text-white mb-4">Still have questions?</h3>
                    <p className="text-slate-300 mb-8 text-lg max-w-xl mx-auto">If you cannot find the answer to your question in our FAQ, you can always contact our support team directly.</p>
                    <a href="/contact" className="inline-flex px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 border border-blue-500/50 text-white rounded-xl font-bold transition-all duration-300 shadow-xl shadow-blue-600/20 hover:shadow-blue-500/40 hover:-translate-y-1">
                        Contact Support
                    </a>
                </div>
            </div>
        </div>
    );
}
