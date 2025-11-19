import { motion } from 'framer-motion';
import { Mail, MessageSquare, Bug, HelpCircle } from 'lucide-react';

export default function Contact() {
  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-[#FFB800]/20 to-[#FF9A1F]/20 border border-[#FFB800]/40">
            <Mail className="w-8 h-8 text-[#FFB800]" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-[#FFB800] via-[#FFC933] to-[#FF9A1F] bg-clip-text text-transparent">
            Contact Us
          </h1>
          <p className="text-gray-400 text-lg">We're here to help and answer any questions you may have</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="space-y-8"
        >
          <section className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-8 sm:p-10 backdrop-blur-sm text-center">
            <Mail className="w-12 h-12 text-[#FFB800] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-3">Get in Touch</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              Have a question, found a bug, or need assistance? We'd love to hear from you!
            </p>
            <a
              href="mailto:support@convertflowly.com"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#FFB800] to-[#FF9A1F] text-black rounded-2xl font-semibold transition-all hover:shadow-lg hover:shadow-[#FFB800]/40 hover:-translate-y-0.5"
            >
              <Mail className="w-5 h-5" />
              support@convertflowly.com
            </a>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm text-center hover:bg-white/10 transition-all"
            >
              <Bug className="w-10 h-10 text-[#FFB800] mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Report a Bug</h3>
              <p className="text-gray-400 text-sm">
                Found an issue? Let us know so we can fix it quickly and improve your experience.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm text-center hover:bg-white/10 transition-all"
            >
              <MessageSquare className="w-10 h-10 text-[#FFB800] mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Feedback</h3>
              <p className="text-gray-400 text-sm">
                Share your thoughts and suggestions to help us make ConvertFlowly even better.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm text-center hover:bg-white/10 transition-all"
            >
              <HelpCircle className="w-10 h-10 text-[#FFB800] mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Support</h3>
              <p className="text-gray-400 text-sm">
                Need help with a tool or feature? We're happy to assist you with any questions.
              </p>
            </motion.div>
          </div>

          <section className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-4">What to Include in Your Message</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              To help us assist you more effectively, please include the following when contacting us:
            </p>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-[#FFB800] font-bold mt-1">•</span>
                <span><strong className="text-white">Clear description:</strong> Explain the issue or question in detail</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#FFB800] font-bold mt-1">•</span>
                <span><strong className="text-white">Steps to reproduce:</strong> If reporting a bug, describe how to recreate the issue</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#FFB800] font-bold mt-1">•</span>
                <span><strong className="text-white">Browser & device:</strong> Let us know which browser and device you're using</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#FFB800] font-bold mt-1">•</span>
                <span><strong className="text-white">Screenshots:</strong> Visual examples help us understand the problem faster</span>
              </li>
            </ul>
          </section>

          <section className="bg-gradient-to-br from-[#FFB800]/5 to-[#FFB800]/10 border border-[#FFB800]/20 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-3">Response Time</h2>
            <p className="text-gray-300 leading-relaxed">
              We strive to respond to all inquiries within 24-48 hours during business days. For urgent issues affecting many users, we aim to respond even faster. Thank you for your patience and for helping us improve ConvertFlowly!
            </p>
          </section>
        </motion.div>
        
        {/* Bottom Spacing */}
        <div className="h-20"></div>
    </div>
  );
}
