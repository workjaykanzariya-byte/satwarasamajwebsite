import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import { ShieldCheck, FileText, Lock, CheckCircle, Mail, Globe, Phone } from 'lucide-react';

const defaultPolicies = {
  'terms-of-use': {
    titleGu: 'નિયમો અને શરતો',
    titleEn: 'Terms of Use',
    contentGu: `સમસ્ત સતવારા મહામંડળ – અમદાવાદની વેબસાઇટનો ઉપયોગ કરીને તમે નીચે દર્શાવેલ નિયમો અને શરતો સ્વીકારો છો. જો તમે આ શરતો સાથે સંમત ન હોવ તો કૃપા કરીને વેબસાઇટનો ઉપયોગ ન કરો.

📋 1. વેબસાઇટનો ઉપયોગ
આ વેબસાઇટનો ઉપયોગ માત્ર કાયદેસર અને યોગ્ય હેતુઓ માટે જ કરવો. કોઈપણ એવી પ્રવૃત્તિ કરવી નહીં જે વેબસાઇટ, સર્વર અથવા અન્ય વપરાશકર્તાઓને નુકસાન પહોંચાડે.

📝 2. માહિતીની ચોકસાઈ
વેબસાઇટ પર ઉપલબ્ધ માહિતી શક્ય તેટલી સાચી અને અપડેટ રાખવાનો પ્રયાસ કરવામાં આવે છે. તેમ છતાં તમામ માહિતી સંપૂર્ણપણે ભૂલરહિત હશે તેની ખાતરી આપવામાં આવતી નથી.

📄 3. ઓનલાઈન ફોર્મ અને અરજીઓ
વેબસાઇટ પર ભરવામાં આવતા તમામ ફોર્મમાં સાચી અને સંપૂર્ણ માહિતી આપવી ફરજિયાત છે.
• અધૂરી માહિતી ધરાવતી અરજી રદ થઈ શકે છે.
• ખોટી અથવા ભ્રામક માહિતી મળ્યે અરજી અમાન્ય ગણાશે.
• દસ્તાવેજોની ચકાસણી બાદ અંતિમ નિર્ણય લેવામાં આવશે.

🏠 4. હોસ્ટેલ પ્રવેશ
હોસ્ટેલ પ્રવેશ માટે અરજી કરવાથી પ્રવેશની ખાતરી મળતી નથી. પ્રવેશ સંબંધિત અંતિમ નિર્ણય સમસ્ત સતવારા મહામંડળની અધિકૃત સમિતિ નો રહેશે.
પસંદગી મેરીટ, ઉપલબ્ધ બેઠકો અને સંસ્થાના નિયમો મુજબ કરવામાં આવશે.

©️ 5. બૌદ્ધિક સંપત્તિ અધિકાર
વેબસાઇટ પર ઉપલબ્ધ તમામ લખાણ, ડિઝાઇન, લોગો, ફોટોગ્રાફ્સ અને અન્ય સામગ્રી સમસ્ત સતવારા મહામંડળની માલિકી છે.
પૂર્વ લેખિત મંજૂરી વગર તેની નકલ, પ્રકાશન અથવા વ્યાપારી ઉપયોગ કરી શકાશે નહીં.

🔗 6. બાહ્ય લિંક્સ
વેબસાઇટ પર તૃતીય પક્ષની વેબસાઇટોની લિંક્સ હોઈ શકે છે. આવી બાહ્ય વેબસાઇટોના વિષયવસ્તુ, સુરક્ષા અથવા ગોપનીયતા માટે સમસ્ત સતવારા મહામંડળ જવાબદાર રહેશે નહીં.

⚖️ 7. જવાબદારીની મર્યાદા
વેબસાઇટના ઉપયોગથી થનારા કોઈપણ સીધા, પરોક્ષ અથવા આકસ્મિક નુકસાન માટે સમસ્ત સતવારા મહામંડળ જવાબદાર રહેશે નહીં.

🔧 8. સેવા ફેરફાર અથવા બંધ કરવાનો અધિકાર
સમસ્ત સતવારા મહામંડળ કોઈપણ સમયે વેબસાઇટ, સેવાઓ, ફોર્મ્સ અથવા માહિતીમાં ફેરફાર કરવાનો અથવા તેને બંધ કરવાનો અધિકાર ધરાવે છે.

🔒 9. Privacy Policy
વેબસાઇટનો ઉપયોગ કરતી વખતે તમારી વ્યક્તિગત માહિતીનું સંચાલન અમારી Privacy Policy અનુસાર કરવામાં આવશે.

🔄 10. નિયમોમાં ફેરફાર
આ Terms of Use માં સમયાંતરે ફેરફાર થઈ શકે છે. સુધારેલી શરતો વેબસાઇટ પર પ્રકાશિત થયા બાદ તરત અમલમાં આવશે.

📞 11. સંપર્ક
સમસ્ત સતવારા મહામંડળ – અમદાવાદ
📧 Email: info@satvaramahamandal.org
🌐 Website: satvaramahamandal.org`,
  },
  'privacy-policy': {
    titleGu: 'ગોપનીયતા નીતિ',
    titleEn: 'Privacy Policy',
    contentGu: `સમસ્ત સતવારા મહામંડળ – અમદાવાદ ("અમે", "અમારું" અથવા "સંસ્થા") અમારી વેબસાઇટનો ઉપયોગ કરતા તમામ મુલાકાતીઓ, સભ્યો, વિદ્યાર્થીઓ અને અરજદારોની વ્યક્તિગત માહિતીની ગોપનીયતા અને સુરક્ષા જાળવવા માટે પ્રતિબદ્ધ છે.

📋 1. એકત્રિત કરવામાં આવતી માહિતી
• નામ
• મોબાઇલ નંબર
• ઇ-મેલ સરનામું
• રહેઠાણનું સરનામું
• શૈક્ષણિક માહિતી
• સભ્યપદ અથવા પ્રવેશ સંબંધિત માહિતી
• ફોટોગ્રાફ
• આધાર કાર્ડ અથવા અન્ય જરૂરી દસ્તાવેજો
• વેબસાઇટ ઉપયોગ સંબંધિત ટેકનિકલ માહિતી

🎯 2. માહિતીનો ઉપયોગ
• હોસ્ટેલ પ્રવેશ પ્રક્રિયાનું સંચાલન
• સમાજની પ્રવૃત્તિઓ અને સેવાઓનું સંચાલન
• સભ્યપદ સંબંધિત કામગીરી
• અરજીઓની ચકાસણી અને પ્રક્રિયા
• ઇ-મેલ અથવા મોબાઇલ દ્વારા મહત્વપૂર્ણ સૂચનાઓ મોકલવા
• વેબસાઇટની કાર્યક્ષમતા સુધારવા
• કાયદાકીય અને વહીવટી જરૂરિયાતો પૂર્ણ કરવા

📄 3. દસ્તાવેજો અને અપલોડ્સ
વેબસાઇટ પર અપલોડ કરવામાં આવેલા દસ્તાવેજો, ફોટોગ્રાફ્સ અને અન્ય માહિતીનો ઉપયોગ માત્ર સંબંધિત સેવા અથવા પ્રક્રિયા માટે જ કરવામાં આવશે.

🔐 4. માહિતીની સુરક્ષા
અમે વ્યક્તિગત માહિતીની સુરક્ષા માટે યોગ્ય ટેકનિકલ અને વહીવટી સુરક્ષા વ્યવસ્થા અપનાવીએ છીએ.

🚫 5. માહિતીનું વહેંચાણ
સમસ્ત સતવારા મહામંડળ કોઈપણ વ્યક્તિગત માહિતી તૃતીય પક્ષને વેચતું નથી, ભાડે આપતું નથી અથવા માર્કેટિંગ હેતુઓ માટે આપતું નથી.
• કાયદાકીય આવશ્યકતા મુજબ
• સંસ્થાના અધિકૃત હોદ્દેદારો અથવા સમિતિઓ સાથે
• સરકારી અથવા કાયદેસર સત્તાધિકારીની માંગણી મુજબ

🍪 6. Cookies
અમારી વેબસાઇટ Cookies અને સમાન ટેક્નોલોજીનો ઉપયોગ કરી શકે છે જેથી વેબસાઇટનું પ્રદર્શન અને ઉપયોગકર્તા અનુભવ વધુ સારો બનાવી શકાય.

🔗 7. બાહ્ય લિંક્સ
અમારી વેબસાઇટ પર અન્ય વેબસાઇટોની લિંક્સ હોઈ શકે છે. આવી બાહ્ય વેબસાઇટોની Privacy Policies માટે સમસ્ત સતવારા મહામંડળ જવાબદાર રહેશે નહીં.

👦 8. બાળકોની ગોપનીયતા
અમે જાણપૂર્વક 13 વર્ષથી ઓછી ઉંમરના બાળકો પાસેથી વ્યક્તિગત માહિતી એકત્રિત કરતા નથી.

🔄 9. Privacy Policy માં ફેરફાર
સમસ્ત સતવારા મહામંડળ કોઈપણ સમયે આ Privacy Policy માં સુધારા અથવા ફેરફાર કરવાનો અધિકાર ધરાવે છે.

📞 10. સંપર્ક
સમસ્ત સતવારા મહામંડળ – અમદાવાદ
📧 Email: info@satvaramahamandal.org
🌐 Website: satvaramahamandal.org`,
  },
};

export default function StaticPolicyPage() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);

  useEffect(() => {
    api.get(`/cms/pages/${slug}`).then((res) => {
      if (res.data.success && res.data.page) {
        setPage(res.data.page);
      } else if (defaultPolicies[slug]) {
        setPage(defaultPolicies[slug]);
      }
    }).catch(() => {
      if (defaultPolicies[slug]) {
        setPage(defaultPolicies[slug]);
      }
    });
  }, [slug]);

  const activePolicy = page || defaultPolicies[slug] || defaultPolicies['terms-of-use'];

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', padding: '60px 20px 80px 20px' }}>
      <div className="container" style={{ maxWidth: '920px', margin: '0 auto' }}>
        
        {/* Page Title Card */}
        <div style={{ background: 'linear-gradient(135deg, #0F172A, #1E293B)', color: '#FFFFFF', padding: '40px 32px', borderRadius: '20px', marginBottom: '30px', boxShadow: '0 10px 30px rgba(15,23,42,0.15)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '10px' }}>
            {slug === 'privacy-policy' ? <Lock color="#F59E0B" size={32} /> : <FileText color="#F59E0B" size={32} />}
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '1px' }}>
              OFFICIAL MANDAL POLICY DOCUMENT
            </span>
          </div>
          <h1 className="heading-serif" style={{ fontSize: '2.3rem', margin: 0, color: '#FFFFFF' }}>
            {activePolicy.titleGu} ({activePolicy.titleEn})
          </h1>
          <p style={{ margin: '8px 0 0 0', color: '#94A3B8', fontSize: '0.95rem' }}>
            Samast Satvara Mahamandal, Ahmedabad — Legal & Privacy Framework
          </p>
        </div>

        {/* Policy Content Body */}
        <div className="card" style={{ padding: '40px', lineHeight: 1.85, fontSize: '1rem', color: '#1E293B', background: '#FFFFFF', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <div style={{ whiteSpace: 'pre-line', fontFamily: 'system-ui, sans-serif' }}>
            {activePolicy.contentGu}
          </div>
        </div>

      </div>
    </div>
  );
}
