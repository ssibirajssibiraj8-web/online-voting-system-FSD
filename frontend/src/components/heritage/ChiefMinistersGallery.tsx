import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Landmark,
  Award,
  Calendar,
  Sparkles,
  ExternalLink,
  Search,
  BookOpen,
  X,
  Vote,
  ShieldCheck,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { PartyBadge } from '../ui/PartyBadge';

export interface LeaderProfile {
  id: string;
  name: string;
  tamilName?: string;
  moniker: string;
  role: string;
  tenure: string;
  category: 'historic_cm' | 'modern_cm' | 'emerging_force';
  partyAbbr: string;
  partyName: string;
  partyColor: string;
  symbol: string;
  photoUrl: string;
  flagUrl?: string;
  quote: string;
  biography: string;
  landmarkInitiatives: string[];
  simulationRole?: string;
}

const LEADERS_DATA: LeaderProfile[] = [
  {
    id: 'annadurai',
    name: 'C. N. Annadurai',
    tamilName: 'சி. என். அண்ணாதுரை',
    moniker: 'Perarignar Anna (Arignar Anna)',
    role: '1st Chief Minister of Tamil Nadu',
    tenure: '1967 – 1969',
    category: 'historic_cm',
    partyAbbr: 'DMK',
    partyName: 'Dravida Munnetra Kazhagam',
    partyColor: '#E53935',
    symbol: 'Rising Sun',
    photoUrl: '/images/leaders/cm_annadurai.jpg',
    quote: 'Kadamai, Kanniyam, Kattupaadu (Duty, Dignity, Discipline). Matran thotta mallikaikku manam undu.',
    biography:
      'Legendary orator, playwright, and founder of the DMK. Annadurai led the historic 1967 electoral victory ending Congress dominance in Madras State. In 1969, he officially renamed Madras State to Tamil Nadu, instituted the two-language policy (Tamil and English), and legalized Self-Respect marriages without priestly rituals.',
    landmarkInitiatives: [
      'Statutory renaming of Madras State to Tamil Nadu in 1969',
      'Enacted the two-language policy (Tamil & English)',
      'Legalization of Self-Respect (Suya Mariyadhai) marriages',
      'Pioneered subsidized one-rupee rice scheme for economically weaker sections',
    ],
  },
  {
    id: 'kamaraj',
    name: 'K. Kamaraj',
    tamilName: 'கு. காமராசர்',
    moniker: 'Karma Veerar • The Kingmaker',
    role: 'Chief Minister of Madras State (3 Terms)',
    tenure: '1954 – 1963',
    category: 'historic_cm',
    partyAbbr: 'INC',
    partyName: 'Indian National Congress',
    partyColor: '#19AAED',
    symbol: 'Hand',
    photoUrl: '/images/leaders/cm_kamaraj.jpg',
    quote: 'Education is the foremost light that abolishes poverty and inequality.',
    biography:
      'Revered nationwide for his uncompromising humility and integrity. As Chief Minister, Kamaraj introduced the revolutionary Universal Midday Meal Scheme in primary schools to draw underprivileged rural children to classrooms. Under his administration, literacy soared, major dams were built, and landmark industries like BHEL and Neyveli Lignite were commissioned.',
    landmarkInitiatives: [
      'Pioneered the Free Midday Meal Scheme in schools worldwide',
      'Mandated primary schools within every 3 kilometers in rural Tamil Nadu',
      'Commissioned Bhavanisagar, Vaigai, Amaravathi, and Parambikulam-Aliyar irrigation dams',
      'Established industrial giants: Neyveli Lignite, BHEL Trichy, and Integral Coach Factory',
    ],
  },
  {
    id: 'mgr',
    name: 'M. G. Ramachandran',
    tamilName: 'எம். ஜி. இராமச்சந்திரன்',
    moniker: 'Puratchi Thalaivar (Revolutionary Leader) • MGR',
    role: 'Chief Minister of Tamil Nadu (3 Consecutive Terms)',
    tenure: '1977 – 1987',
    category: 'historic_cm',
    partyAbbr: 'AIADMK',
    partyName: 'All India Anna Dravida Munnetra Kazhagam',
    partyColor: '#2E7D32',
    symbol: 'Two Leaves',
    photoUrl: '/images/leaders/cm_mgr.jpg',
    quote: 'A ruler must wipe the tears of the hungry before seeking their praise.',
    biography:
      'Cultural titan, cinema icon, and charismatic populist founder of the AIADMK in 1972. Elected Chief Minister in 1977, 1980, and 1984, MGR maintained invincible electoral popularity. He revolutionized welfare delivery by transforming the school meal program into the comprehensive Nutritious Meal Scheme and established Tamil University in Thanjavur.',
    landmarkInitiatives: [
      'Expanded school nutrition into the comprehensive Nutritious Noon Meal Scheme',
      'Founded Tamil University in Thanjavur and Mother Teresa Women’s University',
      'Introduced free electricity for small farmers and footwear schemes for school children',
      'Established the iconic Anna University and Tamil Nadu Dr. M.G.R. Medical University',
    ],
  },
  {
    id: 'karunanidhi',
    name: 'M. Karunanidhi',
    tamilName: 'மு. கருணாநிதி',
    moniker: 'Mutthamizh Arignar Kalaignar',
    role: '5-Term Chief Minister of Tamil Nadu',
    tenure: '1969 – 2011 (5 Terms)',
    category: 'historic_cm',
    partyAbbr: 'DMK',
    partyName: 'Dravida Munnetra Kazhagam',
    partyColor: '#E53935',
    symbol: 'Rising Sun',
    photoUrl: '/images/leaders/cm_karunanidhi.jpg',
    quote: 'Udal mannukku, uyir Thamizhukku (Body to the soil, soul to Tamil).',
    biography:
      'Master playwright, orator, and DMK patriarch for five decades. Karunanidhi served as Chief Minister across five separate terms over 40 years. He spearheaded Tamil Nadu’s modernization, constructed TIDEL Park propelling the state into an IT powerhouse, instituted Uzhavar Sandhai direct farmer markets, and created Samathuvapuram model inclusive villages.',
    landmarkInitiatives: [
      'Built TIDEL Park Chennai, sparking Tamil Nadu’s global software revolution',
      'Created Samathuvapuram (Social Equality Villages) uniting all communities',
      'Launched Uzhavar Sandhai (direct farmer-to-consumer markets)',
      '33% reservation for women in local governance and equal property rights for women (1989)',
    ],
  },
  {
    id: 'jayalalithaa',
    name: 'J. Jayalalithaa',
    tamilName: 'ஜெ. ஜெயலலிதா',
    moniker: 'Puratchi Thalaivi • Amma',
    role: '6-Term Chief Minister of Tamil Nadu',
    tenure: '1991 – 2016 (6 Terms)',
    category: 'historic_cm',
    partyAbbr: 'AIADMK',
    partyName: 'All India Anna Dravida Munnetra Kazhagam',
    partyColor: '#2E7D32',
    symbol: 'Two Leaves',
    photoUrl: '/images/leaders/cm_jayalalithaa.jpg',
    quote: 'Makkalal naan, makkalukkagave naan (I am of the people, and for the people).',
    biography:
      'Formidable statesman, orator, and AIADMK General Secretary. Jayalalithaa served six terms as Chief Minister, establishing an enduring legacy of pro-women welfare, strict administrative discipline, and grassroots relief. She introduced the internationally studied Cradle Baby Scheme combating female infanticide, set up Asia’s first All-Women Police Stations, and launched Amma Unavagam subsidised food canteens.',
    landmarkInitiatives: [
      'Pioneered Cradle Baby Scheme (Thottil Kuzhandhai Thittam) combating female infanticide',
      'Established Asia’s first All-Women Police Stations',
      'Revolutionary Rainwater Harvesting mandate replenishing Tamil Nadu groundwater',
      'Launched Amma Unavagam subsidized clean food canteens across urban municipal bodies',
    ],
  },
  {
    id: 'palaniswami',
    name: 'Edappadi K. Palaniswami',
    tamilName: 'எடப்பாடி கே. பழனிசாமி',
    moniker: 'EPS • Leader of Opposition',
    role: '7th Chief Minister of Tamil Nadu',
    tenure: '2017 – 2021',
    category: 'modern_cm',
    partyAbbr: 'AIADMK',
    partyName: 'All India Anna Dravida Munnetra Kazhagam',
    partyColor: '#2E7D32',
    symbol: 'Two Leaves',
    photoUrl: '/images/leaders/cm_palaniswami.jpg',
    quote: 'Agricultural self-sufficiency and social welfare are the bedrock of our prosperity.',
    biography:
      'Veteran agricultural legislator representing Edappadi constituency in Salem district across multiple terms. As Chief Minister from 2017 to 2021, Palaniswami spearheaded the massive Kudimaramathu community irrigation project, sanctioned 11 new government medical colleges in a single year, and enacted the 7.5% preferential horizontal reservation in medical admissions (NEET) for government school students.',
    landmarkInitiatives: [
      'Enacted 7.5% preferential reservation for government school students in medical courses (NEET)',
      'Rejuvenated traditional water bodies and irrigation canals via Kudimaramathu',
      'Sanctioned and initiated 11 new Government Medical Colleges across rural districts',
      'Declared Cauvery Delta region as a Protected Agricultural Zone',
    ],
    simulationRole: 'Contesting Candidate in Edappadi (AC 86) Simulation',
  },
  {
    id: 'stalin',
    name: 'M. K. Stalin',
    tamilName: 'மு. க. ஸ்டாலின்',
    moniker: 'Muthuvel Karunanidhi Stalin • Incumbent CM',
    role: '8th Chief Minister of Tamil Nadu',
    tenure: '2021 – Present',
    category: 'modern_cm',
    partyAbbr: 'DMK',
    partyName: 'Dravida Munnetra Kazhagam',
    partyColor: '#E53935',
    symbol: 'Rising Sun',
    photoUrl: '/images/leaders/cm_stalin.jpg',
    quote: 'Dravidian Model governance: Growth for all, social justice for all, rights for all.',
    biography:
      'Incumbent Chief Minister of Tamil Nadu, DMK President, and longtime civic administrator who served as Mayor of Chennai and Deputy Chief Minister. Sworn in as Chief Minister in May 2021, Stalin champions the ‘Dravidian Model’ of governance. Key policies include the Chief Minister’s Breakfast Scheme for school children, free urban bus travel for women, and the Kalaignar Magalir Urimai Thogai monthly universal basic income for women heads of families.',
    landmarkInitiatives: [
      'Pioneered the Chief Minister’s Breakfast Scheme across all government primary schools',
      'Kalaignar Magalir Urimai Thogai: ₹1,000 monthly basic income for women heads of families',
      'Pudhumai Penn and Thamizh Pudhalvan monthly higher education stipends',
      'Free urban public bus transit for women across Tamil Nadu transport corporations',
    ],
    simulationRole: 'Contesting Candidate in Kolathur (AC 13) Simulation',
  },
  {
    id: 'tvk_vijay',
    name: 'Vijay (C. Joseph Vijay)',
    tamilName: 'விஜய் (தமிழக வெற்றிக் கழகம்)',
    moniker: 'Thalapathy Vijay • TVK President',
    role: 'Founder & President, Tamilaga Vettri Kazhagam (TVK)',
    tenure: '2024 – Present',
    category: 'emerging_force',
    partyAbbr: 'TVK',
    partyName: 'Tamilaga Vettri Kazhagam',
    partyColor: '#8E24AA',
    symbol: 'Whistle',
    photoUrl: '/images/leaders/tvk_vijay.jpg',
    flagUrl: '/images/parties/tvk_flag.png',
    quote: 'Pirappokkum ella uyirkkum (All beings are equal by birth). Secular social democracy is our guiding compass.',
    biography:
      'Cinema icon and youth mobilizer who announced his entry into politics by founding Tamilaga Vettri Kazhagam (TVK) in February 2024. TVK champions secular social democracy, quality public education, anti-corruption governance, and equal opportunity. With the party symbol Whistle and an official red-yellow-maroon banner bearing two royal elephants, TVK enters the 2026 Tamil Nadu election simulation as a prominent new contender.',
    landmarkInitiatives: [
      'Founded Tamilaga Vettri Kazhagam (TVK) with official symbol "Whistle" and elephant victory banner',
      'Unveiled progressive manifesto emphasizing universal high-standard education and healthcare',
      'Anti-corruption administrative transparency and grievance redressing digitalization',
      'Active contesting candidate in 2026 Academic Election Simulation',
    ],
    simulationRole: 'Contesting Candidate in Kolathur (AC 13) TVK Nomination',
  },
  {
    id: 'annamalai',
    name: 'K. Annamalai',
    tamilName: 'கு. அண்ணாமலை',
    moniker: 'Singham • State President, BJP',
    role: 'State President, Bharatiya Janata Party (Tamil Nadu)',
    tenure: '2021 – Present',
    category: 'modern_cm',
    partyAbbr: 'BJP',
    partyName: 'Bharatiya Janata Party',
    partyColor: '#FF9933',
    symbol: 'Lotus',
    photoUrl: '/images/leaders/cm_annamalai.jpg',
    quote: 'Integrity in public life is non-negotiable. Tamil Nadu deserves visionary modern governance free of corruption.',
    biography:
      'Former Indian Police Service (IPS) officer of Karnataka cadre who entered politics to lead the BJP in Tamil Nadu. Annamalai undertook the statewide En Mann En Makkal (My Land, My People) padayatra traversing all 234 assembly constituencies, campaigning for industrial revitalization in Coimbatore and digitalized anti-corruption governance.',
    landmarkInitiatives: [
      'Spearheaded the 234-constituency En Mann En Makkal statewide mass outreach padayatra',
      'Advocates direct central infrastructure corridors for western Tamil Nadu MSME clusters',
      'Policy platform centered on transparent administrative accountability and digital delivery',
      'Contesting nominee in 2026 Academic Election Simulation in Coimbatore South (AC 120)',
    ],
    simulationRole: 'Contesting Candidate in Coimbatore South (AC 120)',
  },
  {
    id: 'ops',
    name: 'O. Panneerselvam',
    tamilName: 'ஓ. பன்னீர்செல்வம்',
    moniker: 'OPS • Former 3-Term Chief Minister',
    role: 'Former 3-term Chief Minister of Tamil Nadu',
    tenure: '2001–2002, 2014–2015, 2016–2017',
    category: 'historic_cm',
    partyAbbr: 'AIADMK',
    partyName: 'All India Anna Dravida Munnetra Kazhagam',
    partyColor: '#2E7D32',
    symbol: 'Two Leaves',
    photoUrl: '/images/leaders/cm_ops.jpg',
    quote: 'True loyalty to the public is demonstrated by steady crisis governance and civic humility.',
    biography:
      'Three-time Chief Minister of Tamil Nadu and longtime representative of Bodinayakanur in Theni district. OPS served as Chief Minister during critical transitional junctures, navigating administrative stability, post-cyclone disaster mitigation, and agro-welfare measures.',
    landmarkInitiatives: [
      'Steered state administration across three crucial Chief Ministerial transitional tenures',
      'Spearheaded disaster relief and power grid rehabilitation following Cyclone Vardah (2016)',
      'Expansion of Theni cardamom, spices, and horticulture market infrastructure',
      'Contesting candidate in Bodinayakanur (AC 200) simulation',
    ],
    simulationRole: 'Contesting Candidate in Bodinayakanur (AC 200)',
  },
  {
    id: 'udhayanidhi',
    name: 'Udhayanidhi Stalin',
    tamilName: 'உதயநிதி ஸ்டாலின்',
    moniker: 'Youth Wing Secretary • Deputy CM',
    role: 'Deputy Chief Minister of Tamil Nadu',
    tenure: '2024 – Present',
    category: 'modern_cm',
    partyAbbr: 'DMK',
    partyName: 'Dravida Munnetra Kazhagam',
    partyColor: '#E53935',
    symbol: 'Rising Sun',
    photoUrl: '/images/leaders/cm_udhayanidhi.jpg',
    quote: 'Youth potential and social justice will define the future century of Tamil Nadu.',
    biography:
      'Deputy Chief Minister of Tamil Nadu, Minister for Youth Welfare and Sports Development, and MLA for Chepauk-Thiruvallikeni. Instrumental in hosting international sports championships (Chess Olympiad, Khelo India) and mobilizing statewide youth welfare academies.',
    landmarkInitiatives: [
      'Successfully hosted the historic 44th FIDE Chess Olympiad in Chennai',
      'Expanded Kalaignar Sports Kit distribution across all 12,000 village panchayats',
      'Modernized urban sports infrastructure and youth skill development polytechnics',
      'Contesting Candidate in Chepauk-Thiruvallikeni (AC 19) simulation',
    ],
    simulationRole: 'Contesting Candidate in Chepauk-Thiruvallikeni (AC 19)',
  },
];

export const ChiefMinistersGallery: React.FC = () => {
  const [selectedLeader, setSelectedLeader] = useState<LeaderProfile | null>(null);
  const [filter, setFilter] = useState<'all' | 'historic_cm' | 'modern_cm' | 'emerging_force'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLeaders = LEADERS_DATA.filter((leader) => {
    // Category match
    if (filter !== 'all' && leader.category !== filter) return false;

    // Search query match
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      leader.name.toLowerCase().includes(q) ||
      leader.moniker.toLowerCase().includes(q) ||
      leader.partyAbbr.toLowerCase().includes(q) ||
      leader.partyName.toLowerCase().includes(q) ||
      leader.landmarkInitiatives.some((ini) => ini.toLowerCase().includes(q))
    );
  });

  return (
    <section className="py-20 relative overflow-hidden bg-gradient-to-b from-[#07080B] via-[#0D0F14] to-[#07080B] border-t border-[#242834]">
      {/* Decorative Ambient Background */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#C9A96E]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#8E24AA]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#151820] border border-[#C9A96E]/30 text-[#E5C98A] text-xs font-mono font-medium mb-4 shadow-luxury">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A96E]" />
            <span className="tracking-widest uppercase">Electoral History & Vanguard</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-bold font-editorial text-[#F5F5F2] leading-tight mb-4">
            Tamil Nadu Chief Ministers &amp;{' '}
            <span className="gold-gradient-text">Political Vanguard</span>
          </h2>

          <p className="text-sm sm:text-base text-[#9699A3] leading-relaxed">
            From the pioneering Dravidian statesmen and the architects of the Midday Meal scheme to the 
            emergence of <strong className="text-[#E5C98A]">Tamilaga Vettri Kazhagam (TVK)</strong>, explore the 
            illustrious leadership legacy shaping Tamil Nadu’s democratic simulation.
          </p>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 bg-[#151820] p-1.5 rounded-2xl border border-[#242834]">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-[#E5C98A] to-[#C9A96E] text-[#07080B] shadow-md'
                  : 'text-[#9699A3] hover:text-[#F5F5F2]'
              }`}
            >
              All Leaders ({LEADERS_DATA.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('historic_cm')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                filter === 'historic_cm'
                  ? 'bg-gradient-to-r from-[#E5C98A] to-[#C9A96E] text-[#07080B] shadow-md'
                  : 'text-[#9699A3] hover:text-[#F5F5F2]'
              }`}
            >
              Historic Chief Ministers
            </button>
            <button
              type="button"
              onClick={() => setFilter('modern_cm')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                filter === 'modern_cm'
                  ? 'bg-gradient-to-r from-[#E5C98A] to-[#C9A96E] text-[#07080B] shadow-md'
                  : 'text-[#9699A3] hover:text-[#F5F5F2]'
              }`}
            >
              Modern CMs
            </button>
            <button
              type="button"
              onClick={() => setFilter('emerging_force')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                filter === 'emerging_force'
                  ? 'bg-[#8E24AA] text-[#F5F5F2] shadow-md'
                  : 'text-[#9699A3] hover:text-[#E5C98A]'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-[#E5C98A]" />
              TVK Vanguard
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search leader, party, or reform..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-emerald-200 focus:border-emerald-500 rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none transition-colors shadow-sm"
            />
          </div>
        </div>

        {/* Leaders Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredLeaders.map((leader) => (
            <motion.div
              key={leader.id}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              onClick={() => setSelectedLeader(leader)}
              className="bg-white rounded-3xl p-5 border border-emerald-200 hover:border-emerald-400 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Highlight badge for TVK or Current CM */}
              {leader.id === 'tvk_vijay' && (
                <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-purple-100 border border-purple-300 text-purple-800 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 z-10">
                  <Flame className="w-3 h-3 text-purple-600" />
                  <span>2024 Emergence</span>
                </div>
              )}

              {leader.id === 'stalin' && (
                <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-400 text-emerald-800 text-[10px] font-mono font-bold uppercase tracking-wider z-10">
                  Incumbent CM
                </div>
              )}

              <div>
                {/* Portrait Frame */}
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-4 bg-emerald-50 border border-emerald-200 group-hover:border-emerald-400 transition-colors shadow-sm">
                  <img
                    src={leader.photoUrl}
                    alt={leader.name}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      // Fallback placeholder
                      (e.target as HTMLImageElement).src = '/images/parties/tvk_flag.png';
                    }}
                  />

                  {/* Party flag watermark if available */}
                  {leader.flagUrl && (
                    <div className="absolute bottom-2.5 right-2.5 w-10 h-6 rounded overflow-hidden shadow-md border border-white/40">
                      <img src={leader.flagUrl} alt="TVK Flag" className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Tenure ribbon */}
                  <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-md border border-emerald-200 text-[11px] font-mono font-semibold text-emerald-900 shadow-sm">
                    {leader.tenure}
                  </div>
                </div>

                {/* Party & Symbol Row */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <PartyBadge
                    name={leader.partyName}
                    abbreviation={leader.partyAbbr}
                    symbol={leader.symbol}
                    color={leader.partyColor}
                    size="sm"
                    variant="compact"
                  />
                  <span className="text-[10px] font-mono uppercase text-slate-600 tracking-widest break-words font-medium">
                    {leader.symbol}
                  </span>
                </div>

                {/* Leader Name & Moniker */}
                <h3 className="text-lg font-bold font-serif text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug break-words">
                  {leader.name}
                </h3>
                <p className="text-xs text-emerald-700 font-semibold mb-2 font-mono break-words">
                  {leader.moniker}
                </p>

                {/* Short Role / Milestone */}
                <p className="text-xs text-slate-600 leading-relaxed mb-4 break-words">
                  {leader.biography}
                </p>
              </div>

              {/* Bottom Card Action */}
              <div className="pt-3 border-t border-emerald-200 flex items-center justify-between text-xs text-slate-600 group-hover:text-slate-900 transition-colors">
                <span className="font-mono text-[11px] text-emerald-700 font-semibold">View Historical Record</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-emerald-600" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Modal: Detailed Leader Dossier */}
        <AnimatePresence>
          {selectedLeader && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.2 }}
                className="bg-white border border-emerald-200 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
              >
                {/* Modal Header */}
                <div className="px-6 py-5 border-b border-emerald-200 flex items-center justify-between bg-emerald-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center border border-emerald-200 shadow-sm">
                      <Landmark className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold font-serif text-slate-900">
                        {selectedLeader.name}
                      </h3>
                      <p className="text-xs text-emerald-700 font-mono font-semibold">
                        {selectedLeader.role} • {selectedLeader.tenure}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedLeader(null)}
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-emerald-100/50 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto space-y-6">
                  {/* Photo & Highlights */}
                  <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start">
                    <div className="relative w-36 h-36 rounded-2xl overflow-hidden bg-emerald-50 border border-emerald-200 shrink-0 shadow-md">
                      <img
                        src={selectedLeader.photoUrl}
                        alt={selectedLeader.name}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                    <div className="space-y-2 text-center sm:text-left flex-1">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <PartyBadge
                          name={selectedLeader.partyName}
                          abbreviation={selectedLeader.partyAbbr}
                          symbol={selectedLeader.symbol}
                          color={selectedLeader.partyColor}
                          variant="pill"
                        />
                        <span className="text-xs font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-semibold">
                          {selectedLeader.symbol}
                        </span>
                      </div>

                      <h4 className="text-xl font-bold font-serif text-slate-900">
                        {selectedLeader.moniker}
                      </h4>

                      {selectedLeader.tamilName && (
                        <p className="text-xs text-slate-600 font-serif tracking-wide">
                          {selectedLeader.tamilName}
                        </p>
                      )}

                      <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs italic text-emerald-900 font-serif">
                        "{selectedLeader.quote}"
                      </div>
                    </div>
                  </div>

                  {/* Biography */}
                  <div>
                    <h5 className="text-xs font-mono uppercase tracking-widest text-emerald-800 font-semibold mb-2 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      Historical Record &amp; Leadership Impact
                    </h5>
                    <p className="text-xs text-slate-700 leading-relaxed bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200">
                      {selectedLeader.biography}
                    </p>
                  </div>

                  {/* Landmark Initiatives */}
                  <div>
                    <h5 className="text-xs font-mono uppercase tracking-widest text-emerald-800 font-semibold mb-3 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5" />
                      Landmark Governance Reforms &amp; Milestones
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {selectedLeader.landmarkInitiatives.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-slate-700"
                        >
                          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="leading-snug text-slate-900 font-medium">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Simulation Role Banner */}
                  {selectedLeader.simulationRole && (
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Vote className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-xs text-emerald-900 font-mono font-semibold">
                          {selectedLeader.simulationRole}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-600 font-medium">
                        Available in Active Simulation
                      </span>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 border-t border-emerald-200 flex items-center justify-end gap-3 bg-emerald-50">
                  <button
                    onClick={() => setSelectedLeader(null)}
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm"
                  >
                    Close Dossier
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
