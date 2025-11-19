import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-[#FFB800]/20 to-[#FF9A1F]/20 border border-[#FFB800]/40">
            <Shield className="w-8 h-8 text-[#FFB800]" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-[#FFB800] via-[#FFC933] to-[#FF9A1F] bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-gray-400">Last updated: January 2025</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="space-y-8 text-gray-300"
        >
          <section className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-4">Your Privacy Matters</h2>
            <p className="leading-relaxed">
              At ConvertFlowly, we are committed to protecting your privacy. This policy outlines how we handle your data when you use our file conversion services.
            </p>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-4">Data Processing</h2>
            <p className="leading-relaxed mb-4">
              All file conversions are processed entirely in your browser using client-side technology. This means:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Your files never leave your device</li>
              <li>No files are uploaded to our servers</li>
              <li>We cannot access or view your documents</li>
              <li>All processing happens locally on your computer</li>
            </ul>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-4">Information We Collect</h2>
            <p className="leading-relaxed mb-4">
              We collect minimal information to improve our services:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Anonymous usage statistics (page views, tool usage)</li>
              <li>Browser type and version for compatibility</li>
              <li>Device type for responsive design optimization</li>
            </ul>
            <p className="leading-relaxed mt-4">
              We do not collect personal information unless you voluntarily provide it through our contact form.
            </p>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-4">Cookies</h2>
            <p className="leading-relaxed">
              We use essential cookies to maintain your preferences and improve your experience. These cookies do not track your personal information and are necessary for the website to function properly.
            </p>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-4">Third-Party Services</h2>
            <p className="leading-relaxed">
              We may use third-party analytics services to understand how our website is used. These services collect anonymous data and do not have access to your converted files.
            </p>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-4">Data Security</h2>
            <p className="leading-relaxed">
              Since all processing happens in your browser, your files remain completely secure on your device. We implement industry-standard security measures to protect any data that passes through our website.
            </p>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-4">Changes to This Policy</h2>
            <p className="leading-relaxed">
              We may update this privacy policy from time to time. Any changes will be posted on this page with an updated revision date.
            </p>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
            <p className="leading-relaxed">
              If you have any questions about this privacy policy, please contact us at{' '}
              <a href="mailto:support@convertflowly.com" className="text-[#FFB800] hover:text-[#FFC933] transition-colors">
                support@convertflowly.com
              </a>
            </p>
          </section>
        </motion.div>
        
        {/* Bottom Spacing */}
        <div className="h-20"></div>
      </div>
  );
}
