import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Target, Rocket, Award, GraduationCap, Home as HomeIcon, BookOpen, Users, ShieldCheck, HeartHandshake, Calendar } from 'lucide-react';

export default function About() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('presidents');

  const formerPresidents = [
    { period: '1991 - 1996', name: 'શ્રી અમૃતભાઈ પી. શ્રીમાળી', location: 'અમદાવાદ' },
    { period: '23/11/1996 to 25/03/2000', name: 'શ્રી ભગવાનદાસ કે. સોનગરા', location: 'અમદાવાદ' },
    { period: '26-03-2000 to 16-06-2005', name: 'શ્રી ઠાકરસીભાઈ એમ. ચાવડા', location: 'થાનગઢ, સુરેન્દ્રનગર' },
    { period: '17-06-2005 to 15-06-2020', name: 'શ્રી નરસીભાઈ કે. રાઠોડ', location: 'અમદાવાદ' },
    { period: '16-06-2020 to 04-01-2026', name: 'શ્રી શંકરભાઈ આર. દલવાડી', location: 'લીંબડી, સુરેન્દ્રનગર' },
    { period: '04-01-2026 to Present', name: 'શ્રી રાજેશભાઈ કે. મકવાણા', location: 'ધંધુકા, અમદાવાદ', isCurrent: true },
  ];

  const formerSecretaries = [
    { period: '14-07-1991 to 25-03-2000', name: 'શ્રી નારણભાઈ એ. રાઠોડ', location: 'અમદાવાદ' },
    { period: '26-03-2000 to 13-06-2009', name: 'શ્રી ઠાકરસીભાઈ જે. ચૌહાણ', location: 'વઢવાણ, સુરેન્દ્રનગર' },
    { period: '13-06-2009 to 15-06-2020', name: 'શ્રી દામજીભાઈ ડી. કણઝરીયા', location: 'અમદાવાદ' },
    { period: '16-06-2020 to 04-01-2026', name: 'શ્રી રાજેશભાઈ કે. મકવાણા', location: 'ધંધુકા, અમદાવાદ' },
    { period: '04-01-2026 to Present', name: 'શ્રી ગીરીશભાઈ એસ. લકુમ', location: 'હળવદ, સુરેન્દ્રનગર', isCurrent: true },
  ];

  const servicesList = [
    { icon: <GraduationCap size={28} />, titleGu: 'Education Support', descGu: 'સમાજના વિદ્યાર્થીઓને ઉચ્ચ શિક્ષણ માટે સ્કોલરશિપ અને આર્થિક પ્રોત્સાહન.' },
    { icon: <HomeIcon size={28} />, titleGu: 'Hostel Facility', descGu: 'અમદાવાદમાં રહેવા-જમવાની ઉત્કૃષ્ટ આધુનિક છાત્રાલય સુવિધા.' },
    { icon: <Award size={28} />, titleGu: 'Merit Support', descGu: 'તેજસ્વી વિદ્યાર્થી સન્માન સમારંભ અને મેરિટ એવોર્ડ્સ.' },
    { icon: <BookOpen size={28} />, titleGu: 'Satvara Darpan', descGu: 'સમાજનો અવાજ અને સમાચારો રજૂ કરતું માસિક મુખપત્ર સામયિક.' },
    { icon: <HeartHandshake size={28} />, titleGu: 'Community Service', descGu: 'સામાજિક એકતા, કલ્યાણ યોજનાઓ અને આપત્તિ સમયે સેવા.' },
    { icon: <Users size={28} />, titleGu: 'Student Guidance', descGu: 'યુવા પેઢી માટે કારકિર્દી સેમિનાર, કાઉન્સેલિંગ અને માર્ગદર્શન.' },
  ];

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: '70px' }}>
      
      {/* Hero Header Banner */}
      <section style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #1E3A8A 100%)', color: '#ffffff', padding: '56px 0', borderBottom: '4px solid #F59E0B', position: 'relative' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(245, 158, 11, 0.2)', color: '#FFD700', border: '1px solid #F59E0B', borderRadius: '30px', padding: '6px 20px', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '14px' }}>
            <ShieldCheck size={16} /> {t('trust_reg')}
          </div>
          <h1 style={{ fontSize: '2.5rem', color: '#FFFFFF', margin: '0 0 10px 0', fontWeight: 800, fontFamily: 'serif, sans-serif' }}>
            {language === 'gu' ? 'અમારો પરિચય' : 'About Samast Satwara Mahamandal'}
          </h1>
          <p style={{ maxWidth: '780px', margin: '0 auto', color: '#E2E8F0', fontSize: '1.05rem', lineHeight: '1.6' }}>
            સમસ્ત સતવારા મહામંડળ સતવારા સમાજના શૈક્ષણિક, સામાજિક અને સાંસ્કૃતિક વિકાસ માટે કાર્યરત એક અગ્રણી સંસ્થા છે. સંસ્થા દ્વારા શિક્ષણ, સમાજ સેવા, યુવા વિકાસ, સાંસ્કૃતિક પ્રવૃત્તિઓ અને વિદ્યાર્થીઓના કલ્યાણ માટે વિવિધ યોજનાઓ ચલાવવામાં આવે છે.
          </p>
        </div>
      </section>

      <div className="container" style={{ marginTop: '40px' }}>
        
        {/* Leadership Desk Messages (President & Secretary) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '28px', marginBottom: '44px' }}>
          
          {/* President Card */}
          <div className="card" style={{ padding: '28px', borderTop: '5px solid #F59E0B', background: '#FFFFFF', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '18px', borderBottom: '1px solid #F1F5F9', paddingBottom: '14px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #0F172A, #1E3A8A)', color: '#FFD700', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                👨‍💼
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 'bold', color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  પ્રમુખશ્રીની કલમે
                </span>
                <h3 style={{ fontSize: '1.3rem', color: '#0F172A', margin: '2px 0 0 0', fontWeight: 'bold' }}>
                  રાજેશભાઈ કે. મકવાણા
                </h3>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748B' }}>
                  પ્રમુખશ્રી (ધંધુકા, અમદાવાદ)
                </p>
              </div>
            </div>
            
            <div style={{ background: '#FFFBEB', borderLeft: '4px solid #F59E0B', padding: '10px 14px', borderRadius: '0 8px 8px 0', fontSize: '0.92rem', fontWeight: 'bold', color: '#B45309', marginBottom: '14px' }}>
              "શિક્ષણ અને સંસ્કારથી સમાજનો સર્વાંગી વિકાસ."
            </div>

            <p style={{ fontSize: '0.94rem', color: '#334155', lineHeight: '1.7', margin: 0 }}>
              પ્રિય સમાજજનો, સમસ્ત સતવારા મહામંડળ સમાજના વિકાસ અને વિદ્યાર્થીઓના ઉજ્જવળ ભવિષ્ય માટે સતત કાર્યરત છે. આપ સૌના સહયોગથી સંસ્થા નવા શૈક્ષણિક અને સામાજિક માપદંડો સ્થાપિત કરી રહી છે.
            </p>
          </div>

          {/* General Secretary Card */}
          <div className="card" style={{ padding: '28px', borderTop: '5px solid #0284C7', background: '#FFFFFF', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '18px', borderBottom: '1px solid #F1F5F9', paddingBottom: '14px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #0284C7, #0F172A)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                🖋️
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 'bold', color: '#0284C7', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  મહામંત્રીશ્રીની કલમે
                </span>
                <h3 style={{ fontSize: '1.3rem', color: '#0F172A', margin: '2px 0 0 0', fontWeight: 'bold' }}>
                  ગીરીશભાઈ એસ. લકુમ
                </h3>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748B' }}>
                  મહામંત્રીશ્રી (હળવદ, સુરેન્દ્રનગર)
                </p>
              </div>
            </div>
            
            <div style={{ background: '#F0F9FF', borderLeft: '4px solid #0284C7', padding: '10px 14px', borderRadius: '0 8px 8px 0', fontSize: '0.92rem', fontWeight: 'bold', color: '#0369A1', marginBottom: '14px' }}>
              "ટ્રેડિશનના સંકલ્પ સાથે ટેકનોલોજીને આવકારતી આપણી સંસ્થા"
            </div>

            <p style={{ fontSize: '0.94rem', color: '#334155', lineHeight: '1.7', margin: 0 }}>
              વિશ્વભરમાં વસતા સતવારાનું ગૌરવ બનેલી આપણી સંસ્થા નવા સમય સાથે પરંપરાને જાળવીને આગળ વધી રહી છે. ઓનલાઈન પ્રવેશ પ્રક્રિયા દ્વારા વિદ્યાર્થીઓને વધુ સરળતા અને પારદર્શિતા ઉપલબ્ધ કરાવવામાં આવી છે.
            </p>
          </div>

        </div>

        {/* Vision & Mission Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px', marginBottom: '44px' }}>
          
          {/* Vision */}
          <div className="card" style={{ padding: '28px', background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', color: '#FFFFFF', borderRadius: '16px', boxShadow: '0 10px 25px rgba(15,23,42,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.2)', color: '#FFD700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Target size={26} />
              </div>
              <h2 style={{ fontSize: '1.5rem', color: '#FFD700', margin: 0, fontWeight: 'bold' }}>
                🎯 Vision (દ્રષ્ટિ)
              </h2>
            </div>
            <ul style={{ paddingLeft: '20px', fontSize: '0.98rem', color: '#E2E8F0', lineHeight: '1.8', margin: 0 }}>
              <li style={{ marginBottom: '10px' }}>શિક્ષિત, સંસ્કારી, સંગઠિત અને આત્મનિર્ભર સતવારા સમાજનું નિર્માણ કરવું.</li>
              <li>કન્યાછાત્રાલય નું અધ્યતન સુવિધા સાથેનું નિર્માણ કરવું.</li>
            </ul>
          </div>

          {/* Mission */}
          <div className="card" style={{ padding: '28px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Rocket size={26} />
              </div>
              <h2 style={{ fontSize: '1.5rem', color: '#0F172A', margin: 0, fontWeight: 'bold' }}>
                🚀 Mission (ધ્યેય)
              </h2>
            </div>
            <ul style={{ paddingLeft: '20px', fontSize: '0.95rem', color: '#334155', lineHeight: '1.7', margin: 0 }}>
              <li style={{ marginBottom: '8px' }}>સમાજના વિદ્યાર્થીઓને ઉચ્ચ શિક્ષણ માટે પ્રોત્સાહન આપવું.</li>
              <li style={{ marginBottom: '8px' }}>યુવા પેઢીને માર્ગદર્શન અને વિકાસની તકો ઉપલબ્ધ કરાવવી.</li>
              <li style={{ marginBottom: '8px' }}>સામાજિક એકતા અને સેવા પ્રવૃત્તિઓને પ્રોત્સાહન આપવું.</li>
              <li>સમાજના ઉત્કર્ષ માટે નવીન યોજનાઓ અમલમાં મૂકવી.</li>
            </ul>
          </div>

        </div>

        {/* Services Section */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h2 className="heading-serif" style={{ fontSize: '2rem', color: '#0F172A', marginBottom: '8px' }}>
              🏠 અમારી સેવાઓ & પ્રવૃત્તિઓ
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.95rem' }}>
              સતવારા વિદ્યાર્થીઓના કલ્યાણ અને સમાજના સશક્તિકરણ માટે ઉપલબ્ધ સેવાઓ
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            {servicesList.map((service, index) => (
              <div key={index} className="card card-hover" style={{ padding: '24px', background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', transition: 'all 0.3s ease' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: '#FFFBEB', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                  {service.icon}
                </div>
                <h3 style={{ fontSize: '1.15rem', color: '#0F172A', margin: '0 0 8px 0', fontWeight: 'bold' }}>
                  {service.titleGu}
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: '1.5', margin: 0 }}>
                  {service.descGu}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Former Leadership History Timeline */}
        <div className="card" style={{ padding: '32px', background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', marginBottom: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h2 className="heading-serif" style={{ fontSize: '1.9rem', color: '#0F172A', marginBottom: '8px' }}>
              🏛️ સંસ્થાનો ઐતિહાસિક વારસો & નેતૃત્વ
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.92rem' }}>
              ૧૯૯૧ થી વર્તમાન સુધી મહામંડળના માર્ગદર્શક પૂર્વ હોદ્દેદારોશ્રીઓ
            </p>

            {/* Tab Buttons */}
            <div style={{ display: 'inline-flex', background: '#F1F5F9', borderRadius: '30px', padding: '4px', marginTop: '16px' }}>
              <button
                onClick={() => setActiveTab('presidents')}
                style={{
                  padding: '10px 24px',
                  borderRadius: '26px',
                  border: 'none',
                  background: activeTab === 'presidents' ? 'linear-gradient(135deg, #0F172A, #1E293B)' : 'transparent',
                  color: activeTab === 'presidents' ? '#FFD700' : '#475569',
                  fontWeight: 'bold',
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: activeTab === 'presidents' ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                }}
              >
                🏆 Former Presidents (માજી પ્રમુખશ્રીઓ)
              </button>
              <button
                onClick={() => setActiveTab('secretaries')}
                style={{
                  padding: '10px 24px',
                  borderRadius: '26px',
                  border: 'none',
                  background: activeTab === 'secretaries' ? 'linear-gradient(135deg, #0F172A, #1E293B)' : 'transparent',
                  color: activeTab === 'secretaries' ? '#FFD700' : '#475569',
                  fontWeight: 'bold',
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: activeTab === 'secretaries' ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                }}
              >
                🖋️ Former Secretaries (માજી મહામંત્રીશ્રીઓ)
              </button>
            </div>
          </div>

          {/* List Display */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {(activeTab === 'presidents' ? formerPresidents : formerSecretaries).map((person, i) => (
              <div
                key={i}
                style={{
                  padding: '16px 20px',
                  borderRadius: '12px',
                  background: person.isCurrent ? 'linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)' : '#F8FAFC',
                  border: person.isCurrent ? '2px solid #F59E0B' : '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                }}
              >
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: person.isCurrent ? '#F59E0B' : '#0F172A', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem', flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div style={{ flexGrow: 1 }}>
                  <div style={{ fontSize: '0.78rem', color: person.isCurrent ? '#B45309' : '#64748B', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} /> {person.period}
                  </div>
                  <h4 style={{ fontSize: '1.05rem', color: '#0F172A', margin: '2px 0 1px 0', fontWeight: 'bold' }}>
                    {person.name}
                  </h4>
                  <span style={{ fontSize: '0.82rem', color: '#475569' }}>
                    📍 {person.location}
                  </span>
                </div>
                {person.isCurrent && (
                  <span style={{ background: '#F59E0B', color: '#FFFFFF', fontSize: '0.72rem', fontWeight: 'bold', padding: '2px 8px', borderRadius: '10px' }}>
                    Present
                  </span>
                )}
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}
