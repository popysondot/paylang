import { Routes, Route } from 'react-router-dom'
import PaymentPage from './pages/PaymentPage'
import ThankYouPage from './pages/ThankYouPage'
import AboutTutors from './pages/AboutTutors'
import Pricing from './pages/Pricing'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import LawAssignments from './pages/LawAssignments'
import MedicalResearch from './pages/MedicalResearch'
import BusinessCaseStudies from './pages/BusinessCaseStudies'
import PhDConsultation from './pages/PhDConsultation'
import RefundPage from './pages/RefundPage'
import AdminDashboard from './pages/AdminDashboard'
import NotFound from './pages/NotFound'
import ScrollToTop from './components/ScrollToTop'
import PagePreloader from './components/PagePreloader'

function App() {
  return (
    <PagePreloader>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<PaymentPage />} />
        <Route path="/thank-you" element={<ThankYouPage />} />
        <Route path="/about-tutors" element={<AboutTutors />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/law-assignments" element={<LawAssignments />} />
        <Route path="/medical-research" element={<MedicalResearch />} />
        <Route path="/business-case-studies" element={<BusinessCaseStudies />} />
        <Route path="/phd-consultation" element={<PhDConsultation />} />
        <Route path="/refund" element={<RefundPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admindashboard" element={<AdminDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </PagePreloader>
  )
}

export default App
