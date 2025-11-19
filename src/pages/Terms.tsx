import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

export default function Terms() {
  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-[#FFB800]/20 to-[#FF9A1F]/20 border border-[#FFB800]/40">
            <FileText className="w-8 h-8 text-[#FFB800]" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-[#FFB800] via-[#FFC933] to-[#FF9A1F] bg-clip-text text-transparent">
            Terms of Service
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
            <h2 className="text-2xl font-bold text-white mb-4">Agreement to Terms</h2>
            <p className="leading-relaxed">
              By accessing and using ConvertFlowly, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our services.
            </p>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-4">Service Description</h2>
            <p className="leading-relaxed mb-4">
              ConvertFlowly provides free, client-side file conversion tools. Our services include but are not limited to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Document format conversion</li>
              <li>Image format conversion</li>
              <li>PDF manipulation and generation</li>
              <li>File compression and optimization</li>
            </ul>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-4">User Responsibilities</h2>
            <p className="leading-relaxed mb-4">
              When using our services, you agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Use the service only for lawful purposes</li>
              <li>Not attempt to circumvent or disable any security features</li>
              <li>Not use the service to process illegal or harmful content</li>
              <li>Respect intellectual property rights of content you convert</li>
              <li>Not attempt to reverse engineer or exploit our tools</li>
            </ul>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-4">Disclaimer of Warranties</h2>
            <p className="leading-relaxed">
              ConvertFlowly is provided "as is" without any warranties, express or implied. We do not guarantee that the service will be uninterrupted, error-free, or that results will meet your requirements. Use of the service is at your own risk.
            </p>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-4">Limitation of Liability</h2>
            <p className="leading-relaxed">
              ConvertFlowly and its operators shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use our services, including but not limited to data loss, business interruption, or loss of profits.
            </p>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-4">Data Processing</h2>
            <p className="leading-relaxed">
              All file conversions are processed locally in your browser. We do not store, access, or transmit your files. You retain full ownership and responsibility for all content you process through our service.
            </p>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-4">Service Availability</h2>
            <p className="leading-relaxed">
              We strive to maintain high availability but do not guarantee uninterrupted service. We reserve the right to modify, suspend, or discontinue any part of our service at any time without prior notice.
            </p>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-4">Intellectual Property</h2>
            <p className="leading-relaxed">
              All content, features, and functionality of ConvertFlowly are owned by us and protected by international copyright, trademark, and other intellectual property laws. You may not copy, modify, or distribute our code or design without explicit permission.
            </p>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-4">Changes to Terms</h2>
            <p className="leading-relaxed">
              We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms. We will update the "Last updated" date when changes are made.
            </p>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-4">Contact Information</h2>
            <p className="leading-relaxed">
              For questions about these Terms of Service, please contact us at{' '}
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
