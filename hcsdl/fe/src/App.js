import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import FindJobPage from "./pages/FindJobPage";
import JobDetails from "./pages/JobDetails";
import ApplyJobPage from "./pages/ApplyJobPage";
import SignIn from "./pages/SignInPage";
import EmployerLanding from "./pages/EmployerLanding";
import RegisterEmployer from "./pages/RegisterEmployer";
import SignInEmployer from "./pages/SignInEmployer";
import PricingPlans from "./pages/EmployerPricing";
import EmployerDashboard from "./pages/EmployerDashboard";
import PostJob from "./pages/PostJob";
import UpdateJob from "./pages/UpdateJob";
import MyJob from "./pages/MyJob";
import CandidateDashboard from "./pages/CandidateDashboard";
import AppliedJobs from "./pages/AppliedJob";
import FavouriteJobs from "./pages/FavouriteJobs";
import CandidateSetting from "./pages/CandidateSetting";
import CandidateNoti from "./pages/CandidateNoti";
import WatchCandidate from "./pages/WatchCandidate";
import ViewCandidateProfile from "./pages/ViewCandidateProfile";

function App() {
  console.log("App rendered");
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/find-job" element={<FindJobPage />} />
        <Route path="/jobs/:jobId" element={<JobDetails />} />
        <Route path="/jobs/:jobId/apply" element={<ApplyJobPage />} />

        {/* Employer */}
        <Route path="/employer" element={<EmployerLanding />} />
        <Route path="/register-employer" element={<RegisterEmployer />} />
        <Route path="/signin-employer" element={<SignInEmployer />} />
        <Route path="/pricing-plans" element={<PricingPlans />} />
        <Route path="/employer-dashboard" element={<EmployerDashboard />} />
        <Route path="/employer/post-job" element={<PostJob />} />
        <Route path="/employer/update-job/:jobId" element={<UpdateJob />} />
        <Route path="/employer/my-jobs" element={<MyJob />} />
        <Route path="/employer/watch-candidate" element={<WatchCandidate />} />
        <Route path="/employer/watch-candidate/:jobId" element={<WatchCandidate />} />
        <Route path="/candidate/:candidateId" element={<ViewCandidateProfile />} />

        {/* Candidate */}
        <Route path="/candidate-dashboard" element={<CandidateDashboard />} />        
        <Route path="/candidate-dashboard/applied-jobs" element={<AppliedJobs />} />
        <Route path="/candidate-dashboard/favourite-jobs" element={<FavouriteJobs />} />
        <Route path="/candidate-dashboard/notifications" element={<CandidateNoti/>} />
        <Route path="/candidate-dashboard/setting" element={<CandidateSetting />} />
      </Routes>
    </Layout>
  );
}

export default App;
