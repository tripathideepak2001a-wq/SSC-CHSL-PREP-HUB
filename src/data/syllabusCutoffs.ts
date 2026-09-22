export interface CutoffEntry {
  year: string;
  ur: number;
  obc: number;
  ews: number;
  sc: number;
  st: number;
  candidatesQualified: string;
}

export const CHSL_CUTOFFS_HISTORY: CutoffEntry[] = [
  { year: '2024 Tier-1 (Latest)', ur: 153.25, obc: 152.00, ews: 147.50, sc: 136.75, st: 125.00, candidatesQualified: '41,465' },
  { year: '2023 Tier-1', ur: 153.91, obc: 152.26, ews: 151.02, sc: 136.41, st: 124.52, candidatesQualified: '39,268' },
  { year: '2022 Tier-1', ur: 157.72, obc: 153.25, ews: 151.09, sc: 135.46, st: 125.79, candidatesQualified: '40,224' },
  { year: '2021 Tier-1', ur: 140.18, obc: 140.12, ews: 131.40, sc: 112.86, st: 104.78, candidatesQualified: '54,104' },
  { year: '2020 Tier-1', ur: 141.88, obc: 139.46, ews: 117.59, sc: 114.16, st: 108.88, candidatesQualified: '45,429' },
];

export interface SectionSyllabus {
  section: string;
  hindiName: string;
  questions: number;
  marks: number;
  topics: { name: string; weightage: string; description: string }[];
}

export const CHSL_SYLLABUS: SectionSyllabus[] = [
  {
    section: 'General Intelligence & Reasoning',
    hindiName: 'सामान्य बुद्धिमत्ता एवं तर्कशक्ति',
    questions: 25,
    marks: 50,
    topics: [
      { name: 'Analogy & Classification', weightage: '4-5 Qs', description: 'Semantic, Symbolic/Number, Figural Analogy and Odd one out' },
      { name: 'Series (Number & Alphabet)', weightage: '3-4 Qs', description: 'Missing term, pattern recognition, letter sequences' },
      { name: 'Coding-Decoding', weightage: '2-3 Qs', description: 'Letter shifting, number substitution, matrix coding' },
      { name: 'Blood Relations & Direction', weightage: '2-3 Qs', description: 'Family tree relations, distance and direction sense' },
      { name: 'Venn Diagrams & Syllogisms', weightage: '2-3 Qs', description: 'Logical Venn diagrams, Statement-Conclusion' },
      { name: 'Non-Verbal & Paper Folding', weightage: '4-5 Qs', description: 'Mirror images, paper cutting, embedded figures, pattern completion' },
    ]
  },
  {
    section: 'General Awareness',
    hindiName: 'सामान्य जानकारी (GA/GK)',
    questions: 25,
    marks: 50,
    topics: [
      { name: 'Current Affairs (Last 6-8 Months)', weightage: '5-7 Qs', description: 'Government schemes, sports awards, appointments, summits' },
      { name: 'History & Culture', weightage: '4-5 Qs', description: 'Ancient, Medieval, Modern freedom movement, dances & festivals' },
      { name: 'Indian Polity & Constitution', weightage: '3-4 Qs', description: 'Articles, Fundamental Rights, Parliament, Amendments' },
      { name: 'Geography', weightage: '3-4 Qs', description: 'Rivers, mountain passes, climate, census data, national parks' },
      { name: 'General Science', weightage: '4-5 Qs', description: 'Physics laws, Chemical compounds & reactions, Biology human anatomy' },
      { name: 'Economics', weightage: '2-3 Qs', description: 'GDP, inflation, budget terms, Five-year plans, banking rates' },
    ]
  },
  {
    section: 'Quantitative Aptitude',
    hindiName: 'संख्यात्मक अभिरुचि (गणित)',
    questions: 25,
    marks: 50,
    topics: [
      { name: 'Arithmetic Core (Percentage, Profit-Loss, CI/SI)', weightage: '5-6 Qs', description: 'Successive discounts, installment, compound vs simple interest' },
      { name: 'Ratio, Proportion & Mixture', weightage: '3-4 Qs', description: 'Partnership, alligation, age problems' },
      { name: 'Time & Work, Pipes & Cisterns', weightage: '2-3 Qs', description: 'Efficiency, alternate days, wage distribution' },
      { name: 'Speed, Time & Distance', weightage: '2-3 Qs', description: 'Trains, boats & streams, relative speed, circular track' },
      { name: 'Advanced Math: Algebra & Trigonometry', weightage: '5-6 Qs', description: 'Identities, quadratic forms, heights & distances, angle values' },
      { name: 'Geometry & Mensuration 2D/3D', weightage: '4-5 Qs', description: 'Circles (chords, tangents), triangles, cylinder, cone, sphere' },
      { name: 'Data Interpretation (DI)', weightage: '3-4 Qs', description: 'Bar chart, Pie chart, Tabular data calculation' },
    ]
  },
  {
    section: 'English Language',
    hindiName: 'अंग्रेजी भाषा',
    questions: 25,
    marks: 50,
    topics: [
      { name: 'Vocabulary (Synonyms & Antonyms)', weightage: '4-5 Qs', description: 'Repeated SSC words, contextual meaning' },
      { name: 'One-Word Substitution & Idioms', weightage: '4-5 Qs', description: 'High-frequency idioms, phrases and single-word replacements' },
      { name: 'Spotting the Error & Sentence Improvement', weightage: '5-6 Qs', description: 'Subject-verb agreement, tenses, prepositions, voice/narration' },
      { name: 'Cloze Test / Reading Comprehension', weightage: '5 Qs', description: 'Contextual paragraph with 5 blanks testing grammar & vocab' },
      { name: 'Fill in the Blanks & Correct Spelling', weightage: '3-4 Qs', description: 'Confusing words, grammatical blanks, misspelt words' },
    ]
  }
];

export const EXAM_PATTERN_INFO = {
  examName: 'SSC Combined Higher Secondary (10+2) Level Examination (CHSL)',
  tier: 'Tier - I (Computer Based Examination - CBE)',
  totalQuestions: 100,
  totalMarks: 200,
  duration: '60 Minutes (80 mins for scribes/PwD)',
  markingScheme: '+2.00 for each correct answer | -0.50 for each wrong answer',
  passingAdvice: 'Aim for a safe raw score of 155+ to ensure qualification after normalization.'
};
