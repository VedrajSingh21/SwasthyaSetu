import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Building2, Eye, EyeOff, UserCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card"
import { Input } from "../components/ui/Input"
import { Button } from "../components/ui/Button"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function Login() {
  const [activeTab, setActiveTab] = useState<"patient" | "facility">("patient")
  
  // Patient Login State
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  
  // Facility Login State
  const [showPassword, setShowPassword] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const navigate = useNavigate();

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault()
    if (phone.length >= 10) {
      setStep("otp")
    }
  }

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length === 6) {
      navigate('/patient/dashboard');
    }
  }

  const onFacilitySubmit = async (_data: LoginFormValues) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    navigate('/facility/dashboard');
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-linear-to-b from-teal-100/50 to-transparent opacity-50 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10">
        <Link to="/" className="inline-flex items-center text-teal-700 hover:text-teal-800 mb-6 font-medium transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <Card className="shadow-lg border-slate-200">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => { setActiveTab("patient"); setStep("phone"); }}
              className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === "patient" ? "text-teal-600 border-b-2 border-teal-600 bg-white" : "text-slate-500 bg-slate-50 hover:bg-slate-100 hover:text-slate-700"}`}
            >
              <UserCircle2 className="w-4 h-4" />
              Patient Login
            </button>
            <button
              onClick={() => setActiveTab("facility")}
              className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === "facility" ? "text-blue-600 border-b-2 border-blue-600 bg-white" : "text-slate-500 bg-slate-50 hover:bg-slate-100 hover:text-slate-700"}`}
            >
              <Building2 className="w-4 h-4" />
              Facility Login
            </button>
          </div>

          <div className="p-2">
            {activeTab === "patient" && (
              <AnimatePresence mode="wait">
                {step === "phone" ? (
                  <motion.div key="phone" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                    <CardHeader>
                      <CardTitle>Patient Portal</CardTitle>
                      <CardDescription>Enter your mobile number to receive an OTP.</CardDescription>
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
                        <Button type="submit" className="w-full mt-2 bg-teal-600 hover:bg-teal-700" size="lg" disabled={phone.length < 10}>
                          Send OTP
                        </Button>
                      </form>
                    </CardContent>
                  </motion.div>
                ) : (
                  <motion.div key="otp" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                    <CardHeader>
                      <CardTitle>Verify OTP</CardTitle>
                      <CardDescription>We've sent a 6-digit code to <span className="font-semibold text-slate-900">+91 {phone}</span></CardDescription>
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
                        <Button type="submit" className="w-full mt-2 bg-teal-600 hover:bg-teal-700" size="lg" disabled={otp.length < 6}>
                          Verify & Login
                        </Button>
                        <div className="text-center mt-4">
                          <button type="button" onClick={() => setStep("phone")} className="text-sm text-slate-500 hover:text-teal-600 font-medium">
                            Change mobile number
                          </button>
                        </div>
                      </form>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {activeTab === "facility" && (
              <motion.div key="facility" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                <CardHeader>
                  <CardTitle>Facility Portal</CardTitle>
                  <CardDescription>Sign in to manage referrals and capacity.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onFacilitySubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-slate-700">Email or Username</label>
                      <Input id="email" type="email" placeholder="admin@phc-district.gov.in" error={!!errors.email} {...register("email")} />
                      {errors.email && <p className="text-sm text-red-500 font-medium">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label>
                        <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700">Forgot password?</a>
                      </div>
                      <div className="relative">
                        <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" error={!!errors.password} {...register("password")} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-sm text-red-500 font-medium">{errors.password.message}</p>}
                    </div>

                    <Button type="submit" className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white" size="lg" disabled={isSubmitting}>
                      {isSubmitting ? "Signing in..." : "Sign In to Dashboard"}
                    </Button>
                  </form>
                </CardContent>
              </motion.div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
