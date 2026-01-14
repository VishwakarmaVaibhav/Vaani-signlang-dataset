"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Loader from "./Loader";
import BackgroundGraffiti from "./BackgroundGraffiti";

const translations = {
  en: {
    joinResearch: "Join the Research",
    fillDetails: "Please fill in your details to get started.",
    fullName: "Full Name",
    namePlaceholder: "e.g. Vaibhav Vishwakarma",
    emailAddress: "Email Address",
    emailPlaceholder: "name@example.com",
    ageGroup: "Age Group",
    skip: "Skip",
    emailAddress: "Email Address",
    required: "(Required)",
    selectAge: "Select your age range",
    consent: "I agree to share my gesture images for research purposes. I understand my data will be anonymized.",
    saveContinue: "Save & Continue →",
    stayBtn: "I'll Stay & Contibute",
    leaveBtn: "Leave Anyway",
    waitTitle: "Wait! Don't go...",
    waitText: "We need contributors like you to build this dataset. Are you sure you want to cancel?",
    submitting: "Creating your profile..."
  },
  hi: {
    joinResearch: "अनुसंधान से जुड़ें",
    fillDetails: "शुरू करने के लिए कृपया अपनी जानकारी भरें।",
    fullName: "पूरा नाम",
    namePlaceholder: "जैसे: वैभव विश्वकर्मा",
    emailAddress: "ईमेल पता",
    emailPlaceholder: "name@example.com",
    ageGroup: "आयु वर्ग",
    skip: "छोड़ें",
    required: "(आवश्यक)",
    selectAge: "अपनी आयु सीमा चुनें",
    consent: "मैं अनुसंधान उद्देश्यों के लिए अपनी जेस्चर छवियाँ साझा करने के लिए सहमत हूँ। मैं समझता/समझती हूँ कि मेरा डेटा गुमनाम रखा जाएगा।",
    saveContinue: "सहेजें और आगे बढ़ें →",
    stayBtn: "मैं रुकूंगा/रुकूंगी और योगदान दूंगा/दूंगी",
    leaveBtn: "फिर भी छोड़ें",
    waitTitle: "रुकिए! जाने से पहले...",
    waitText: "इस डेटा सेट को बनाने के लिए हमें आपके जैसे योगदानकर्ताओं की ज़रूरत है। क्या आप वाकई रद्द करना चाहते हैं?",
    submitting: "आपकी प्रोफ़ाइल बनाई जा रही है..."
  },
  mr: {
    joinResearch: "संशोधनात सहभागी व्हा",
    fillDetails: "सुरुवात करण्यासाठी कृपया आपली माहिती भरा.",
    fullName: "पूर्ण नाव",
    namePlaceholder: "उदा. वैभव विश्वकर्मा",
    emailAddress: "ईमेल पत्ता",
    emailPlaceholder: "name@example.com",
    ageGroup: "वयोगट",
    skip: "वगळा",
    required: "(आवश्यक)",
    selectAge: "आपली वयोमर्यादा निवडा",
    consent: "संशोधनासाठी माझ्या जेस्चर प्रतिमा शेअर करण्यास मी सहमत आहे. माझा डेटा अज्ञात स्वरूपात ठेवला जाईल याची मला जाणीव आहे.",
    saveContinue: "जतन करा आणि पुढे जा →",
    stayBtn: "मी थांबतो आणि योगदान देतो",
    leaveBtn: "तरीही सोडा",
    waitTitle: "थांबा! जाऊ नका...",
    waitText: "हा डेटासेट तयार करण्यासाठी तुमच्यासारख्या योगदानकर्त्यांची आम्हाला गरज आहे. तुम्हाला खरंच रद्द करायचं आहे का?",
    submitting: "तुमची प्रोफाइल तयार केली जात आहे..."
  }
  
};



export default function WizardForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState("en");
  const [showExitModal, setShowExitModal] = useState(false);
  
  const [data, setData] = useState({
    name: "",
    email: "",
    age: "",
    consent: false,
  });

  useEffect(() => {
    setLang(localStorage.getItem("lang") || "en");
  }, []);

  const t = translations[lang] || translations.en;
  const update = (field, value) => setData({ ...data, [field]: value });

  const handleSkipEmail = () => {
    update("email", "anonymous@research.io");
  };

  const submitUser = async () => {
    if (!data.consent) return alert("Please provide consent to continue.");
    
    // Basic Email Validation before submitting
    if (data.email !== "anonymous@research.io" && !data.email.includes("@")) {
      return alert("Please enter a valid email address.");
    }

    setLoading(true);
    try {
      const res = await fetch("/api/submitUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      
      const out = await res.json();
      if (out.success) {
        localStorage.setItem("USER_ID", out.user.id);
        document.cookie = `USER_ID=${out.user.id}; path=/; max-age=86400; SameSite=Lax`;
        router.push("/upload");
      } else {
        alert("Submission failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 pt-24 pb-12 bg-[var(--bg)]">

      <BackgroundGraffiti />
      
      <AnimatePresence>
        {loading && <Loader message={t.submitting} />}
      </AnimatePresence>

      <AnimatePresence>
        {showExitModal && (
          <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-[var(--card)] p-8 rounded-[2.5rem] max-w-sm text-center shadow-2xl border border-[var(--border)]"
            >
              <div className="text-5xl mb-4 text-pink-500">🥺</div>
              <h3 className="text-2xl font-black mb-2 text-[var(--text)] tracking-tight">{t.waitTitle}</h3>
              <p className="text-gray-500 text-sm mb-8 leading-relaxed">{t.waitText}</p>
              <div className="flex flex-col gap-3">
                <button onClick={() => setShowExitModal(false)} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg">
                  {t.stayBtn}
                </button>
                <button onClick={() => router.push("/")} className="w-full py-2 text-gray-400 text-xs font-semibold hover:text-red-500 transition-colors">
                  {t.leaveBtn}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full p-6 sm:p-8 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-2xl"
      >
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mb-2">
            {t.joinResearch}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">{t.fillDetails}</p>
        </div>

        <div className="space-y-6">
          {/* NAME FIELD */}
          <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-2">
            <label className="text-sm font-semibold text-[var(--text)]">{t.fullName}</label>
            <input
              autoFocus
              placeholder={t.namePlaceholder}
              value={data.name}
              className="w-full p-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              onChange={(e) => update("name", e.target.value)}
            />
          </motion.div>

          {/* EMAIL FIELD - Logic Changed here: data.name.length > 0 */}
          <AnimatePresence>
            {data.name.length > 0 && (
              <motion.div 
                variants={fadeIn} 
                initial="hidden" 
                animate="visible" 
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-[var(--text)]">{t.emailAddress}</label>
                  <button 
                    onClick={handleSkipEmail}
                    className="text-xs font-bold text-blue-500 hover:text-blue-600 bg-blue-500/10 px-3 py-1 rounded-full transition-colors"
                  >
                    {t.skip} ➔
                  </button>
                </div>
                <input
                  type="email"
                  placeholder={t.emailPlaceholder}
                  value={data.email === "anonymous@research.io" ? "" : data.email}
                  disabled={data.email === "anonymous@research.io"}
                  className={`w-full p-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] focus:ring-2 focus:ring-blue-500 outline-none transition-all ${data.email === "anonymous@research.io" ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                  onChange={(e) => update("email", e.target.value)}
                />
                {data.email === "anonymous@research.io" && (
                  <p className="text-[10px] text-blue-500 font-medium ml-1">Continuing anonymously...</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* AGE FIELD - Logic Changed here: data.email.length > 0 */}
          <AnimatePresence>
            {data.email.length > 0 && (
              <motion.div 
                variants={fadeIn} 
                initial="hidden" 
                animate="visible"
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <label className="text-sm font-semibold text-[var(--text)]">
                  {t.ageGroup} <span className="text-gray-400 font-normal">{t.required}</span>
                </label>
                <select
                  value={data.age}
                  className="w-full p-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
                  onChange={(e) => update("age", e.target.value)}
                >
                  <option value="">{t.selectAge}</option>
                  <option value="13-17">13-17</option>
                  <option value="18-24">18-24</option>
                  <option value="25+">25+</option>
                </select>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CONSENT - Logic kept same (dependent on selection, not typing) */}
          <AnimatePresence>
            {data.age !== "" && (
              <motion.div 
                variants={fadeIn} 
                initial="hidden" 
                animate="visible"
                exit={{ opacity: 0, height: 0 }}
                className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800"
              >
                <label className="flex items-start gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={data.consent}
                    className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    onChange={(e) => update("consent", e.target.checked)} 
                  />
                  <span className="text-sm text-blue-800 dark:text-blue-200">
                    {t.consent}
                  </span>
                </label>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SUBMIT BUTTON */}
          <AnimatePresence>
            {data.consent && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                onClick={submitUser}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold shadow-lg shadow-blue-500/30 disabled:opacity-50 transition-all flex justify-center items-center gap-2"
              >
                {loading ? (
                  <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5"></span>
                ) : (
                  t.saveContinue
                )}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}