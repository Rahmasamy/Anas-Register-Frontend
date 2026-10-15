'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, BedDouble, BriefcaseBusiness, CarFront, Check, CircleHelp, Copy, Ellipsis, FileText, GraduationCap, MapPinned, Phone, Share2, ShieldCheck, Utensils, UsersRound,  type LucideIcon } from 'lucide-react';
import { Modal } from '../../shared/Modal';
import { SiteFooter, SiteHeader } from '../../shared/SiteChrome';
import { categories, centers, needsList, type RegistrationDraft } from './data';
import { getApiErrorMessage } from '../../infrastructure/http/api-error';
import { useCreateRegistration } from '../registrations/hooks/useCreateRegistration';
import type { RegistrationConfirmation } from '../registrations/types/registration.types';
import type { MapCoordinates } from './LocationMapPicker';

const LocationMapPicker = dynamic(() => import('./LocationMapPicker'), {
  ssr: false,
  loading: () => <div className="activity-map-loading" role="status">جارٍ تحميل الخريطة...</div>,
});

const blank: RegistrationDraft = {
  name: '', phone: '', project: '', center: '', location: '', landmark: '', category: '', specialties: [], status: 'قائم طوال العام',
  extra: '', needs: [], previousSupport: 'لا', contactChoice: 'نعم، عبر واتساب',
};
const categoriesDetails: Record<string, string[]> = {
  'الحرف والمنتجات اليدوية': ['الفخار والخزف', 'الخوص والجريد ومنتجات النخيل', 'السجاد والكليم والنسيج اليدوي', 'التطريز والخياطة اليدوية', 'الكروشيه والتريكو', 'المشغولات الخشبية', 'المشغولات الجلدية', 'المشغولات المعدنية', 'الحلي والإكسسوارات', 'حرفة أخرى'],
  'الإقامة والضيافة': ['فندق', 'بيت ضيافة', 'نزل أو إقامة ريفية', 'فيلا أو شاليه', 'شقة للإقامة', 'استضافة محلية', 'إقامة أخرى'],
  'الطعام والمنتجات المحلية': ['مطعم أو تقديم وجبات', 'وجبات منزلية', 'فطير ومخبوزات', 'حلويات ومنتجات تقليدية', 'ألبان وأجبان ومنتجاتها', 'عسل وتمور ومنتجات ريفية', 'منتجات زراعية محلية', 'أعشاب ونباتات عطرية', 'تجارب إعداد وتذوق الطعام', 'منتج أو خدمة أخرى'],
  'النقل والسفاري': ['نقل محلي للأفراد', 'نقل مجموعات', 'تنقل صحراوي وسفاري', 'خدمة سائق', 'تأجير مركبة مع سائق', 'خدمة نقل أخرى'],
  'التجارب والإرشاد والأنشطة': ['مرافقة الزوار والتعريف بالمواقع', 'جولات ثقافية وتراثية', 'مرافقة الطيور والطبيعة', 'تخييم وأنشطة خارجية', 'مشاهدة النجوم', 'تجارب ريفية وزراعية', 'ورش حرفية للزوار', 'تجارب طعام محلي', 'أنشطة رياضية أو ترفيهية', 'تجربة أو نشاط آخر'],
  'التدريب والتعليم': ['تعليم الحرف والفنون', 'الضيافة وخدمة العملاء', 'السياحة والتعريف بالتراث', 'التسويق والتصوير وصناعة المحتوى', 'المهارات الرقمية', 'الإدارة والتيسير وريادة الأعمال', 'الزراعة والإنتاج المحلي', 'البيئة والممارسات المستدامة', 'مجال آخر'],
  'المهن والخدمات المساندة': ['التصوير وإنتاج الفيديو', 'التصميم والتسويق وإدارة الصفحات', 'تنظيم الفعاليات وتجهيزها', 'الصيانة وإصلاح المعدات', 'النجارة والأثاث', 'الكهرباء', 'السباكة', 'البناء والتشطيبات', 'النظافة وتجهيز الأماكن', 'التغليف والشحن والتوصيل', 'خدمات رقمية أو إدارية', 'مهنة أو خدمة أخرى'],
  'نشاط آخر': [],
};

export function LandingPage() {
  const router = useRouter();
  const start = () => router.push('/register');
  const categories = [
    { title: 'الحرف والمنتجات اليدوية', detail: 'فخار، خوص، نسيج ومشغولات', Icon: BedDouble },
    { title: 'الإقامة والضيافة', detail: 'فنادق، بيوت ضيافة واستضافة', Icon: BedDouble },
    { title: 'الطعام والمنتجات المحلية', detail: 'وجبات، فطير ومنتجات ريفية', Icon: Utensils },
    { title: 'النقل والسفاري', detail: 'نقل محلي وتنقل صحراوي', Icon: CarFront },
    { title: 'التجارب والإرشاد والأنشطة', detail: 'أنشطة وتجارب وتعريف بالمواقع', Icon: MapPinned },
    { title: 'التدريب والتعليم', detail: 'مدربون وورش ومراكز تعليمية', Icon: GraduationCap },
    { title: 'المهن والخدمات المساندة', detail: 'تصوير، صيانة وتنظيم وخدمات', Icon: BriefcaseBusiness },
    { title: 'نشاط آخر', detail: 'عرّفنا بما تقدمه', Icon: Ellipsis },
  ];
  const centersArabic = ['الفيوم', 'إطسا', 'سنورس', 'طامية', 'أبشواي', 'يوسف الصديق'];
  const registrationSteps: { number: number; title: string; Icon: LucideIcon }[] = [
    { number: 1, title: 'نسجل بياناتك', Icon: FileText },
    { number: 2, title: 'نراجع المعلومات', Icon: CircleHelp },
    { number: 3, title: 'نتواصل عند الحاجة', Icon: UsersRound },
  ];
  return <div className="landing-page reference-landing" dir="rtl">
    <SiteHeader activePath="/" />
    <main>
      <section className="hero-section" id="home">
        <div className="hero-copy"><span className="eyebrow">مؤسسة أنس للتنمية البيئية والمجتمعية</span><h1>حرفتك. مهنتك. خدمتك.<br />لها مكان في أنس.</h1><p>نسجل الأنشطة المحلية في كل مراكز الفيوم لفهم احتياجات أصحابها وتنظيم التنمية المتابعة.</p>
          <div className="hero-actions"><button onClick={start} className="button button-primary">سجّل نشاطك الآن <ArrowLeft size={17} /></button><a href="#steps" className="text-link">اعرف خطوات التسجيل</a></div>
          <div className="hero-meta"><span>التسجيل مجاني</span><span>لا تحتاج حسابًا</span><span>تحتاج مساعدة؟ تواصل معنا</span></div>
        </div><div className="hero-art" role="img" aria-label="حرفي يعمل على تشكيل الفخار"><div className="hero-image" /></div>
      </section>
      <section className="category-section page-width"><div className="section-heading"><h2>مين يقدر يسجل؟</h2></div>
        <div className="category-grid">{categories.map(({ title, detail, Icon }) => <button key={title} className="category-tile" onClick={start}><Icon className="tile-icon" size={42} strokeWidth={1.7} /><b>{title}</b><small>{detail}</small></button>)}</div>
      </section>
      <section className="center-band ">
        <div className="page-width center-content">
          <h2>من كل مراكز الفيوم</h2>
          <div className="center-pills">
            {centersArabic.map((center) => 
            <span key={center}>{center}</span>)}
            </div>
            <p>اختر مركز نشاطك، ثم اكتب القرية أو الحي أو العزبة.</p>
            </div>
            </section>
      <section className="steps-section page-width" id="steps"><div className="section-heading"><h2>بعد ما تسجل</h2></div><div className="steps-row">
        {registrationSteps.map(({ number, title, Icon }) => <div className="step-tile" key={number}><span className="step-number">{number}</span><div><Icon size={38} /> <b>{title}</b></div></div>)}
      </div><p className="steps-note">استلام البيانات هو بداية الحصر، والنشر يحتاج مراجعة وموافقة منفصلة.</p></section>
      <section className="story-banner page-width"><div><h2>مع اقتراب مهرجان قرية تونس للفخار والحرف اليدوية</h2><strong>٥–٧ نوفمبر ٢٠٢٦</strong><p>تسجيل أنس مستقل عن تسجيل عارضي المهرجان.</p></div></section>
      <section className="register-cta page-width"><span className="eyebrow">خطوة بسيطة للتعريف بنشاطك</span><h2>ابدأ بتسجيل نشاطك</h2><p>خطوة بسيطة للتعريف بنشاطك ومكانه وأهم احتياجاتك.</p><button onClick={start} className="button button-light">سجّل الآن</button><small>التسجيل لا يضمن دعمًا أو فرص عمل، ولا يعني اعتمادًا أو ترخيصًا.</small></section>
      <SiteFooter />
    </main>
  </div>;
}

function OldLandingPage() {
  const router = useRouter();
  const [shared, setShared] = useState(false);
  const start = () => router.push('/register');
  const categoriesPreview = [
    ['الحرف والمنتجات اليدوية', '◉'], ['الإقامة والضيافة', '⌂'], ['الطعام والمنتجات المحلية', '♨'], ['النقل والسفاري', '⌁'],
    ['التجارب والإرشاد والأنشطة', '⌖'], ['التدريب والتعليم', '⌑'], ['المهن والخدمات المساندة', '⌘'], ['نشاط آخر', '…'],
  ];
  return <div className="landing-page" dir="rtl">
    <SiteHeader />
    <main>
      <section className="hero-section" id="home">
        <div className="hero-copy">
          <span className="eyebrow">مؤسسة أنس للتنمية البيئية والمجتمعية</span>
          <h1>حرفتك. مهنتك. خدمتك.<br />لها مكان في أنس.</h1>
          <p>نسجل الأنشطة المحلية في كل مراكز الفيوم لفهم احتياجات أصحابها وتنظيم التنمية.</p>
          <div className="hero-actions"><button onClick={start} className="button button-primary" data-testid="button-hero-register">سجّل نشاطك الآن <ArrowLeft size={17} /></button><a href="#steps" className="text-link">اعرف خطوات التسجيل <ArrowLeft size={14} /></a></div>
          <div className="hero-meta"><span>التسجيل مجاني</span><span>لا تحتاج حسابًا</span><span>تحتاج مساعدة؟ تواصل معنا</span></div>
        </div>
        <div className="hero-art" role="img" aria-label="حرفي يعمل على تشكيل الفخار">
          <div className="hero-image"></div><div className="art-caption"><span>من قلب الفيوم</span><b>حرفة تُحكى<br />بكل لمسة</b></div>
          <span className="art-stamp">حرفة محلية<br/>من الفيوم</span>
        </div>
      </section>

      <section className="category-section page-width">
        <div className="section-heading"><span className="eyebrow">المجتمع المحلي</span><h2>مين يقدر يسجل؟</h2><p>كل نشاط محلي له أثر يستحق أن يكون معروفًا.</p></div>
        <div className="category-grid">{categoriesPreview.map(([title, glyph], index) => <button key={title} className="category-tile" onClick={start} data-testid={`category-${index}`}><span className="tile-icon">{glyph}</span><b>{title}</b><small>{['فخار، خوص، نسيج ومشغولات', 'فنادق وبيوت ضيافة وإقامة', 'وجبات، فطير ومنتجات ريفية', 'نقل محلي وتنقل صحراوي', 'أنشطة وتجارب وتعريف بالمواقع', 'مدربون وورش ومراكز تعليمية', 'تصوير وصيانة وتنظيم وخدمات', 'عرّفنا بما تقدمه'][index]}</small></button>)}</div>
      </section>

      <section className="center-band">
        <div className="page-width center-content"><div><span className="eyebrow">قريب منك</span><h2>من كل مراكز الفيوم</h2></div><div className="center-pills">{centers.map((center) => <span key={center}>{center}</span>)}</div><p>اختر مركز نشاطك، ثم اكتب القرية أو الحي أو العزبة.</p></div>
      </section>

      <section className="steps-section page-width" id="steps">
        <div className="section-heading"><span className="eyebrow">ببساطة وبدون تعقيد</span><h2>بعد ما تسجل</h2><p>بياناتك تساعدنا نفهم النشاط ونرجع لك عند الحاجة.</p></div>
        <div className="steps-row">
          {[['١', 'سجّل بياناتك', 'اسمك ومكان نشاطك'], ['٢', 'نراجع المعلومات', 'نرتب البيانات حسب اختيارك'], ['٣', 'نتواصل عند الحاجة', 'فريقنا يتواصل معك']].map(([number, title, text]) => <div className="step-tile" key={number}><span className="step-number">{number}</span><div><b>{title}</b><small>{text}</small></div></div>)}
        </div>
      </section>

      <section className="story-banner page-width">
        <div><span className="eyebrow">مع اقتراب مهرجان قرية تونس</span><h2>للحرف اليدوية والفخار</h2><p>سجّل نشاطك وخلّي حرفتك جزء من حكاية الفيوم.</p></div>
        <button className="button button-cream" onClick={start} data-testid="button-story-register">ابدأ التسجيل <ArrowLeft size={16} /></button>
      </section>

      <section className="register-cta page-width">
        <div className="cta-pattern">فــيــوم</div><span className="eyebrow">خطوة بسيطة، أثرها كبير</span><h2>ابدأ بتسجيل نشاطك</h2><p>عرّفنا بنشاطك ومكانه وأهم احتياجاتك.</p><button onClick={start} className="button button-light" data-testid="button-bottom-register">سجّل الآن <ArrowLeft size={16} /></button><small>التسجيل لا يضمن عملًا أو ترخيصًا، ولا يعني اعتمادًا أو ترخيصًا.</small>
      </section>
      <SiteFooter />
    </main>
    {shared && <Modal title="شارك أنس مع أصحاب الحرف" onClose={() => setShared(false)}><p>ساعد أصحاب الأنشطة المحلية في الفيوم على التسجيل والتعريف بخدماتهم.</p><button className="button button-primary full-width" onClick={() => { void navigator.clipboard?.writeText(window.location.origin); setShared(false); }}>نسخ رابط التسجيل</button></Modal>}
    <button className="floating-share" onClick={() => setShared(true)} aria-label="مشاركة التسجيل" data-testid="button-share"><Share2 size={18} /></button>
  </div>;
}

export function RegistrationPage() {
  const router = useRouter();
  const { mutateAsync: createRegistration, isPending } = useCreateRegistration();
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<RegistrationDraft>(blank);
  const [coordinates, setCoordinates] = useState<MapCoordinates | null>(null);
  const [pendingCoordinates, setPendingCoordinates] = useState<MapCoordinates | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const set = <K extends keyof RegistrationDraft>(key: K, value: RegistrationDraft[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const toggle = (key: 'needs' | 'specialties', value: string) => {
    const old = draft[key];
    set(key, old.includes(value) ? old.filter((item) => item !== value) : [...old, value]);
  };
  const validateStep = () => {
    if (step === 1 && (!draft.name.trim() || !/^01\d{9}$/.test(draft.phone.replace(/\s/g, '')) || !draft.center || !draft.location.trim() || !coordinates)) return 'أكمل الاسم ورقم الموبايل والمركز، واكتب وصف المكان وحدد موقع النشاط على الخريطة.';
    if (step === 2 && (!draft.category || (draft.category !== 'نشاط آخر' && !draft.specialties.length))) return 'اختر فئة النشاط ونوع النشاط الذي تقدمه.';
    if (step === 3 && !draft.needs.length) return 'اختر أهم احتياج واحد على الأقل أو «لا أحتاج دعمًا حاليًا».';
    return '';
  };
  const next = () => { const message = validateStep(); if (message) { setError(message); return; } setError(''); setStep((current) => Math.min(4, current + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const back = () => { setError(''); setStep((current) => Math.max(1, current - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const submit = async () => {
    if (!consent) { setError('يرجى تأكيد صحة البيانات والموافقة على استخدامها.'); return; }
    if (!coordinates) { setError('حدد موقع النشاط على الخريطة قبل الإرسال.'); setStep(1); return; }
    if (isPending) return;

    try {
      setError('');
      const registration = await createRegistration({ ...draft, ...coordinates, consent: true });
      sessionStorage.setItem('anas-last-entry', JSON.stringify(registration));
      router.push('/confirmation');
    } catch (submissionError) {
      setError(getApiErrorMessage(submissionError));
    }
  };
  const specialties = categoriesDetails[draft.category] ?? [];
  return <main className="registration-shell" dir="rtl">
    <div className="registration-top"><Link href="/" className="wordmark" data-testid="link-register-home">أنس<span className="brand-dot">.</span></Link><div className="top-actions"><Link href="/">الرئيسية</Link><Link href="/about">عن أنس</Link><Link href="/contact"><CircleHelp size={15} /> مساعدة</Link></div></div>
    <div className="registration-layout">
      <aside className="registration-aside">
        <div className="aside-card"><h3>ابدأ ببيانات بسيطة</h3>{['التسجيل مجاني', 'لا تحتاج إنشاء حساب', 'لا نطلب رقم بطاقة أو بيانات بنكية', 'لا ننشر بياناتك تلقائيًا'].map((line, i) => <div className="aside-line" key={line}><span>{['✳', '♙', '▤', '⬡'][i]}</span>{line}</div>)}</div>
        <div className="aside-card"><h3>كيف نسجل؟</h3>{['بياناتك وموقع النشاط', 'نوع النشاط وحالته', 'الاحتياجات واختيار التواصل', 'المراجعة والإرسال'].map((line, i) => <div className="aside-line" key={line}><span className="aside-step">{i + 1}</span>{line}</div>)}</div>
        <div className="aside-card help-card"><h3>تحتاج مساعدة؟</h3><p>يساعدك فريقنا في تسجيل نشاطك بموافقتك.</p><a className="button button-outline full-width" href="https://wa.me/201030609048" target="_blank" rel="noreferrer"><Phone size={16} /> تواصل عبر واتساب</a><strong>01030609048</strong></div>
      </aside>
      <section className="wizard-main">
        <div className="progress-head"><h1>سجّل نشاطك في أنس</h1><p>الخطوة {step} من ٤</p><div className="progress-track" aria-label={`الخطوة ${step} من 4`}>{['بياناتك', 'نشاطك', 'احتياجاتك', 'المراجعة'].map((label, i) => <div className={`progress-item ${step === i + 1 ? 'current' : step > i + 1 ? 'complete' : ''}`} key={label}><span>{step > i + 1 ? <Check size={16} /> : i + 1}</span><small>{label}</small></div>)}</div></div>
        {error && <div className="form-alert" role="alert" data-testid="text-validation-error">{error}</div>}
        {step === 1 && <div className="form-panel">
          <h2>بيانات صاحب النشاط وموقعه</h2><p className="panel-intro">الحقول بعلامة <b>*</b> مطلوبة.</p>
          <div className="field-grid">
            <Field label="اسم صاحب/صاحبة النشاط" required><input value={draft.name} onChange={(event) => set('name', event.target.value)} placeholder="اكتب اسمك" data-testid="input-owner-name" autoComplete="name" /></Field>
            <Field label="رقم الموبايل" required><input value={draft.phone} onChange={(event) => set('phone', event.target.value)} placeholder="01XXXXXXXXX" inputMode="tel" data-testid="input-phone" /></Field>
            <Field label="اسم الورشة أو المشروع — اختياري"><input value={draft.project} onChange={(e) => set('project', e.target.value)} placeholder="إن كان لنشاطك اسم" data-testid="input-project" /></Field>
            <Field label="المركز" required><select value={draft.center} onChange={(event) => set('center', event.target.value)} data-testid="select-center"><option value="">اختر المركز</option>{centers.map((center) => <option key={center}>{center}</option>)}</select></Field>
            <Field label="وصف موقع النشاط (القرية / الحي / العزبة)" required><input value={draft.location} onChange={(e) => set('location', e.target.value)} placeholder="اكتب القرية أو الحي الذي يقع فيه النشاط" data-testid="input-location" /></Field>
            <div className="field">
              <span id="activity-map-label">موقع النشاط على الخريطة<b> *</b></span>
              <button
                className={`location-picker-trigger ${coordinates ? 'selected' : ''}`}
                type="button"
                aria-labelledby="activity-map-label"
                aria-describedby="activity-location-note"
                onClick={() => { setPendingCoordinates(coordinates); setMapOpen(true); }}
                data-testid="button-pick-activity-location"
              >
                <MapPinned size={18} />
                {coordinates ? 'تم تحديد الموقع، اضغط لتعديله' : 'اختر موقع النشاط على الخريطة'}
              </button>
              {coordinates && <small className="map-coordinates" dir="ltr">{coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}</small>}
            </div>
            <Field label="أقرب علامة معروفة — اختياري"><input value={draft.landmark} onChange={(e) => set('landmark', e.target.value)} placeholder="مثال: بجوار الجمعية الزراعية" data-testid="input-landmark" /></Field>
          </div>
          <p className="field-note" id="activity-location-note">اختر موقع النشاط الأساسي، وليس مكان السكن إن كان مختلفًا.</p>
        </div>}
        {step === 2 && <div className="wizard-stack">
          <section className="form-panel"><h2>ماذا يقدم نشاطك؟</h2><p className="panel-intro">اختر فئة أساسية، ثم حدّد تخصصك.</p><Field label="فئة النشاط الأساسية" required><select value={draft.category} onChange={(e) => { set('category', e.target.value); set('specialties', []); }} data-testid="select-category"><option value="">اختر فئة النشاط</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></Field></section>
          {draft.category === 'نشاط آخر' ? <section className="form-panel"><h2>عرّفنا بنشاطك</h2><Field label="اسم المهمة أو نوع النشاط" required><input value={draft.project} onChange={(e) => set('project', e.target.value)} placeholder="خدمة محلية متخصصة" data-testid="input-other-name" /></Field><Field label="ماذا تقدم تحديدًا؟" required><textarea value={draft.extra} onChange={(e) => set('extra', e.target.value)} placeholder="اكتب وصفًا بسيطًا للخدمة أو المنتج" data-testid="input-other-description" /></Field></section> :
            <section className="form-panel"><h2>{draft.category ? `ما نوع ${draft.category} التي تقدمها؟` : 'ما نوع نشاطك؟'} <b>*</b></h2><p className="panel-intro">يمكنك اختيار أكثر من نوع تمارسه بالفعل.</p>{specialties.map((item) => <CheckOption key={item} label={item} checked={draft.specialties.includes(item)} onChange={() => toggle('specialties', item)} testId={`specialty-${specialties.indexOf(item)}`} />)}</section>}
          <section className="form-panel"><h2>حالة نشاطك الآن <b>*</b></h2>{['قائم طوال العام', 'موسمي أو حسب الطلب', 'متوقف مؤقتًا', 'لم أبدأ بعد'].map((item) => <RadioOption key={item} label={item} checked={draft.status === item} onChange={() => set('status', item)} testId={`status-${item}`} />)}</section>
          <section className="form-panel"><Field label="نشاط إضافي — اختياري"><input value={draft.extra} onChange={(e) => set('extra', e.target.value)} placeholder="مثال: ورش تعليم الفخار" data-testid="input-extra-activity" /></Field></section>
        </div>}
        {step === 3 && <div className="wizard-stack">
          <section className="form-panel"><h2>ما الذي يحتاجه نشاطك؟</h2><p className="panel-intro">شارك أهم أولوياتك لنفهم احتياجاتك بصورة أفضل.</p>{needsList.map((item) => <CheckOption key={item} label={item} checked={draft.needs.includes(item)} onChange={() => toggle('needs', item)} testId={`need-${needsList.indexOf(item)}`} />)}<CheckOption label="لا أحتاج دعمًا حاليًا" checked={draft.needs.includes('لا أحتاج دعمًا حاليًا')} onChange={() => toggle('needs', 'لا أحتاج دعمًا حاليًا')} testId="need-none" /></section>
          <section className="form-panel"><h2>هل سبق أن حصلت على دعم لهذا النشاط؟</h2>{['نعم', 'لا', 'غير متأكد'].map((item) => <RadioOption key={item} label={item} checked={draft.previousSupport === item} onChange={() => set('previousSupport', item)} testId={`support-${item}`} />)}</section>
          <section className="form-panel"><h2>هل ترغب في التواصل بشأن فرص مناسبة؟</h2><p className="panel-intro">اختر ما يناسبك. يمكنك المشاركة في الحصر فقط.</p>{['نعم، عبر واتساب', 'نعم، عبر مكالمة', 'أشارك في الحصر فقط'].map((item) => <RadioOption key={item} label={item} checked={draft.contactChoice === item} onChange={() => set('contactChoice', item)} testId={`contact-${item}`} />)}</section>
          <div className="privacy-hint"><ShieldCheck size={18} /><span>نستخدم إجاباتك لفهم الاحتياجات. التسجيل لا يضمن تمويلًا أو تدريبًا أو فرص عمل.</span></div>
        </div>}
        {step === 4 && <div className="wizard-stack">
          <div className="review-heading"><h2>راجع بياناتك قبل الإرسال</h2><p>تأكد من المعلومات التالية. يمكنك تعديل أي قسم قبل التسجيل.</p></div>
          <ReviewCard title="بياناتك وموقع النشاط" onEdit={() => setStep(1)} rows={[['اسم صاحب النشاط', draft.name], ['رقم الموبايل', draft.phone], ['اسم المشروع', draft.project || 'لم يضف'], ['المركز', draft.center], ['وصف موقع النشاط', draft.location], ['إحداثيات الموقع', coordinates ? `${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)}` : 'غير محدد'], ['أقرب علامة', draft.landmark || 'لم يضف']]} />
          <ReviewCard title="نشاطك" onEdit={() => setStep(2)} rows={[['الفئة الأساسية', draft.category], ['التخصص', draft.specialties.join('، ') || draft.project], ['حالة النشاط', draft.status], ['نشاط إضافي', draft.extra || 'لم يضف']]} />
          <ReviewCard title="احتياجاتك واختيار التواصل" onEdit={() => setStep(3)} rows={[['أهم الاحتياجات', draft.needs.join('، ')], ['الدعم السابق', draft.previousSupport], ['التواصل بشأن فرص مناسبة', draft.contactChoice]]} />
          <div className="consent-line"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} id="consent" data-testid="checkbox-consent" /><label htmlFor="consent">أؤكد أن البيانات التي أدخلتها صحيحة حسب علمي، وأوافق على استخدامها في الحصر وفق <button className="inline-link" onClick={() => window.dispatchEvent(new Event('open-privacy'))}>سياسة الخصوصية</button>.</label></div>
        </div>}
        <div className="wizard-actions">
          {step > 1 && <button className="button button-outline" onClick={back} data-testid="button-previous"><ArrowRight size={17} /> السابق</button>}
          {step < 4 ? <button className="button button-primary" onClick={next} data-testid="button-next">التالي <ArrowLeft size={17} /></button> : <button className="button button-primary" onClick={() => void submit()} disabled={!consent || isPending} data-testid="button-submit-registration">{isPending ? 'جارٍ إرسال التسجيل...' : 'أرسل التسجيل'} <ArrowLeft size={17} /></button>}
        </div>
        <p className="wizard-disclaimer">{step === 4 ? 'التسجيل لا يعني اعتمادًا أو ترخيصًا، ولا يضمن الحصول على دعم أو فرص عمل.' : 'أكمل الحقول المطلوبة للمتابعة.'}</p>
      </section>
    </div>
    {mapOpen && <Modal title="اختر موقع النشاط الأساسي" className="location-map-modal" onClose={() => setMapOpen(false)}>
      <LocationMapPicker
        initialPosition={pendingCoordinates}
        onConfirm={(selected) => { setCoordinates(selected); setMapOpen(false); }}
      />
    </Modal>}
    <footer className="registration-footer">مؤسسة أنس للتنمية البيئية والمجتمعية <Link href="#privacy" onClick={(e) => { e.preventDefault(); window.dispatchEvent(new Event('open-privacy')); }}>الخصوصية</Link></footer>
  </main>;
}

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return <label className="field"><span>{label}{required && <b> *</b>}</span>{children}</label>;
}
function CheckOption({ label, checked, onChange, testId }: { label: string; checked: boolean; onChange: () => void; testId: string }) {
  return <label className={`option-row ${checked ? 'selected' : ''}`}><span>{label}</span><input type="checkbox" checked={checked} onChange={onChange} data-testid={testId} /></label>;
}
function RadioOption({ label, checked, onChange, testId }: { label: string; checked: boolean; onChange: () => void; testId: string }) {
  return <label className={`option-row ${checked ? 'selected' : ''}`}><span>{label}</span><input type="radio" checked={checked} onChange={onChange} data-testid={testId} /></label>;
}
function ReviewCard({ title, rows, onEdit }: { title: string; rows: [string, string][]; onEdit: () => void }) {
  return <section className="review-card"><div className="review-card-head"><h3>{title}</h3><button className="inline-link" onClick={onEdit} data-testid={`button-edit-${title}`}>تعديل</button></div>{rows.map(([label, value]) => <div className="review-row" key={label}><span>{label}</span><strong>{value || 'لم يضف'}</strong></div>)}</section>;
}

export function ConfirmationPage() {
  const [entry, setEntry] = useState<RegistrationConfirmation | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  useEffect(() => {
    try {
      const value = sessionStorage.getItem('anas-last-entry');
      setEntry(value ? JSON.parse(value) as RegistrationConfirmation : null);
    } catch {
      setEntry(null);
    }
  }, []);
  const copy = async () => { if (!entry) return; try { await navigator.clipboard.writeText(entry.referenceNumber); } catch { /* clipboard unavailable */ } setCopied(true); window.setTimeout(() => setCopied(false), 1800); };
  const share = async () => {
    const text = `سجّلت نشاطي في أنس، رقم التسجيل ${entry?.referenceNumber}`;
    if (navigator.share) { try { await navigator.share({ title: 'التسجيل في أنس', text, url: window.location.origin }); } catch { /* user dismissed */ } }
    else setShareOpen(true);
  };
  if (!entry) return <main className="confirmation-shell" dir="rtl"><SiteHeader compact /><section className="confirmation-card"><h1>لم نعثر على تسجيل في هذه الجلسة</h1><Link href="/register" className="button button-primary">ابدأ التسجيل</Link></section></main>;
  return <main className="confirmation-shell" dir="rtl">
    <div className="confirmation-top"><Link href="/" className="wordmark">أنس<span className="brand-dot">.</span></Link><Link href="/contact"><CircleHelp size={17} /> مساعدة</Link></div>
    <section className="confirmation-intro"><div className="success-mark"><Check size={30} strokeWidth={3} /></div><h1>تم استلام تسجيل نشاطك</h1><p>شكرًا لمشاركتك في تسجيل أنشطة الفيوم.<br />سيُراجع فريق أنس بياناتك عند الحاجة.</p></section>
    <div className="confirmation-stack">
      <section className="confirmation-card reference-card"><div className="card-title"><FileText /><h2>رقم التسجيل المرجعي</h2></div><strong className="reference-number">{entry.referenceNumber}</strong><button className="button button-soft copy-button" onClick={copy} data-testid="button-copy-number"><Copy size={16} />{copied ? 'تم نسخ الرقم' : 'نسخ الرقم'}</button><small>احتفظ بهذا الرقم عند التواصل بشأن تسجيلك.</small></section>
      <section className="confirmation-card status-card"><div className="card-title"><span className="status-clock">◷</span><h2>حالة التسجيل</h2></div><span className="status-badge status-received">تم الاستلام</span><p>تم إرسال بياناتك بنجاح، وسيُراجعها فريق أنس عند الحاجة.</p></section>
      <section className="confirmation-card"><div className="card-title"><FileText /><h2>ماذا يحدث بعد ذلك؟</h2></div><ul className="next-list"><li>نراجع معلومات النشاط</li><li>نطلب استكمالًا عند الحاجة</li><li>النشر يحتاج مراجعة وموافقة منفصلة</li></ul></section>
      <section className="confirmation-card"><div className="card-title"><Phone /><h2>تحتاج تعديل بياناتك؟</h2></div><p>تواصل معنا واذكر رقم التسجيل المرجعي.</p><a href={`https://wa.me/201030609048?text=${encodeURIComponent(`مرحبًا، أريد تعديل بيانات التسجيل ${entry.referenceNumber}`)}`} target="_blank" rel="noreferrer" className="button button-outline full-width" data-testid="link-contact-edit"><Phone size={16} /> تواصل لتعديل البيانات</a><a className="whatsapp-number" href="https://wa.me/201030609048">01030609048</a><button className="inline-link privacy-link" onClick={() => window.dispatchEvent(new Event('open-privacy'))}>الخصوصية وطلب حذف البيانات</button></section>
      <section className="confirmation-card share-card"><div className="card-title"><Share2 /><h2>تعرف صاحب حرفة أو مهنة أو خدمة؟</h2></div><p>شارك معه دعوة التسجيل في أنس.</p><button className="button button-primary full-width" onClick={() => void share()} data-testid="button-share-registration"><Share2 size={18} /> شارك دعوة التسجيل</button></section>
    </div>
    <Link href="/" className="return-home">العودة للرئيسية</Link>
    <footer className="registration-footer">مؤسسة أنس للتنمية البيئية والمجتمعية</footer>
    {shareOpen && <Modal title="مشاركة دعوة التسجيل" onClose={() => setShareOpen(false)}><p>سجّل نشاطك المحلي في أنس. رقم التسجيل: {entry.referenceNumber}</p><button className="button button-primary full-width" onClick={() => { void navigator.clipboard?.writeText(`${window.location.origin}/register`); setShareOpen(false); }}>نسخ رابط الدعوة</button></Modal>}
  </main>;
}
