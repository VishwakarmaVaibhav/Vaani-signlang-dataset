"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- 1. CUSTOM SVG ICONS ---
// These are designed to look great inside your gradient bubbles

const ScanIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-white" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7V5a2 2 0 012-2h2m10 0h2a2 2 0 012 2v2m0 10v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16a4 4 0 100-8 4 4 0 000 8z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12v3m0-6v.01" />
  </svg>
);

const BrainIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-white" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const SoundWaveIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-white" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
  </svg>
);

// Map icons to the steps by index
const stepIcons = [
  <ScanIcon key="scan" />,
  <BrainIcon key="brain" />,
  <SoundWaveIcon key="sound" />
];

const translations = {
  en: {
    heading: "The Magic Behind Your Photo",
    subheading: "You aren't just taking a picture. You are teaching a machine to see.",
    steps: [
      { title: "You Capture", desc: "It takes you 5 seconds to show a sign.", color: "from-blue-400 to-blue-600" },
      { title: "Vaani Learns", desc: "Our AI analyzes your hand structure.", color: "from-purple-400 to-purple-600" },
      { title: "World Speaks", desc: "An app is born that speaks for the deaf.", color: "from-green-400 to-green-600" }
    ],
    faqTitle: "Curious Minds Ask...",
    faqs: [
      { q: "Why do you need my photos?", a: "AI needs examples to learn. Just like a child needs to see a 'Cat' 100 times to recognize it, our AI needs thousands of hand images to recognize Sign Language accurately." },
      { q: "Is my data safe & private?", a: "Absolutely. We are open-source. We strictly strip all metadata. We only care about your hand coordinates, not your identity. Your face is never the focus of our dataset." },
      { q: "What is the end goal?", a: "To create a 'Google Translate' for the Deaf community. Imagine a world where they sign to a phone, and it speaks out loud to you instantly." },
      { q: "Why isn't this already solved?", a: "Because of a lack of data. There are huge datasets for English or Hindi text, but very few high-quality datasets for Indian Sign Language (ISL). You are fixing that gap." },
      { q: "Who is building this?", a: "This is a community-driven research project (Vaani Labs). We are developers, researchers, and citizens building public digital infrastructure for India." },
      { q: "Can I contribute more words?", a: "Yes! The more diversity (lighting, skin tone, angles) you provide, the smarter the AI gets. You are welcome to contribute as many words as you like." }
    ]
  },
  hi: {
    heading: "आपकी एक फोटो का जादू",
    subheading: "आप सिर्फ फोटो नहीं ले रहे। आप एक मशीन को 'देखना' सिखा रहे हैं।",
    steps: [
      { title: "आपकी फोटो", desc: "आपको एक इशारा करने में सिर्फ 5 सेकंड लगते हैं।", color: "from-blue-400 to-blue-600" },
      { title: "वाणी की सीख", desc: "हमारा AI आपके हाथ की बनावट को समझता है।", color: "from-purple-400 to-purple-600" },
      { title: "दुनिया बोलेगी", desc: "एक ऐसा ऐप बनेगा जो उनकी आवाज़ बनेगा।", color: "from-green-400 to-green-600" },
    ],
    faqTitle: "अक्सर पूछे जाने वाले सवाल...",
    faqs: [
      { q: "आपको मेरी तस्वीरों की आवश्यकता क्यों है?", a: "AI को सीखने के लिए उदाहरण चाहिए। जैसे एक बच्चे को 'बिल्ली' पहचानने के लिए उसे 100 बार देखना पड़ता है, वैसे ही हमारे AI को सांकेतिक भाषा सीखने के लिए हजारों हाथों की तस्वीरों की जरूरत है." },
      { q: "क्या मेरा डेटा सुरक्षित है?", a: "बिल्कुल। हम केवल आपके हाथों के निर्देशांक (Coordinates) में रुचि रखते हैं, आपकी पहचान में नहीं। यह डेटा पूरी तरह से ओपन-सोर्स और सुरक्षित है।" },
      { q: "इसका अंतिम लक्ष्य क्या है?", a: "सांकेतिक भाषा के लिए 'गूगल ट्रांसलेट' बनाना। एक ऐसी दुनिया जहाँ मूक-बधिर लोग फोन पर इशारा करें, और फोन उसे बोलकर सुना दे।" },
      { q: "यह समस्या पहले हल क्यों नहीं हुई?", a: "डेटा की कमी के कारण। अंग्रेजी या हिंदी टेक्स्ट के लिए बहुत डेटा है, लेकिन भारतीय सांकेतिक भाषा (ISL) के लिए बहुत कम। आप उस कमी को पूरा कर रहे हैं।" },
      { q: "इसे कौन बना रहा है?", a: "यह एक सामुदायिक प्रोजेक्ट (Vaani Labs) है। हम डेवलपर्स और शोधकर्ता हैं जो भारत के लिए डिजिटल इंफ्रास्ट्रक्चर बना रहे हैं।" },
      { q: "क्या मैं और शब्द जोड़ सकता हूँ?", a: "हाँ! जितनी अधिक विविधता (रोशनी, त्वचा का रंग) होगी, AI उतना ही होशियार बनेगा। आप जितने चाहें उतने शब्दों का योगदान कर सकते हैं।" }
    ]
  },
  mr: {
    heading: "तुमच्या एका फोटोची जादू",
    subheading: "तुम्ही फक्त फोटो काढत नाही आहात. तुम्ही एका मशीनला 'पाहायला' शिकवत आहात.",
    steps: [
      { title: "तुमचा फोटो", desc: "तुम्हाला एक खूण करण्यासाठी फक्त ५ सेकंद लागतात.", color: "from-blue-400 to-blue-600" },
      { title: "वाणी शिकते", desc: "आमचे AI तुमच्या हाताची रचना समजून घेते.", color: "from-purple-400 to-purple-600" },
      { title: "जग बोलेल", desc: "असे ॲप तयार होईल जे मुक्यांचा आवाज बनेल.", color: "from-green-400 to-green-600" },
    ],
    faqTitle: "नेहमी विचारले जाणारे प्रश्न...",
    faqs: [
      { q: "तुम्हाला माझ्या फोटोंची गरज का आहे?", a: "AI ला शिकण्यासाठी उदाहरणे लागतात. जसे लहान मुलाला 'मांजर' ओळखण्यासाठी ती अनेकदा पाहावी लागते, तसेच आमच्या AI ला सांकेतिक भाषा शिकण्यासाठी हजारो हातांच्या फोटोंची गरज आहे." },
      { q: "माझा डेटा सुरक्षित आहे का?", a: "नक्कीच. आम्हाला फक्त तुमच्या हातांच्या हालचालींमध्ये रस आहे, तुमच्या ओळखीत नाही. तुमचा चेहरा आमच्यासाठी महत्त्वाचा नाही." },
      { q: "याचे मुख्य ध्येय काय आहे?", a: "सांकेतिक भाषेसाठी 'गुगल ट्रान्सलेट' बनवणे. अशा जगाची कल्पना करा जिथे कर्णबधिर व्यक्ती फोनवर खूण करेल आणि फोन ते शब्द बोलून दाखवेल." },
      { q: "ही समस्या आधी का सुटली नाही?", a: "डेटाच्या कमतरतेमुळे. इंग्रजी किंवा हिंदी मजकुरासाठी खूप डेटा आहे, पण भारतीय सांकेतिक भाषेसाठी (ISL) खूप कमी. तुम्ही ती कमतरता भरून काढत आहात." },
      { q: "हे कोण बनवत आहे?", a: "हा एक कम्युनिटी प्रोजेक्ट (Vaani Labs) आहे. आम्ही डेव्हलपर्स आणि संशोधक आहोत जे भारतासाठी डिजिटल सुविधा बनवत आहोत." },
      { q: "मी आणखी शब्दांचे योगदान देऊ शकतो का?", a: "हो! जेवढी जास्त विविधता (प्रकाश, हाताचा रंग) असेल, तेवढे AI हुशार होईल. तुम्ही तुम्हाला हवे तेवढे शब्द जोडू शकता." }
    ]
  }
};

const FAQItem = ({ item, isOpen, onClick }) => {
  return (
    <motion.div 
      initial={false}
      className={`border border-[var(--border)] rounded-2xl overflow-hidden bg-[var(--card)] transition-colors duration-300 ${isOpen ? 'border-[var(--primary)]' : 'hover:border-gray-400'}`}
    >
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
      >
        <span className={`font-bold text-lg md:text-xl pr-4 ${isOpen ? 'text-[var(--primary)]' : 'text-[var(--text)]'}`}>
          {item.q}
        </span>
        <div className={`p-2 rounded-full transition-colors flex-shrink-0 ${isOpen ? 'bg-[var(--primary)] text-white' : 'bg-[var(--bg)] text-[var(--text)]'}`}>
          <motion.svg 
            animate={{ rotate: isOpen ? 180 : 0 }}
            className="w-5 h-5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </motion.svg>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="p-5 pt-0 text-[var(--text)] opacity-70 leading-relaxed font-medium">
              {item.a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function AboutSection() {
  const [lang, setLang] = useState("en");
  const [openIndex, setOpenIndex] = useState(0);

  useEffect(() => {
    setLang(localStorage.getItem("lang") || "en");
    const handleStorage = () => setLang(localStorage.getItem("lang") || "en");
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const t = translations[lang] || translations.en;

  return (
    <section className="relative w-full py-24 px-4 overflow-hidden bg-[var(--bg)]">
      
      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
        <div className="w-[600px] h-[600px] bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-full blur-[120px] animate-pulse-slow" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-black mb-6 text-[var(--text)] leading-tight">
            {t.heading}
          </h2>
          <p className="text-xl md:text-2xl text-[var(--text)] opacity-60 font-medium max-w-3xl mx-auto">
            {t.subheading}
          </p>
        </motion.div>

        {/* STEPS PIPELINE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative mb-24">
          <div className="hidden md:block absolute top-1/3 left-0 w-full h-2 bg-[var(--border)] -z-10 rounded-full">
            <motion.div 
              initial={{ width: "0%" }}
              whileInView={{ width: "100%" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-full"
            />
          </div>

          {t.steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="relative"
            >
              <div className="bg-[var(--card)] border border-[var(--border)] p-8 rounded-[2.5rem] shadow-xl flex flex-col items-center text-center h-full hover:-translate-y-2 transition-transform duration-300">
                {/* ICON BUBBLE - Mapped from stepIcons array */}
                <div className={`w-20 h-20 mb-6 rounded-3xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg relative overflow-hidden`}>
                  {/* Subtle shine effect inside the icon box */}
                  <div className="absolute inset-0 bg-white/20 translate-y-full skew-y-12 hover:translate-y-0 transition-transform duration-500" />
                  
                  <motion.div 
                    animate={{ y: [0, -4, 0] }} 
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    className="relative z-10"
                  >
                    {stepIcons[i]}
                  </motion.div>
                </div>

                <h3 className="text-2xl font-black mb-2 text-[var(--text)]">{step.title}</h3>
                <p className="text-[var(--text)] opacity-70 font-medium">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* FAQ SECTION */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="h-[2px] flex-1 bg-[var(--border)]" />
            <h3 className="text-2xl md:text-3xl font-black text-[var(--text)] uppercase tracking-wider text-center">
              {t.faqTitle}
            </h3>
            <div className="h-[2px] flex-1 bg-[var(--border)]" />
          </div>

          <div className="space-y-4">
            {t.faqs.map((item, index) => (
              <FAQItem 
                key={index} 
                item={item} 
                isOpen={openIndex === index} 
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)} 
              />
            ))}
          </div>

        </motion.div>

      </div>
    </section>
  );
}