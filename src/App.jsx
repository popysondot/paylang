import { Routes, Route } from 'react-router-dom'
import PaymentPage from './pages/PaymentPage'
import ThankYouPage from './pages/ThankYouPage'
import AboutUs from './pages/AboutUs'
import Pricing from './pages/Pricing'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import RefundPage from './pages/RefundPage'
import AdminDashboard from './pages/AdminDashboard'
import CustomerDashboard from './pages/CustomerDashboard'
import NotFound from './pages/NotFound'
import ScrollToTop from './components/ScrollToTop'
import PagePreloader from './components/PagePreloader'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <PagePreloader>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<PaymentPage />} />
          <Route path="/thank-you" element={<ThankYouPage />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/refund" element={<RefundPage />} />
          <Route path="/orders" element={<CustomerDashboard />} />
          <Route path="/dashboard" element={<CustomerDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </PagePreloader>
    </ErrorBoundary>
  )
}

export default App
