import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { Building2, User, ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4">
            Welcome to <span className="text-teal-600">SwasthyaSetu</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            A unified rural healthcare referral & follow-up coordination platform.
            Please select your portal to continue.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Patient Portal Card */}
          <Link to="/patient-login" className="block group">
            <motion.div
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white p-8 rounded-3xl shadow-lg border border-slate-200 h-full flex flex-col items-center text-center transition-shadow group-hover:shadow-xl group-hover:border-teal-200 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                <ArrowRight className="w-6 h-6 text-teal-600" />
              </div>
              <div className="w-20 h-20 bg-teal-50 rounded-2xl flex items-center justify-center mb-6 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <User className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-3">Patient Portal</h2>
              <p className="text-slate-600">
                Access your health records, view referral status, and schedule follow-ups via OTP.
              </p>
            </motion.div>
          </Link>

          {/* Hospital/PHC Portal Card */}
          <Link to="/hospital-login" className="block group">
            <motion.div
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white p-8 rounded-3xl shadow-lg border border-slate-200 h-full flex flex-col items-center text-center transition-shadow group-hover:shadow-xl group-hover:border-blue-200 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                <ArrowRight className="w-6 h-6 text-blue-600" />
              </div>
              <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Building2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-3">Facility Portal</h2>
              <p className="text-slate-600">
                For PHCs, ASHA coordinators, and Hospital administrators to manage incoming referrals.
              </p>
            </motion.div>
          </Link>
        </div>
      </div>
    </div>
  )
}
