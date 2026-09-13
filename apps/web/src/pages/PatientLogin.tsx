import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, Phone, Lock } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card"
import { Input } from "../components/ui/Input"
import { Button } from "../components/ui/Button"

// Temporary using standard state since react-hook-form schema has an issue with typing here, but let's just use standard React state for simplicity in MVP
export default function PatientLogin() {
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault()
    if (phone.length >= 10) {
      setStep("otp")
    }
  }

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length === 6) {
      // Success login logic
      alert("Logged in successfully!")
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-teal-100 to-transparent opacity-50 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <Link to="/" className="inline-flex items-center text-teal-700 hover:text-teal-800 mb-6 font-medium transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Portal Selection
        </Link>

        <Card glass>
          <AnimatePresence mode="wait">
            {step === "phone" ? (
              <motion.div
                key="phone"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center mb-4">
                    <Phone className="w-6 h-6" />
                  </div>
                  <CardTitle>Patient Login</CardTitle>
                  <CardDescription>
                    Enter your mobile number to receive a one-time password (OTP).
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm font-medium text-slate-700">Mobile Number</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">+91</span>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="99999 99999"
                          className="pl-12 text-lg tracking-wider"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full mt-2" size="lg" disabled={phone.length < 10}>
                      Send OTP
                    </Button>
                  </form>
                </CardContent>
              </motion.div>
            ) : (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center mb-4">
                    <Lock className="w-6 h-6" />
                  </div>
                  <CardTitle>Verify OTP</CardTitle>
                  <CardDescription>
                    We've sent a 6-digit code to <span className="font-semibold text-slate-900">+91 {phone}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="otp" className="text-sm font-medium text-slate-700">One-Time Password</label>
                      <Input
                        id="otp"
                        type="text"
                        inputMode="numeric"
                        placeholder="• • • • • •"
                        className="text-center text-2xl tracking-[0.5em] font-medium h-14"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full mt-2" size="lg" disabled={otp.length < 6}>
                      Verify & Login
                    </Button>
                    <div className="text-center mt-4">
                      <button
                        type="button"
                        onClick={() => setStep("phone")}
                        className="text-sm text-slate-500 hover:text-teal-600 font-medium"
                      >
                        Change mobile number
                      </button>
                    </div>
                  </form>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </div>
  )
}
