import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'

import Home from './pages/Home.tsx'
import Login from './pages/Login.tsx'
import PatientLogin from './pages/PatientLogin.tsx'
import HospitalLogin from './pages/HospitalLogin.tsx'

// Layouts
import { PublicLayout } from './components/layout/PublicLayout.tsx'
import { PatientLayout } from './components/layout/PatientLayout.tsx'
import { FacilityLayout } from './components/layout/FacilityLayout.tsx'
import { AdminLayout } from './components/layout/AdminLayout.tsx'

import PatientAssessment from './pages/patient/Assessment.tsx'
import PatientCarePlan from './pages/patient/CarePlan.tsx'
import PatientFacilities from './pages/patient/Facilities.tsx'
import PatientJourney from './pages/patient/Journey.tsx'
import PatientReferrals from './pages/patient/Referrals.tsx'
import PatientFollowUp from './pages/patient/FollowUp.tsx'

// Dashboards
import PatientDashboard from './pages/patient/Dashboard.tsx'
import FacilityDashboard from './pages/facility/Dashboard.tsx'
import FacilityReferrals from './pages/facility/Referrals.tsx'
import FacilityCapacity from './pages/facility/Capacity.tsx'
import AdminDashboard from './pages/admin/Dashboard.tsx'
import AdminBottlenecks from './pages/admin/Bottlenecks.tsx'

import './index.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/login', element: <Login /> },
      // Preserving existing routes for now
      { path: '/patient-login', element: <PatientLogin /> },
      { path: '/hospital-login', element: <HospitalLogin /> },
    ],
  },
  {
    path: '/patient',
    element: <PatientLayout />,
    children: [
      { index: true, element: <Navigate to="/patient/dashboard" replace /> },
      { path: 'dashboard', element: <PatientDashboard /> },
      { path: 'assessment', element: <PatientAssessment /> },
      { path: 'care-plan', element: <PatientCarePlan /> },
      { path: 'facilities', element: <PatientFacilities /> },
      { path: 'journey', element: <PatientJourney /> },
      { path: 'referrals', element: <PatientReferrals /> },
      { path: 'follow-up', element: <PatientFollowUp /> },
    ]
  },
  {
    path: '/facility',
    element: <FacilityLayout />,
    children: [
      { index: true, element: <Navigate to="/facility/dashboard" replace /> },
      { path: 'dashboard', element: <FacilityDashboard /> },
      { path: 'referrals', element: <FacilityReferrals /> },
      { path: 'capacity', element: <FacilityCapacity /> },
    ]
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard', element: <AdminDashboard /> },
      { path: 'bottlenecks', element: <AdminBottlenecks /> },
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
