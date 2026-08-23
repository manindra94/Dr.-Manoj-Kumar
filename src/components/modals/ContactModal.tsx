import React, { useState } from 'react';
import { X, Send, Mail, Building, CheckCircle2 } from 'lucide-react';
import { localDB } from '../../lib/db';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    subject: 'Industrial R&D Collaboration',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    await localDB.saveContactMessage({
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      message: formData.organization ? `[Organization: ${formData.organization}]\n\n${formData.message}` : formData.message,
      senderRole: formData.organization || 'Inquirer'
    });

    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        email: '',
        organization: '',
        subject: 'Industrial R&D Collaboration',
        message: ''
      });
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#051424]/90 backdrop-blur-md p-4 flex items-center justify-center animate-in fade-in">
      <div className="max-w-lg w-full bg-[#122131] border border-[#273647] rounded-2xl p-6 space-y-4 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-[#051424] text-slate-300 hover:text-white border border-[#273647]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#1c2b3c] text-[#ffc640] font-mono text-[11px] font-bold">
            <Mail className="w-3.5 h-3.5" />
            CSIR-IMMT RESEARCH PORTAL
          </div>
          <h2 className="text-2xl font-bold font-serif text-[#d4e4fa]">Contact Dr. Manoj Kumar</h2>
          <p className="text-xs text-[#c6c6cd]">
            Direct research inquiries, industrial consultancy, Ph.D. supervision, or lab access requests. Messages are saved in Firebase Firestore.
          </p>
        </div>

        {submitted ? (
          <div className="p-6 rounded-xl bg-emerald-950/80 border border-emerald-500 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto animate-bounce" />
            <h3 className="font-serif font-bold text-lg text-emerald-300">Message Transmitted</h3>
            <p className="text-xs font-mono text-emerald-400">
              Your inquiry has been stored securely in Firebase Firestore. Dr. Manoj Kumar and lab administrators will review shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 font-mono text-xs">
            <div>
              <label className="text-[#c6c6cd] block mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="Dr. Sarah Jenkins"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#051424] border border-[#273647] text-[#d4e4fa] focus:border-[#ffc640] outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[#c6c6cd] block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="s.jenkins@mit.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#051424] border border-[#273647] text-[#d4e4fa] focus:border-[#ffc640] outline-none"
                />
              </div>

              <div>
                <label className="text-[#c6c6cd] block mb-1">Organization / Univ</label>
                <input
                  type="text"
                  required
                  placeholder="MIT Materials Dept"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#051424] border border-[#273647] text-[#d4e4fa] focus:border-[#ffc640] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[#c6c6cd] block mb-1">Subject</label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#051424] border border-[#273647] text-[#d4e4fa] focus:border-[#ffc640] outline-none"
              >
                <option value="Industrial R&D Collaboration">Industrial R&D Collaboration</option>
                <option value="Ph.D. / Postdoc Research">Ph.D. / Postdoc Research</option>
                <option value="Thermal Spray & AM Consultancy">Thermal Spray & AM Consultancy</option>
                <option value="General Scientific Query">General Scientific Query</option>
              </select>
            </div>

            <div>
              <label className="text-[#c6c6cd] block mb-1">Message Detail</label>
              <textarea
                rows={4}
                required
                placeholder="Describe project scope or inquiry parameters..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#051424] border border-[#273647] text-[#d4e4fa] focus:border-[#ffc640] outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-lg bg-[#ffc640] hover:bg-[#e3aa00] text-[#051424] font-bold text-xs uppercase font-mono tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'TRANSMITTING TO FIRESTORE...' : 'Send Research Inquiry'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
