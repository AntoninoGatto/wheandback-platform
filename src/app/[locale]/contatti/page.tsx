"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Mail, MessageSquare, Send, CheckCircle, Building2 } from "lucide-react";

export default function ContattiPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    type: "support",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-black mb-2" style={{ color: "#253866" }}>Contatti</h1>
            <p className="text-gray-500 text-sm">Supporto tecnico e commerciale per clienti e partner</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact info */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: "rgba(0,178,149,0.1)" }}
                >
                  <Mail className="w-5 h-5" style={{ color: "#00b295" }} />
                </div>
                <h3 className="font-bold text-sm mb-1" style={{ color: "#253866" }}>Email Supporto</h3>
                <p className="text-xs text-gray-500">support@wheback.com</p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: "rgba(37,56,102,0.08)" }}
                >
                  <Building2 className="w-5 h-5" style={{ color: "#253866" }} />
                </div>
                <h3 className="font-bold text-sm mb-1" style={{ color: "#253866" }}>Sede Legale</h3>
                <p className="text-xs text-gray-500">Buy All Free LTD</p>
                <p className="text-xs text-gray-500">Company Number: 13803002</p>
                <p className="text-xs text-gray-400 mt-2">Foro competente: Tribunale di Milano</p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: "rgba(0,178,149,0.1)" }}
                >
                  <MessageSquare className="w-5 h-5" style={{ color: "#00b295" }} />
                </div>
                <h3 className="font-bold text-sm mb-1" style={{ color: "#253866" }}>PEC Istituzionale</h3>
                <p className="text-xs text-gray-500">info@pec.wheback.com</p>
                <p className="text-xs text-gray-400 mt-1">Per comunicazioni legali e formali</p>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              {submitted ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: "rgba(0,178,149,0.1)" }}
                  >
                    <CheckCircle className="w-8 h-8" style={{ color: "#00b295" }} />
                  </div>
                  <h2 className="text-xl font-black mb-2" style={{ color: "#253866" }}>
                    Messaggio Inviato!
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Ti risponderemo entro 24-48 ore lavorative.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                  <h2 className="text-lg font-black mb-2" style={{ color: "#253866" }}>
                    Inviaci un Messaggio
                  </h2>

                  {/* Type selector */}
                  <div className="flex gap-2">
                    {[
                      { value: "support", label: "Supporto Tecnico" },
                      { value: "commercial", label: "Commerciale" },
                      { value: "legal", label: "Legale" },
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setFormData({ ...formData, type: value })}
                        className="flex-1 py-2 rounded-lg text-xs font-bold transition-all border"
                        style={
                          formData.type === value
                            ? { backgroundColor: "#253866", color: "white", borderColor: "#253866" }
                            : { backgroundColor: "white", color: "#64748b", borderColor: "#e2e8f0" }
                        }
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: "#253866" }}>
                        Nome *
                      </label>
                      <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00b295]"
                        placeholder="Il tuo nome"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: "#253866" }}>
                        Email *
                      </label>
                      <input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00b295]"
                        placeholder="tua@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "#253866" }}>
                      Oggetto *
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00b295]"
                      placeholder="Oggetto del messaggio"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "#253866" }}>
                      Messaggio *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00b295] resize-none"
                      placeholder="Descrivi la tua richiesta..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-sm transition-opacity hover:opacity-90"
                    style={{ backgroundColor: "#00b295" }}
                  >
                    <Send className="w-4 h-4" />
                    Invia Messaggio
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
