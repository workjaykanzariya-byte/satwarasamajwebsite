import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { User, Award } from 'lucide-react';

export default function Committee() {
  const { language } = useLanguage();
  const [members, setMembers] = useState([]);
  const [leadershipSettings, setLeadershipSettings] = useState({
    president_name_gu: 'રાજેશભાઈ કે. મકવાણા',
    president_title_gu: 'પ્રમુખશ્રીની કલમે',
    president_desig_gu: 'પ્રમુખશ્રી (ધંધુકા, અમદાવાદ)',
    president_motto_gu: 'શિક્ષણ અને સંસ્કારથી સમાજનો સર્વાંગી વિકાસ.',
    president_msg_gu: 'પ્રિય સમાજજનો, સમસ્ત સતવારા મહામંડળ સમાજના વિકાસ અને વિદ્યાર્થીઓના ઉજ્જવળ ભવિષ્ય માટે સતત કાર્યરત છે. આપ સૌના સહયોગથી સંસ્થા નવા શૈક્ષણિક અને સામાજિક માપદંડો સ્થાપિત કરી રહી છે.',
    
    secretary_name_gu: 'ગીરીશભાઈ એસ. લકુમ',
    secretary_title_gu: 'મહામંત્રીશ્રીની કલમે',
    secretary_desig_gu: 'મહામંત્રીશ્રી (હળવદ, સુરેન્દ્રનગર)',
    secretary_motto_gu: 'ટ્રેડિશનના સંકલ્પ સાથે ટેકનોલોજીને આવકારતી આપણી સંસ્થા',
    secretary_msg_gu: 'વિશ્વભરમાં વસતા સતવારાનું ગૌરવ બનેલી આપણી સંસ્થા નવા સમય સાથે પરંપરાને જાળવીને આગળ વધી રહી છે. ઓનલાઈન પ્રવેશ પ્રક્રિયા દ્વારા વિદ્યાર્થીઓને વધુ સરળતા અને પારદર્શિતા ઉપલબ્ધ કરાવવામાં આવી છે.',
  });

  useEffect(() => {
    // Fetch dynamic committee members
    api.get('/cms/committee').then((res) => {
      if (res.data.success) {
        setMembers(res.data.members || []);
      }
    }).catch(() => {});

    // Fetch dynamic site settings for leadership desk messages
    api.get('/cms/settings').then((res) => {
      if (res.data.success && res.data.settings) {
        setLeadershipSettings((prev) => ({ ...prev, ...res.data.settings }));
      }
    }).catch(() => {});
  }, []);

  const currentLeadership = [
    {
      titleGu: leadershipSettings.president_title_gu || 'પ્રમુખશ્રીની કલમે',
      nameGu: leadershipSettings.president_name_gu || 'રાજેશભાઈ કે. મકવાણા',
      desigGu: leadershipSettings.president_desig_gu || 'પ્રમુખશ્રી (ધંધુકા, અમદાવાદ)',
      mottoGu: leadershipSettings.president_motto_gu || 'શિક્ષણ અને સંસ્કારથી સમાજનો સર્વાંગી વિકાસ.',
      msgGu: leadershipSettings.president_msg_gu || 'પ્રિય સમાજજનો, સમસ્ત સતવારા મહામંડળ સમાજના વિકાસ અને વિદ્યાર્થીઓના ઉજ્જવળ ભવિષ્ય માટે સતત કાર્યરત છે.',
      color: '#F59E0B',
      avatar: '👨‍💼',
      photo: leadershipSettings.president_photo,
    },
    {
      titleGu: leadershipSettings.secretary_title_gu || 'મહામંત્રીશ્રીની કલમે',
      nameGu: leadershipSettings.secretary_name_gu || 'ગીરીશભાઈ એસ. લકુમ',
      desigGu: leadershipSettings.secretary_desig_gu || 'મહામંત્રીશ્રી (હળવદ, સુરેન્દ્રનગર)',
      mottoGu: leadershipSettings.secretary_motto_gu || 'ટ્રેડિશનના સંકલ્પ સાથે ટેકનોલોજીને આવકારતી આપણી સંસ્થા',
      msgGu: leadershipSettings.secretary_msg_gu || 'વિશ્વભરમાં વસતા સતવારાનું ગૌરવ બનેલી આપણી સંસ્થા નવા સમય સાથે પરંપરાને જાળવીને આગળ વધી રહી છે.',
      color: '#0284C7',
      avatar: '🖋️',
      photo: leadershipSettings.secretary_photo,
    },
  ];

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: '70px' }}>
      
      {/* Header Banner */}
      <section style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #1E3A8A 100%)', color: '#ffffff', padding: '56px 0', borderBottom: '4px solid #F59E0B' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.4rem', color: '#FFFFFF', margin: '0 0 10px 0', fontWeight: 800, fontFamily: 'serif, sans-serif' }}>
            {language === 'gu' ? 'કારોબારી સમિતિ અને ટ્રસ્ટી મંડળ' : 'Executive Committee & Leadership'}
          </h1>
          <p style={{ maxWidth: '720px', margin: '0 auto', color: '#E2E8F0', fontSize: '1.05rem', lineHeight: '1.6' }}>
            સમસ્ત સતવારા મહામંડળ સંચાલિત છાત્રાલયો, શૈક્ષણિક યોજનાઓ અને સામાજિક સેવાઓનું સંચાલન કરતા નેતૃત્વકર્તાશ્રીઓ.
          </p>
        </div>
      </section>

      <div className="container" style={{ marginTop: '40px' }}>
        
        {/* Main Leadership Desk (Matching Screenshot) */}
        <h2 className="heading-serif" style={{ fontSize: '1.8rem', color: '#0F172A', textAlign: 'center', marginBottom: '24px' }}>
          👑 મુખ્ય સંચાલક મંડળ (૨૦૨૬ થી વર્તમાન)
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '28px', marginBottom: '44px' }}>
          {currentLeadership.map((leader, index) => (
            <div key={index} className="card" style={{ padding: '28px', borderTop: `5px solid ${leader.color}`, background: '#FFFFFF', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '18px', borderBottom: '1px solid #F1F5F9', paddingBottom: '14px' }}>
                {leader.photo ? (
                  <img
                    src={leader.photo}
                    alt={leader.nameGu}
                    style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: `3px solid ${leader.color}`, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                  />
                ) : (
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #0F172A, #1E3A8A)', color: '#FFD700', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                    {leader.avatar}
                  </div>
                )}
                <div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 'bold', color: leader.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {leader.titleGu}
                  </span>
                  <h3 style={{ fontSize: '1.3rem', color: '#0F172A', margin: '2px 0 0 0', fontWeight: 'bold' }}>
                    {leader.nameGu}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748B' }}>
                    {leader.desigGu}
                  </p>
                </div>
              </div>
              
              <div style={{ background: index === 0 ? '#FFFBEB' : '#F0F9FF', borderLeft: `4px solid ${leader.color}`, padding: '10px 14px', borderRadius: '0 8px 8px 0', fontSize: '0.9rem', fontWeight: 'bold', color: index === 0 ? '#B45309' : '#0369A1', marginBottom: '14px' }}>
                "{leader.mottoGu}"
              </div>

              <p style={{ fontSize: '0.94rem', color: '#334155', lineHeight: '1.7', margin: 0 }}>
                {leader.msgGu}
              </p>
            </div>
          ))}
        </div>

        {/* Dynamic Trustees and Executive Committee Members (Matching Screenshot 1) */}
        {members.length > 0 && (
          <div>
            <h2 className="heading-serif" style={{ fontSize: '1.8rem', color: '#0F172A', textAlign: 'center', marginBottom: '24px' }}>
              ટ્રસ્ટીઓ અને કારોબારી સભ્યો
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
              {members.map((m) => (
                <div key={m.id} className="card card-hover" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px', background: '#FFFFFF', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                  <div style={{ width: '88px', height: '88px', borderRadius: '50%', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFD700', marginBottom: '16px', border: '3px solid #F59E0B', boxShadow: '0 6px 16px rgba(0,0,0,0.12)', overflow: 'hidden' }}>
                    {m.photoPath ? (
                      <img src={m.photoPath} alt={m.nameGu} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <User size={48} />
                    )}
                  </div>
                  
                  <h3 style={{ fontSize: '1.2rem', color: '#0F172A', marginBottom: '6px', fontWeight: 'bold' }}>
                    {language === 'gu' ? m.nameGu : m.nameEn}
                  </h3>
                  
                  <div style={{ color: '#D97706', fontWeight: 700, fontSize: '0.9rem', marginBottom: '12px' }}>
                    {language === 'gu' ? m.designationGu : m.designationEn}
                  </div>

                  <p style={{ fontSize: '0.86rem', color: '#64748B', textAlign: 'center', margin: 0, lineHeight: 1.6 }}>
                    {language === 'gu' ? m.bioGu : m.bioEn}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
