import { PDFBundle, Question } from '../types';

// Curated authentic questions for the PDF packages
export const EXPECTED_QUESTIONS_SAMPLE: Question[] = [
  {
    id: 'pdf-q-1',
    section: 'quant',
    questionNumber: 1,
    topic: 'Algebra (Symmetric Formula)',
    difficulty: 'Moderate',
    textEn: 'If x + (1/x) = 5, find the value of (x⁴ + 1/x²) / (x² - 3x + 1).',
    textHi: 'यदि x + (1/x) = 5 है, तो (x⁴ + 1/x²) / (x² - 3x + 1) का मान ज्ञात कीजिए।',
    optionsEn: ['55', '50', '65', '110'],
    optionsHi: ['55', '50', '65', '110'],
    correctOption: 0,
    explanationEn: 'Divide both numerator and denominator by x:\nNumerator: (x⁴ + 1/x²)/x = x³ + 1/x³\nDenominator: (x² - 3x + 1)/x = x - 3 + 1/x = (x + 1/x) - 3 = 5 - 3 = 2.\nWe know: x³ + 1/x³ = k³ - 3k = 5³ - 3(5) = 125 - 15 = 110.\nResult = 110 / 2 = 55.',
    explanationHi: 'अंश और हर दोनों को x से भाग देने पर:\nअंश = x³ + 1/x³\nहर = (x + 1/x) - 3 = 5 - 3 = 2\nx³ + 1/x³ = 5³ - 3(5) = 110\nउत्तर = 110 / 2 = 55।'
  },
  {
    id: 'pdf-q-2',
    section: 'quant',
    questionNumber: 2,
    topic: 'Compound Interest (3-Year Difference)',
    difficulty: 'Moderate',
    textEn: 'The difference between compound interest and simple interest on a certain sum of money for 3 years at 10% per annum is ₹155. Find the sum (Principal).',
    textHi: 'किसी धनराशि पर 10% वार्षिक दर से 3 वर्ष के चक्रवृद्धि ब्याज और साधारण ब्याज का अंतर ₹155 है। वह मूलधन ज्ञात कीजिए।',
    optionsEn: ['₹5,000', '₹4,500', '₹6,000', '₹5,500'],
    optionsHi: ['₹5,000', '₹4,500', '₹6,000', '₹5,500'],
    correctOption: 0,
    explanationEn: 'Standard TCS 3-year CI - SI Shortcut:\nDiff = P × (R/100)² × [(300 + R) / 100]\n155 = P × (10/100)² × (310/100)\n155 = P × (1/100) × (31/10)\n155 = P × 31 / 1000\nP = (155 × 1000) / 31 = 5 × 1000 = ₹5,000.',
    explanationHi: 'शॉर्टकट सूत्र:\nअंतर = P × (R/100)² × (300 + R)/100\n155 = P × (1/100) × (310/100) = P × 31/1000\nP = 155 × 1000 / 31 = ₹5,000।'
  },
  {
    id: 'pdf-q-3',
    section: 'ga',
    questionNumber: 3,
    topic: 'Indian Polity (Constitutional Articles)',
    difficulty: 'Easy',
    textEn: 'Which Article of the Indian Constitution empowers the High Courts to issue writs for the enforcement of Fundamental Rights and other legal rights?',
    textHi: 'भारतीय संविधान का कौन सा अनुच्छेद उच्च न्यायालयों (High Courts) को मौलिक अधिकारों और अन्य कानूनी अधिकारों के प्रवर्तन के लिए रिट जारी करने का अधिकार देता है?',
    optionsEn: ['Article 32', 'Article 226', 'Article 143', 'Article 136'],
    optionsHi: ['अनुच्छेद 32', 'अनुच्छेद 226', 'अनुच्छेद 143', 'अनुच्छेद 136'],
    correctOption: 1,
    explanationEn: 'Article 226 gives writ jurisdiction to High Courts (broader scope: fundamental rights + any legal right). Article 32 gives writ powers strictly to the Supreme Court.',
    explanationHi: 'अनुच्छेद 226 उच्च न्यायालय को रिट जारी करने का अधिकार प्रदान करता है। अनुच्छेद 32 के तहत सर्वोच्च न्यायालय (Supreme Court) रिट जारी करता है।'
  },
  {
    id: 'pdf-q-4',
    section: 'ga',
    questionNumber: 4,
    topic: 'Art & Culture (Classical Dances)',
    difficulty: 'Moderate',
    textEn: 'Padma Bhushan awardee Guru Vempati Chinna Satyam is synonymous with the revival and propagation of which Indian classical dance form?',
    textHi: 'पद्म भूषण से सम्मानित गुरु वेम्पति चिन्ना सत्यम किस भारतीय शास्त्रीय नृत्य शैली के पुनरुद्धार और प्रचार-प्रसार के लिए प्रसिद्ध हैं?',
    optionsEn: ['Kathakali', 'Kuchipudi', 'Mohiniyattam', 'Sattriya'],
    optionsHi: ['कथकली', 'कुचिपुड़ी', 'मोहिनीअट्टम', 'सत्रिया'],
    correctOption: 1,
    explanationEn: 'Guru Vempati Chinna Satyam is renowned for modernizing and standardizing Kuchipudi (originating from Andhra Pradesh).',
    explanationHi: 'गुरु वेम्पति चिन्ना सत्यम आंध्र प्रदेश के शास्त्रीय नृत्य "कुचिपुड़ी" के विख्यात गुरु थे।'
  },
  {
    id: 'pdf-q-5',
    section: 'reasoning',
    questionNumber: 5,
    topic: 'Coding-Decoding (Opposite Letter Shift)',
    difficulty: 'Easy',
    textEn: 'In a certain code language, if "FLOWER" is written as "UOLDVI", how will "GARDEN" be written in that language?',
    textHi: 'एक निश्चित कूट भाषा में, यदि "FLOWER" को "UOLDVI" लिखा जाता है, तो उसी कूट भाषा में "GARDEN" को कैसे लिखा जाएगा?',
    optionsEn: ['TZIWVM', 'TZJVWN', 'TYIWVM', 'SZIVVM'],
    optionsHi: ['TZIWVM', 'TZJVWN', 'TYIWVM', 'SZIVVM'],
    correctOption: 0,
    explanationEn: 'Pattern is direct Alphabetical Opposite Pairs (Sum of positional values = 27):\nF ↔ U, L ↔ O, O ↔ L, W ↔ D, E ↔ V, R ↔ I.\nFor GARDEN:\nG ↔ T, A ↔ Z, R ↔ I, D ↔ W, E ↔ V, N ↔ M → TZIWVM.',
    explanationHi: 'यह विपरीत अक्षरों (Opposite letters, योग 27) का पैटर्न है:\nG का विपरीत T, A का Z, R का I, D का W, E का V, N का M → TZIWVM।'
  },
  {
    id: 'pdf-q-6',
    section: 'english',
    questionNumber: 6,
    topic: 'One Word Substitution',
    difficulty: 'Easy',
    textEn: 'Select the option that can be used as a one-word substitute for the given phrase:\n"A person who compiles a dictionary"',
    textHi: 'दिए गए वाक्यांश के लिए एक शब्द का चयन कीजिए:\n"शब्दकोश (Dictionary) संकलित करने वाला व्यक्ति"',
    optionsEn: ['Calligrapher', 'Lexicographer', 'Cartographer', 'Philatelist'],
    optionsHi: ['कैलीग्राफर (सुलेखक)', 'लेक्सिकोग्राफर (कोशकार)', 'कार्टोग्राफर (मानचित्रकार)', 'फिलाटेलिस्ट (डाक टिकट संग्राहक)'],
    correctOption: 1,
    explanationEn: 'Lexicographer = compiler of dictionaries. Calligrapher = artistic handwriting; Cartographer = map maker; Philatelist = stamp collector.',
    explanationHi: 'शब्दकोश संकलित करने वाले को "Lexicographer" कहा जाता है।'
  },
  {
    id: 'pdf-q-7',
    section: 'english',
    questionNumber: 7,
    topic: 'Grammar (Conditional Clause)',
    difficulty: 'Moderate',
    textEn: 'Identify the segment in the sentence that contains a grammatical error:\n"If he will study diligently, he will definitely secure a top rank in SSC CHSL."',
    textHi: 'वाक्य के उस भाग की पहचान कीजिए जिसमें व्याकरण संबंधी त्रुटि है:\n"If he will study diligently, he will definitely secure a top rank in SSC CHSL."',
    optionsEn: ['If he will study', 'diligently, he will', 'definitely secure a top rank', 'in SSC CHSL'],
    optionsHi: ['If he will study', 'diligently, he will', 'definitely secure a top rank', 'in SSC CHSL'],
    correctOption: 0,
    explanationEn: 'Golden Grammar Rule: In conditional sentences referring to the future, the "If-clause" must be in Simple Present Tense, not Simple Future. "If he will study" should be "If he studies".',
    explanationHi: 'गोल्डन ग्रामर नियम: भविष्य के कंडीशनल वाक्यों में "If" वाले क्लॉज में will का प्रयोग नहीं होता; Present Simple (If he studies) का प्रयोग होता है।'
  }
];

export const PDF_BUNDLES_DATABASE: PDFBundle[] = [
  {
    id: 'pdf-expected-500',
    title: 'SSC CHSL 2025-26: Most Expected 500 Questions (TCS Brahmastra)',
    hindiTitle: 'एसएससी सीएचएसएल 2025-26: सबसे संभावित 500 प्रश्न (TCS ब्रह्मास्त्र)',
    taglineEn: 'Curated by Top Rankers • 100% Verified TCS Solutions • Bilingual',
    taglineHi: 'टॉपर्स द्वारा चयनित • 100% प्रामाणिक टीसीएस हल व शॉर्टकट • द्विभाषी',
    category: 'expected',
    price: 49,
    originalPrice: 199,
    pageCount: 128,
    totalQuestions: 500,
    fileSizeMb: '4.8 MB',
    rating: 4.9,
    totalRatings: 1840,
    downloadsCount: 14200,
    isBestseller: true,
    isHot: true,
    descriptionEn: 'The definitive exam-ready master PDF covering all 4 sections with high-probability questions predicted based on the latest 2024 TCS CHSL, CGL, and CPO shifts.',
    descriptionHi: '2024-2025 की सभी टीसीएस परीक्षाओं के नवीनतम ट्रेंड पर आधारित 500 सबसे महत्वपूर्ण प्रश्न। संपूर्ण व्याख्या, स्मार्ट ट्रिक्स और फॉर्मूला शीट के साथ तुरंत प्रिंट या सेव करें।',
    highlightsEn: [
      '500 Highly Expected Questions with Step-by-Step Short Tricks',
      'Covers Reasoning, Quant, General Awareness, and English',
      'TCS Repeated Models highlighted with difficulty indicators',
      'Print-Ready A4 Format with clear fonts & answer keys',
      'Instant Download & Offline Reading Access'
    ],
    highlightsHi: [
      '500 अति संभावित प्रश्न शॉर्टकट व ट्रिक्स के साथ',
      'रीजनिंग, क्वांट, सामान्य ज्ञान एवं इंग्लिश का संपूर्ण कवरेज',
      'टीसीएस के सबसे ज्यादा रिपीट होने वाले पैटर्न स्पष्ट रूप से चिन्हित',
      'प्रिंट-फ्रेंडली A4 लेआउट एवं त्वरित डाउनलोड सुविधा',
      'ऑफलाइन अध्ययन व परीक्षा पूर्व रिवीज़न के लिए सर्वोत्तम'
    ],
    sections: [
      {
        titleEn: 'Quantitative Aptitude Expected Models',
        titleHi: 'क्वांटिटेटिव एप्टीट्यूड (गणित) संभावित प्रश्न',
        subheadingEn: 'Repeated Algebra, Geometry, Arithmetic & CI/SI formulas',
        subheadingHi: 'अलजेब्रा, ज्यामिति, अंकगणित एवं चक्रवृद्धि ब्याज ट्रिक्स',
        keyFormulasOrTricksEn: [
          'If x + 1/x = k, then x² + 1/x² = k² - 2 and x³ + 1/x³ = k³ - 3k',
          '3-Year CI - SI Difference = P × (R/100)² × (300 + R)/100',
          'Successive Discount: a + b - (ab/100)',
          'Right Triangle Inradius r = (P + B - H) / 2'
        ],
        keyFormulasOrTricksHi: [
          'यदि x + 1/x = k है, तो x² + 1/x² = k² - 2 एवं x³ + 1/x³ = k³ - 3k',
          '3 वर्ष का CI - SI अंतर = P × (R/100)² × (300 + R)/100',
          'क्रमागत छूट (Successive Discount) = a + b - (ab/100)',
          'समकोण त्रिभुज की अंतःत्रिज्या r = (लम्ब + आधार - कर्ण) / 2'
        ],
        questions: [EXPECTED_QUESTIONS_SAMPLE[0], EXPECTED_QUESTIONS_SAMPLE[1]]
      },
      {
        titleEn: 'General Awareness High-Yield Capsule',
        titleHi: 'सामान्य ज्ञान (GA) उच्च-वेटेज कैप्सूल',
        subheadingEn: 'Articles, Folk Dances, Census 2011, Modern History & Science',
        subheadingHi: 'संविधान अनुच्छेद, लोक नृत्य, जनगणना 2011 एवं आधुनिक इतिहास',
        keyFormulasOrTricksEn: [
          'Writs: Supreme Court = Art 32, High Courts = Art 226',
          'Panchayati Raj Constitutional Amendment = 73rd Amendment Act 1992',
          'Highest Literacy State (Census 2011) = Kerala (94%), Lowest = Bihar (61.8%)',
          'Classical Dances of India = 8 recognized dances under Sangeet Natak Akademi'
        ],
        keyFormulasOrTricksHi: [
          'रिट अधिकारिता: सुप्रीम कोर्ट = अनुच्छेद 32, हाई कोर्ट = अनुच्छेद 226',
          'पंचायती राज संवैधानिक संशोधन = 73वां संविधान संशोधन 1992',
          'सर्वाधिक साक्षरता (2011) = केरल (94%), न्यूनतम = बिहार (61.8%)',
          'भारत के मान्यता प्राप्त 8 शास्त्रीय नृत्य संगीत नाटक अकादमी के अंतर्गत'
        ],
        questions: [EXPECTED_QUESTIONS_SAMPLE[2], EXPECTED_QUESTIONS_SAMPLE[3]]
      },
      {
        titleEn: 'Reasoning & English Language High Score Drill',
        titleHi: 'रीजनिंग एवं इंग्लिश लैंग्वेज स्कोर बूस्टर',
        subheadingEn: 'Number Series, Syllogisms, Vocabulary & 120 Grammar Rules',
        subheadingHi: 'नंबर सीरीज, न्याय निगमन, वोकैब्युलरी एवं 120 ग्रामर नियम',
        keyFormulasOrTricksEn: [
          'Sum of opposite letter pairs in English alphabet is always 27 (A=1, Z=26)',
          'Conditional Clauses: "If" clause never takes "will/shall" when describing future condition',
          'Neither...nor / Either...or: Verb agrees with the nearest subject'
        ],
        keyFormulasOrTricksHi: [
          'अंग्रेजी वर्णमाला में विपरीत अक्षरों का योग सदैव 27 होता है (A=1, Z=26)',
          'शर्तसूचक वाक्य (Conditional): If क्लॉज में भविष्य की शर्त के लिए will/shall का प्रयोग वर्जित है',
          'Neither...nor / Either...or में क्रिया निकटतम कर्ता के अनुसार आती है'
        ],
        questions: [EXPECTED_QUESTIONS_SAMPLE[4], EXPECTED_QUESTIONS_SAMPLE[5], EXPECTED_QUESTIONS_SAMPLE[6]]
      }
    ]
  },
  {
    id: 'pdf-gk-brahmastra',
    title: 'Static GK & Current Affairs 2024-25: 1000 Most Repeated MCQs',
    hindiTitle: 'स्टैटिक जीके व करंट अफेयर्स: टीसीएस द्वारा बार-बार पूछे जाने वाले 1000 प्रश्न',
    taglineEn: 'Art & Culture • Classical Dances • Polity Articles • Census 2011',
    taglineHi: 'कला व संस्कृति • शास्त्रीय नृत्य • संविधान अनुच्छेद • जनगणना 2011',
    category: 'gk-brahmastra',
    price: 49,
    originalPrice: 199,
    pageCount: 96,
    totalQuestions: 1000,
    fileSizeMb: '3.6 MB',
    rating: 4.85,
    totalRatings: 1230,
    downloadsCount: 11800,
    isBestseller: true,
    descriptionEn: 'The complete General Awareness capsule for SSC CHSL. Eliminates guesswork with 1000 authentic questions on Gharanas, musical instruments, festivals, awards, and sports.',
    descriptionHi: 'एसएससी सीएचएसएल के लिए संपूर्ण सामान्य ज्ञान कैप्सूल। घराने, वाद्ययंत्र, मेले, त्योहार, खेलकूद, राष्ट्रीय पुरस्कार और बजट पर आधारित सबसे सटीक 1000 प्रश्न।',
    highlightsEn: [
      '1000 TCS Verified Repeated MCQs with detailed background facts',
      'Complete coverage of 2024-2025 major summits, sports & awards',
      'Table of Musical Instruments & Famous Exponents (Gharanas)',
      'All Fundamental Rights, DPSP & Constitutional Amendments'
    ],
    highlightsHi: [
      '1000 टीसीएस प्रमाणित एमसीक्यू विस्तृत पृष्ठभूमि तथ्यों के साथ',
      '2024-2025 के प्रमुख खेल, पुरस्कार, सम्मेलन और सरकारी योजनाएं',
      'प्रमुख वाद्ययंत्र एवं उनके प्रसिद्ध वादकों (घराना) की विशेष तालिका',
      'मौलिक अधिकार, नीति निदेशक तत्व एवं प्रमुख संवैधानिक संशोधन'
    ],
    sections: [
      {
        titleEn: 'Art, Culture & Performing Artists Capsule',
        titleHi: 'कला, संस्कृति एवं प्रमुख कलाकार',
        subheadingEn: 'Bharat Ratna Musicians, Sitar, Sarod, Tabla & Shehnai Exponents',
        subheadingHi: 'भारत रत्न संगीतकार, सितार, सरोद, तबला व शहनाई वादक',
        keyFormulasOrTricksEn: [
          'Pt. Ravi Shankar = Sitar (Maihar Gharana)',
          'Ustad Bismillah Khan = Shehnai (Bharat Ratna 2001)',
          'Ustad Zakir Hussain & Ustad Alla Rakha = Tabla',
          'Sonal Mansingh = Bharatanatyam & Odissi'
        ],
        keyFormulasOrTricksHi: [
          'पंडित रवि शंकर = सितार (मैहर घराना)',
          'उस्ताद बिस्मिल्लाह खान = शहनाई (भारत रत्न 2001)',
          'उस्ताद ज़ाकिर हुसैन व उस्ताद अल्ला रक्खा = तबला',
          'सोनल मानसिंह = भरतनाट्यम एवं ओडिसी'
        ],
        questions: [EXPECTED_QUESTIONS_SAMPLE[3], EXPECTED_QUESTIONS_SAMPLE[2]]
      }
    ]
  },
  {
    id: 'pdf-quant-tricks',
    title: 'Quantitative Aptitude: 300 Super Repeated Models & 15-Second Shortcuts',
    hindiTitle: 'क्वांटिटेटिव एप्टीट्यूड: 300 सुपर रिपीटेड प्रश्न व 15-सेकंड शॉर्टकट ट्रिक्स',
    taglineEn: 'Arithmetic + Advanced Math • Short Trick Formulas • No Long Steps',
    taglineHi: 'अंकगणित + एडवांस मैथ • शॉर्ट ट्रिक फॉर्मूले • बिना लंबे कैलकुलेशन',
    category: 'quant-tricks',
    price: 49,
    originalPrice: 199,
    pageCount: 88,
    totalQuestions: 300,
    fileSizeMb: '3.2 MB',
    rating: 4.92,
    totalRatings: 980,
    downloadsCount: 9400,
    isBestseller: false,
    isHot: true,
    descriptionEn: 'Master the exact math questions repeated shift after shift in SSC CHSL. Includes mental math shortcuts, digit sum method, and geometry angle-chasing tricks.',
    descriptionHi: 'सीएचएसएल में बार-बार आने वाले 300 गणित के मॉडल्स। डिजिटल सम विधि, 15-सेकंड शॉर्टकट ट्रिक्स और एडवांस मैथ के त्वरित हल फॉर्मूले।',
    highlightsEn: [
      '300 Most Repeated Math Models classified by Chapter',
      'Special section on Mensuration 2D/3D & Circle Theorems',
      'Time & Work Efficiency ratios without equations',
      'Profit & Loss Faulty Balance / Cheating Dealer short tricks'
    ],
    highlightsHi: [
      '300 सबसे ज्यादा रिपीट होने वाले गणित के प्रश्न अध्यायवार',
      'क्षेत्रमिति 2D/3D एवं वृत्त प्रमेयों (Circle Theorems) का विशेष खंड',
      'कार्य और समय की दक्षता आधारित शॉर्ट ट्रिक्स',
      'बेईमान दुकानदार (Faulty Weights) के प्रश्नों को हल करने का सीधा सूत्र'
    ],
    sections: [
      {
        titleEn: 'High-Yield Arithmetic & Advanced Math Tricks',
        titleHi: 'उच्च-वेटेज अंकगणित एवं एडवांस मैथ ट्रिक्स',
        subheadingEn: 'Geometry circles, tangent chords, Algebra symmetry',
        subheadingHi: 'ज्यामिति वृत्त, स्पर्श रेखाएं एवं बीजगणित सूत्र',
        keyFormulasOrTricksEn: [
          'Direct Common Tangent (DCT) = √(d² - (r1 - r2)²)',
          'Transverse Common Tangent (TCT) = √(d² - (r1 + r2)²)',
          'Faulty Weights: Profit % = [Error / (True Value - Error)] × 100'
        ],
        keyFormulasOrTricksHi: [
          'अनुप्रस्थ स्पर्श रेखा (TCT) = √(d² - (r1 + r2)²)',
          'सीधी उभयनिष्ठ स्पर्श रेखा (DCT) = √(d² - (r1 - r2)²)',
          'बेईमान तौल का लाभ % = [त्रुटि / (सत्य मान - त्रुटि)] × 100'
        ],
        questions: [EXPECTED_QUESTIONS_SAMPLE[0], EXPECTED_QUESTIONS_SAMPLE[1]]
      }
    ]
  },
  {
    id: 'pdf-english-vocab',
    title: 'English Vocabulary & 120 Golden Rules of Grammar for CHSL',
    hindiTitle: 'इंग्लिश वोकैब्युलरी एवं 120 गोल्डन ग्रामर रूल्स (TCS स्पेशल)',
    taglineEn: '500 Idioms & Phrases • 400 One-Word Substitutions • Error Spotting',
    taglineHi: '500 मुहावरे • 400 वाक्यांश के लिए एक शब्द • एरर डिटेक्शन रूल्स',
    category: 'english-booster',
    price: 49,
    originalPrice: 199,
    pageCount: 78,
    totalQuestions: 750,
    fileSizeMb: '2.9 MB',
    rating: 4.88,
    totalRatings: 860,
    downloadsCount: 8100,
    isBestseller: false,
    descriptionEn: 'Score 45+ in English Tier-1. Covers all repetitive idioms, root words for synonyms/antonyms, and 120 golden grammar rules with exam examples.',
    descriptionHi: 'सीएचएसएल टियर-1 में 45+ स्कोर करने के लिए इंग्लिश की सर्वश्रेष्ठ ई-बुक। सभी रिपीटेड मुहावरे, वन-वर्ड और 120 गोल्डन ग्रामर नियम हिंदी उदाहरणों के साथ।',
    highlightsEn: [
      '120 Golden Rules of Grammar with common SSC traps',
      '500 Most Repeated Idioms & Phrases with Hindi meanings',
      '400 One-Word Substitutions sorted alphabetically',
      'Cloze Test and Reading Comprehension strategic tips'
    ],
    highlightsHi: [
      '120 गोल्डन ग्रामर रूल्स एसएससी के ट्रैप्स के साथ',
      '500 सबसे ज्यादा रिपीटेड मुहावरे हिंदी अर्थ व वाक्य प्रयोग सहित',
      '400 महत्वपूर्ण One-Word Substitutions वर्णमाला क्रम में',
      'क्लोज़ टेस्ट एवं रीडिंग कॉम्प्रिहेंशन हल करने की अचूक रणनीति'
    ],
    sections: [
      {
        titleEn: '120 Golden Grammar Rules & Vocabulary Boost',
        titleHi: '120 गोल्डन ग्रामर रूल्स एवं वोकैब्युलरी',
        subheadingEn: 'Subject-Verb Agreement, Inversion & Conditional Rules',
        subheadingHi: 'सब्जेक्ट-वर्ब एग्रीमेंट, इनवर्जन एवं कंडीशनल वाक्य',
        keyFormulasOrTricksEn: [
          'Scarcely / Hardly is followed by "when", not "than"',
          'No sooner is followed by "than", not "when"',
          'One of the + Plural Noun + Singular Verb (e.g. One of my friends is...)'
        ],
        keyFormulasOrTricksHi: [
          'Hardly / Scarcely के साथ सदैव "when" आता है, "than" नहीं',
          'No sooner के साथ सदैव "than" आता है',
          'One of the के बाद बहुवचन संज्ञा (Plural Noun) एवं एकवचन क्रिया (Singular Verb) आती है'
        ],
        questions: [EXPECTED_QUESTIONS_SAMPLE[5], EXPECTED_QUESTIONS_SAMPLE[6]]
      }
    ]
  },
  {
    id: 'pdf-pyq-capsule',
    title: 'SSC CHSL 5-Year PYQ Capsule (2020-2024 Shift-Wise Repeated Questions)',
    hindiTitle: 'एसएससी सीएचएसएल पिछले 5 वर्ष के PYQ (2020-2024 शिफ्ट-वाइज़ रिपीटेड प्रश्न)',
    taglineEn: 'Real TCS Papers • 50+ Shifts Analyzed • Chapter-Wise Segregation',
    taglineHi: 'असली टीसीएस प्रश्न पत्र • 50+ शिफ्ट्स का विश्लेषण • अध्यायवार वर्गीकरण',
    category: 'pyq-capsule',
    price: 49,
    originalPrice: 199,
    pageCount: 116,
    totalQuestions: 600,
    fileSizeMb: '4.2 MB',
    rating: 4.86,
    totalRatings: 740,
    downloadsCount: 7200,
    isBestseller: false,
    descriptionEn: 'A deep-dive collection of questions that have appeared in 3 or more CHSL shifts between 2020 and 2024. Understand the exact recurring pattern.',
    descriptionHi: '2020 से 2024 के बीच 3 या उससे अधिक बार रिपीट हुए प्रश्नों का अनूठा संकलन। वास्तविक परीक्षा प्रश्नों के माध्यम से सटीक तैयारी करें।',
    highlightsEn: [
      'Identifies the 600 most recurring questions across 5 years',
      'Shift-wise analysis showing question repetition rate',
      'Bilingual explanations with TCS exam shift date tags',
      'Instant Printable PDF format'
    ],
    highlightsHi: [
      'पिछले 5 वर्षों में सबसे अधिक बार पूछे गए 600 प्रश्न',
      'शिफ्ट-वाइज़ विश्लेषण जो प्रश्नों की पुनरावृत्ति दर दर्शाता है',
      'प्रत्येक प्रश्न पर परीक्षा शिफ्ट एवं तिथि का उल्लेख',
      'तुरंत प्रिंट करने योग्य एवं डाउनलोड के लिए तैयार'
    ],
    sections: [
      {
        titleEn: 'Multi-Shift Recurring Questions',
        titleHi: 'एकाधिक शिफ्टों में पूछे गए रिपीटेड प्रश्न',
        subheadingEn: '2022, 2023 & 2024 Verified TCS questions',
        subheadingHi: '2022, 2023 एवं 2024 टीसीएस सत्यापित प्रश्न',
        keyFormulasOrTricksEn: [
          'PYQ repeat rate in SSC CHSL is approximately 60-70% in Static GK & Vocab',
          'Math questions test the same concept models with modified numeric values'
        ],
        keyFormulasOrTricksHi: [
          'एसएससी सीएचएसएल में स्टैटिक जीके और वोकैब में 60-70% प्रश्न प्रत्यक्ष या परोक्ष रूप से रिपीट होते हैं',
          'गणित में वही मॉडल संख्याएं बदलकर पूछे जाते हैं'
        ],
        questions: [EXPECTED_QUESTIONS_SAMPLE[0], EXPECTED_QUESTIONS_SAMPLE[2], EXPECTED_QUESTIONS_SAMPLE[4]]
      }
    ]
  }
];
