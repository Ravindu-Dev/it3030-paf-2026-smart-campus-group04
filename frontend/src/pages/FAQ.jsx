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
        <div className="min-h-screen bg-slate-900 pb-24">
            {/* Header */}
            <div className="pt-24 pb-16 text-center px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
                    Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Questions</span>
                </h1>
                <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                    Find quick answers to common questions about using the Smart Campus Operations platform.
                </p>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <details
                            key={index}
                            className="group bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden"
                        >
                            <summary className="flex items-center justify-between p-6 cursor-pointer font-medium text-white hover:bg-slate-800/60 transition-colors">
                                <span className="text-lg">{faq.question}</span>
                                <span className="transition duration-300 group-open:-rotate-180">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><path d="m6 9 6 6 6-6" /></svg>
                                </span>
                            </summary>
                            <div className="p-6 pt-0 text-slate-400 leading-relaxed border-t border-slate-700/50 mt-1 pb-6">
                                <span className="block pt-5">{faq.answer}</span>
                            </div>
                        </details>
                    ))}
                </div>

                <div className="mt-16 text-center p-8 bg-blue-900/10 border border-blue-500/20 rounded-3xl">
                    <h3 className="text-xl font-semibold text-white mb-2">Still have questions?</h3>
                    <p className="text-slate-400 mb-6">If you cannot find answer to your question in our FAQ, you can always contact us.</p>
                    <a href="/contact" className="inline-flex px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-500/20">
                        Contact Support
                    </a>
                </div>
            </div>
        </div>
    );
}
