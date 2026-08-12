import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import ApplicationStepper from '../../components/public/ApplicationStepper';
import { CheckCircle2, ShieldAlert, ArrowRight, ArrowLeft, Send } from 'lucide-react';

export default function ApplicationForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialHostelType = searchParams.get('type') || 'BOYS';

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedAppNo, setSubmittedAppNo] = useState('');

  // Form State preserved across steps
  const [formData, setFormData] = useState({
    hostelType: initialHostelType,
    // Step 1: Applicant Details
    applicantDetails: {
      firstName: '',
      middleName: '',
      lastName: '',
      dob: '2004-01-01',
      gender: initialHostelType === 'GIRLS' ? 'Female' : 'Male',
      mobile: '',
      email: '',
      subCaste: 'Satvara',
      bloodGroup: 'B+',
      permanentAddress: '',
      city: 'Surendranagar',
      district: 'Surendranagar',
      state: 'Gujarat',
      pincode: '363001',
    },
    // Step 2: Family Details
    familyDetails: {
      fatherName: '',
      fatherOccupation: 'Agriculture / Self-Employed',
      fatherMobile: '',
      motherName: '',
      guardianName: '',
      annualIncome: '180000',
      emergencyContact: '',
      familyAddress: '',
    },
    // Step 3: Academic Details
    academicDetails: {
      courseName: 'B.Tech Engineering',
      collegeName: 'L.D. College of Engineering',
      university: 'Gujarat Technological University (GTU)',
      currentYearSem: '1st Year / 1st Sem',
      sscPercentage: '85.5',
      hscPercentage: '82.0',
      lastExamPercentage: '82.0',
      admissionProofNo: 'ADM-2026-99',
    },
    // Step 4: Hostel Preference
    hostelPreference: {
      hostelId: initialHostelType === 'GIRLS' ? 2 : 1,
      preferredRoomType: 'DOUBLE',
      expectedJoiningDate: '2026-09-01',
      foodRequired: true,
      medicalCondition: '',
      specialRequest: '',
    },
    declarationChecked: false,
  });

  // Files state
  const [files, setFiles] = useState({});

  const [settings, setSettings] = useState({
    admission_status: 'OPEN',
    admission_status_boys_ahmedabad: 'OPEN',
    admission_status_girls_ahmedabad: 'OPEN',
    admission_status_boys_anand: 'OPEN',
    admission_closed_notice_gu: '',
    admission_closed_notice_en: '',
  });
  const [hostelList, setHostelList] = useState([]);

  // Save to localStorage & fetch Settings + Hostels
  useEffect(() => {
    const saved = localStorage.getItem('satvara_draft_application');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(parsed);
      } catch (e) {}
    }

    // Fetch site settings for admission status
    api.get('/cms/settings').then((res) => {
      if (res.data.success && res.data.settings) {
        setSettings((prev) => ({ ...prev, ...res.data.settings }));
      }
    }).catch(() => {});

    // Fetch dynamic hostels list
    api.get('/occupancy/summary').then((res) => {
      if (res.data.success) {
        setHostelList(res.data.hostels || []);
      }
    }).catch(() => {});
  }, []);

  const getHostelAdmissionStatus = (hostel) => {
    if (!hostel) return 'OPEN';
    if (settings.admission_status === 'CLOSED') return 'CLOSED';
    const name = (hostel.name || '').toLowerCase();
    if (name.includes('girls') || name.includes('kanya')) {
      return settings.admission_status_girls_ahmedabad || 'OPEN';
    }
    if (name.includes('anand') || name.includes('v.v. nagar')) {
      return settings.admission_status_boys_anand || 'OPEN';
    }
    return settings.admission_status_boys_ahmedabad || 'OPEN';
  };

  const updateApplicantField = (field, val) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        applicantDetails: { ...prev.applicantDetails, [field]: val },
      };
      localStorage.setItem('satvara_draft_application', JSON.stringify(updated));
      return updated;
    });
  };

  const updateFamilyField = (field, val) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        familyDetails: { ...prev.familyDetails, [field]: val },
      };
      localStorage.setItem('satvara_draft_application', JSON.stringify(updated));
      return updated;
    });
  };

  const updateAcademicField = (field, val) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        academicDetails: { ...prev.academicDetails, [field]: val },
      };
      localStorage.setItem('satvara_draft_application', JSON.stringify(updated));
      return updated;
    });
  };

  const updatePreferenceField = (field, val) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        hostelPreference: { ...prev.hostelPreference, [field]: val },
      };
      localStorage.setItem('satvara_draft_application', JSON.stringify(updated));
      return updated;
    });
  };

  const handleFileChange = (e, fileType) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.');
        return;
      }
      setFiles((prev) => ({ ...prev, [fileType]: selected }));
    }
  };

  // Step Validation & Navigation
  const validateAndNext = () => {
    setErrorMsg('');
    if (currentStep === 1) {
      const { firstName, lastName, mobile, permanentAddress } = formData.applicantDetails;
      if (!firstName || !lastName || !mobile || mobile.length < 10 || !permanentAddress) {
        setErrorMsg('Please fill out First Name, Last Name, Valid 10-digit Mobile Number, and Permanent Address.');
        return;
      }
    }
    if (currentStep === 2) {
      const { fatherName, fatherMobile, emergencyContact } = formData.familyDetails;
      if (!fatherName || !fatherMobile || !emergencyContact) {
        setErrorMsg('Please fill Father Name, Father Mobile, and Emergency Contact.');
        return;
      }
    }
    if (currentStep === 3) {
      const { courseName, collegeName, lastExamPercentage } = formData.academicDetails;
      if (!courseName || !collegeName || !lastExamPercentage) {
        setErrorMsg('Please fill Course Name, College Name, and Last Exam %.');
        return;
      }
    }
    if (currentStep === 4) {
      const selectedHostel = hostelList.find((h) => h.id === formData.hostelPreference.hostelId);
      const selectedStatus = selectedHostel ? getHostelAdmissionStatus(selectedHostel) : 'OPEN';
      if (selectedStatus === 'CLOSED') {
        setErrorMsg('Admissions for the selected hostel facility are currently closed. Please choose another active hostel.');
        return;
      }
    }
    if (currentStep === 6) {
      if (!formData.declarationChecked) {
        setErrorMsg('You must agree to the declaration checkbox before submitting.');
        return;
      }
      // Directly submit application without OTP
      handleDirectSubmit();
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 6));
  };

  const handleDirectSubmit = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      // Prepare Multipart FormData
      const submitData = new FormData();
      submitData.append('hostelType', formData.hostelType);
      submitData.append('applicantDetails', JSON.stringify(formData.applicantDetails));
      submitData.append('familyDetails', JSON.stringify(formData.familyDetails));
      submitData.append('academicDetails', JSON.stringify(formData.academicDetails));
      submitData.append('hostelPreference', JSON.stringify(formData.hostelPreference));

      // Append files
      Object.keys(files).forEach((key) => {
        submitData.append(key, files[key]);
      });

      const res = await api.post('/applications/submit', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setSubmittedAppNo(res.data.applicationNumber);
        localStorage.removeItem('satvara_draft_application');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setLoading(false);
    }
  };

  // SUCCESS CONFIRMATION SCREEN
  if (submittedAppNo) {
    return (
      <div className="container" style={{ padding: '70px 20px', maxWidth: '680px' }}>
        <div className="card" style={{ textAlign: 'center', padding: '40px', borderTop: '6px solid #166534' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#dcfce7', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
            <CheckCircle2 size={40} />
          </div>
          <h2 className="heading-serif" style={{ fontSize: '1.9rem', color: 'var(--primary-navy)', marginBottom: '12px' }}>
            Application Submitted Successfully!
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.92rem' }}>
            Thank you for applying to Samast Satvara Mahamandal Hostels. Your unique Application Number is:
          </p>

          <div style={{ background: '#f8fafc', border: '2px dashed var(--primary-maroon)', borderRadius: 'var(--radius-md)', padding: '14px', fontSize: '1.7rem', fontWeight: 800, color: 'var(--primary-maroon)', letterSpacing: '1px', marginBottom: '24px' }}>
            {submittedAppNo}
          </div>

          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '28px' }}>
            Please save this Application Number and your registered Mobile Number (<strong>{formData.applicantDetails.mobile}</strong>) to track your application status.
          </p>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
            <button onClick={() => navigate('/admission/track')} className="btn btn-primary">
              Track Application Status
            </button>
            <button onClick={() => navigate('/')} className="btn btn-outline">
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ADMISSION CLOSED SCREEN (IF MASTER OR ALL HOSTELS CLOSED)
  const isMasterClosed = settings.admission_status === 'CLOSED';
  const isAllHostelsClosed = (
    settings.admission_status_boys_ahmedabad === 'CLOSED' &&
    settings.admission_status_girls_ahmedabad === 'CLOSED' &&
    settings.admission_status_boys_anand === 'CLOSED'
  );

  if (isMasterClosed || isAllHostelsClosed) {
    return (
      <div className="container" style={{ padding: '70px 20px', maxWidth: '720px' }}>
        <div className="card" style={{ textAlign: 'center', padding: '40px', borderTop: '6px solid #991b1b', background: '#ffffff', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.06)' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#fef2f2', color: '#991b1b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
            <ShieldAlert size={44} />
          </div>
          
          <h2 className="heading-serif" style={{ fontSize: '2rem', color: '#991b1b', marginBottom: '14px', fontWeight: 'bold' }}>
            શૈક્ષણિક વર્ષ ૨૦૨૬-૨૭ પ્રવેશ ફોર્મ બંધ છે
          </h2>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-navy)', marginBottom: '18px' }}>
            Admissions Currently Closed
          </h3>

          <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '12px', padding: '20px', fontSize: '0.96rem', color: '#9f1239', lineHeight: 1.7, marginBottom: '28px' }}>
            {settings.admission_closed_notice_gu || 'શૈક્ષણિક વર્ષ ૨૦૨૬-૨૭ માટે ઓનલાઇન છાત્રાલય પ્રવેશ પ્રક્રિયા પૂર્ણ થઈ ગયેલ છે અથવા હાલ પૂરતી બંધ રાખવામાં આવી છે.'}
            {settings.admission_closed_notice_en && (
              <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#881337', borderTop: '1px dashed #fda4af', paddingTop: '10px' }}>
                {settings.admission_closed_notice_en}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/admission/track')} className="btn btn-primary">
              Track Existing Application
            </button>
            <button onClick={() => navigate('/admission/merit-list')} className="btn btn-outline">
              View Published Merit Lists
            </button>
            <button onClick={() => navigate('/contact')} className="btn btn-outline">
              Contact Mandal Office
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '50px 20px', maxWidth: '880px' }}>
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <h1 className="heading-serif" style={{ fontSize: '2.1rem', color: 'var(--primary-maroon)', marginBottom: '6px' }}>
          Online Hostel Admission Form 2026-2027
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Applying for: <strong style={{ color: 'var(--primary-navy)' }}>{formData.hostelType === 'GIRLS' ? 'Girls Hostel' : 'Boys Hostel'}</strong>
        </p>
      </div>

      <ApplicationStepper currentStep={currentStep} />

      {errorMsg && (
        <div className="card" style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', padding: '12px', marginBottom: '20px', fontSize: '0.88rem' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      <div className="card" style={{ padding: '28px' }}>
        {/* STEP 1: APPLICANT DETAILS */}
        {currentStep === 1 && (
          <div>
            <h3 style={{ color: 'var(--primary-navy)', marginBottom: '18px', fontSize: '1.15rem' }}>Step 1 — Personal & Applicant Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input type="text" className="form-control" value={formData.applicantDetails.firstName} onChange={(e) => updateApplicantField('firstName', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Middle Name (Father)</label>
                <input type="text" className="form-control" value={formData.applicantDetails.middleName} onChange={(e) => updateApplicantField('middleName', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input type="text" className="form-control" value={formData.applicantDetails.lastName} onChange={(e) => updateApplicantField('lastName', e.target.value)} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Date of Birth *</label>
                <input type="date" className="form-control" value={formData.applicantDetails.dob} onChange={(e) => updateApplicantField('dob', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Mobile Number *</label>
                <input type="tel" className="form-control" placeholder="10 digit mobile" value={formData.applicantDetails.mobile} onChange={(e) => updateApplicantField('mobile', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-control" value={formData.applicantDetails.email} onChange={(e) => updateApplicantField('email', e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Permanent Native Address *</label>
              <textarea className="form-control" rows={3} value={formData.applicantDetails.permanentAddress} onChange={(e) => updateApplicantField('permanentAddress', e.target.value)} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">City / Village *</label>
                <input type="text" className="form-control" value={formData.applicantDetails.city} onChange={(e) => updateApplicantField('city', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">District *</label>
                <input type="text" className="form-control" value={formData.applicantDetails.district} onChange={(e) => updateApplicantField('district', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Pincode *</label>
                <input type="text" className="form-control" value={formData.applicantDetails.pincode} onChange={(e) => updateApplicantField('pincode', e.target.value)} required />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: FAMILY DETAILS */}
        {currentStep === 2 && (
          <div>
            <h3 style={{ color: 'var(--primary-navy)', marginBottom: '18px', fontSize: '1.15rem' }}>Step 2 — Family & Guardian Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Father's Full Name *</label>
                <input type="text" className="form-control" value={formData.familyDetails.fatherName} onChange={(e) => updateFamilyField('fatherName', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Father's Occupation</label>
                <input type="text" className="form-control" value={formData.familyDetails.fatherOccupation} onChange={(e) => updateFamilyField('fatherOccupation', e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Father's Mobile Number *</label>
                <input type="tel" className="form-control" value={formData.familyDetails.fatherMobile} onChange={(e) => updateFamilyField('fatherMobile', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Emergency Contact Mobile *</label>
                <input type="tel" className="form-control" value={formData.familyDetails.emergencyContact} onChange={(e) => updateFamilyField('emergencyContact', e.target.value)} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Mother's Name</label>
                <input type="text" className="form-control" value={formData.familyDetails.motherName} onChange={(e) => updateFamilyField('motherName', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Annual Family Income (₹)</label>
                <input type="number" className="form-control" value={formData.familyDetails.annualIncome} onChange={(e) => updateFamilyField('annualIncome', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: ACADEMIC DETAILS */}
        {currentStep === 3 && (
          <div>
            <h3 style={{ color: 'var(--primary-navy)', marginBottom: '18px', fontSize: '1.15rem' }}>Step 3 — Academic Record & Percentage</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Course Enrolled *</label>
                <input type="text" className="form-control" placeholder="e.g. B.Tech / MBBS / B.Com" value={formData.academicDetails.courseName} onChange={(e) => updateAcademicField('courseName', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">College / Institute Name *</label>
                <input type="text" className="form-control" placeholder="e.g. L.D. College of Engineering" value={formData.academicDetails.collegeName} onChange={(e) => updateAcademicField('collegeName', e.target.value)} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">University Name</label>
                <input type="text" className="form-control" value={formData.academicDetails.university} onChange={(e) => updateAcademicField('university', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Current Semester / Year</label>
                <input type="text" className="form-control" value={formData.academicDetails.currentYearSem} onChange={(e) => updateAcademicField('currentYearSem', e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">SSC (10th) %</label>
                <input type="number" step="0.1" className="form-control" value={formData.academicDetails.sscPercentage} onChange={(e) => updateAcademicField('sscPercentage', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">HSC (12th) %</label>
                <input type="number" step="0.1" className="form-control" value={formData.academicDetails.hscPercentage} onChange={(e) => updateAcademicField('hscPercentage', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Last Exam Percentage *</label>
                <input type="number" step="0.1" className="form-control" value={formData.academicDetails.lastExamPercentage} onChange={(e) => updateAcademicField('lastExamPercentage', e.target.value)} required />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: HOSTEL PREFERENCE */}
        {currentStep === 4 && (
          <div>
            <h3 style={{ color: 'var(--primary-navy)', marginBottom: '18px', fontSize: '1.15rem' }}>Step 4 — Hostel Selection & Sharing Preference</h3>
            
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" style={{ fontWeight: 'bold' }}>Target Hostel Facility *</label>
              <select
                className="form-control"
                value={formData.hostelPreference.hostelId}
                onChange={(e) => {
                  const hId = parseInt(e.target.value, 10);
                  const selectedHostel = hostelList.find((h) => h.id === hId);
                  updatePreferenceField('hostelId', hId);
                  if (selectedHostel) {
                    setFormData((prev) => ({ ...prev, hostelType: selectedHostel.type }));
                  }
                }}
                required
              >
                {hostelList.map((h) => {
                  const status = getHostelAdmissionStatus(h);
                  const isOpen = status === 'OPEN';
                  return (
                    <option key={h.id} value={h.id}>
                      🏢 {h.name} ({h.city}) — {isOpen ? '🟢 [Admissions OPEN]' : '🔴 [Admissions CLOSED]'}
                    </option>
                  );
                })}
              </select>

              {(() => {
                const currentSelectedHostel = hostelList.find((h) => h.id === formData.hostelPreference.hostelId);
                const currentStatus = currentSelectedHostel ? getHostelAdmissionStatus(currentSelectedHostel) : 'OPEN';
                if (currentStatus === 'CLOSED') {
                  return (
                    <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '12px', borderRadius: '8px', color: '#991b1b', fontSize: '0.88rem', marginTop: '10px' }}>
                      ⚠️ Admissions for <strong>{currentSelectedHostel?.name}</strong> are currently CLOSED. Please select another active hostel facility to proceed.
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Preferred Room Sharing</label>
                <select className="form-control" value={formData.hostelPreference.preferredRoomType} onChange={(e) => updatePreferenceField('preferredRoomType', e.target.value)}>
                  <option value="DOUBLE">Double Sharing (2 Beds)</option>
                  <option value="TRIPLE">Triple Sharing (3 Beds)</option>
                  <option value="SINGLE">Single Room</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Expected Joining Date</label>
                <input type="date" className="form-control" value={formData.hostelPreference.expectedJoiningDate} onChange={(e) => updatePreferenceField('expectedJoiningDate', e.target.value)} />
              </div>
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
              <input type="checkbox" id="foodChk" checked={formData.hostelPreference.foodRequired} onChange={(e) => updatePreferenceField('foodRequired', e.target.checked)} />
              <label htmlFor="foodChk">Opt for Daily Mess / Meals Facility</label>
            </div>
          </div>
        )}

        {/* STEP 5: DOCUMENT UPLOAD */}
        {currentStep === 5 && (
          <div>
            <h3 style={{ color: 'var(--primary-navy)', marginBottom: '18px', fontSize: '1.15rem' }}>Step 5 — Upload Required Documents</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Allowed formats: JPG, PNG, PDF (Max size 5MB each). Documents are stored securely and verified by admin.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
              <div className="form-group card" style={{ background: '#f8fafc' }}>
                <label className="form-label">📷 Passport Photo</label>
                <input type="file" onChange={(e) => handleFileChange(e, 'photo')} accept="image/*" />
              </div>

              <div className="form-group card" style={{ background: '#f8fafc' }}>
                <label className="form-label">🪪 Aadhaar / ID Proof</label>
                <input type="file" onChange={(e) => handleFileChange(e, 'id_proof')} accept="image/*,.pdf" />
              </div>

              <div className="form-group card" style={{ background: '#f8fafc' }}>
                <label className="form-label">📜 Community / Caste Proof</label>
                <input type="file" onChange={(e) => handleFileChange(e, 'community_proof')} accept="image/*,.pdf" />
              </div>

              <div className="form-group card" style={{ background: '#f8fafc' }}>
                <label className="form-label">📑 Marksheet (HSC / Last Exam)</label>
                <input type="file" onChange={(e) => handleFileChange(e, 'marksheet')} accept="image/*,.pdf" />
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: DECLARATION & DIRECT SUBMIT */}
        {currentStep === 6 && (
          <div>
            <h3 style={{ color: 'var(--primary-navy)', marginBottom: '18px', fontSize: '1.15rem' }}>Step 6 — Review Details & Mandatory Declaration</h3>

            <div style={{ background: '#f8fafc', padding: '18px', borderRadius: 'var(--radius-md)', marginBottom: '20px', fontSize: '0.88rem', lineHeight: 1.7 }}>
              <div><strong>Applicant Name:</strong> {formData.applicantDetails.firstName} {formData.applicantDetails.lastName}</div>
              <div><strong>Mobile:</strong> {formData.applicantDetails.mobile}</div>
              <div><strong>Course:</strong> {formData.academicDetails.courseName} ({formData.academicDetails.collegeName})</div>
              <div><strong>Last Exam %:</strong> {formData.academicDetails.lastExamPercentage}%</div>
              <div><strong>Selected Hostel:</strong> {formData.hostelType === 'GIRLS' ? 'Girls Hostel' : 'Boys Hostel'}</div>
            </div>

            <div className="card" style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '14px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#991b1b', fontWeight: 700, marginBottom: '6px', fontSize: '0.9rem' }}>
                <ShieldAlert size={18} /> Severe Warning Regarding False Academic Marks
              </div>
              <p style={{ fontSize: '0.82rem', color: '#991b1b' }}>
                Providing inaccurate or forged academic marks will result in permanent rejection, fee forfeiture, and blacklisting from Shree Satwara Maha Mandal hostels.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <input
                type="checkbox"
                id="declChk"
                checked={formData.declarationChecked}
                onChange={(e) => setFormData((prev) => ({ ...prev, declarationChecked: e.target.checked }))}
                style={{ marginTop: '3px' }}
              />
              <label htmlFor="declChk" style={{ fontSize: '0.88rem', color: 'var(--primary-navy)' }}>
                I hereby declare that all information entered above is true, complete, and accurate to the best of my knowledge. I agree to follow all hostel rules.
              </label>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px', paddingTop: '18px', borderTop: '1px solid var(--border-light)' }}>
          {currentStep > 1 && (
            <button className="btn btn-outline" onClick={() => setCurrentStep((prev) => prev - 1)}>
              <ArrowLeft size={16} /> Back
            </button>
          )}

          {currentStep < 6 && (
            <button className="btn btn-primary" onClick={validateAndNext} style={{ marginLeft: 'auto' }}>
              Next Step <ArrowRight size={16} />
            </button>
          )}

          {currentStep === 6 && (
            <button className="btn btn-accent btn-lg" onClick={validateAndNext} disabled={!formData.declarationChecked || loading} style={{ marginLeft: 'auto' }}>
              {loading ? 'Submitting Application...' : 'Submit Application'} <Send size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
