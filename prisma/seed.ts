import { PrismaClient, CollegeType, CampusSetting } from '@prisma/client';

const prisma = new PrismaClient();

interface SeedCollegeInput {
  name: string;
  slug: string;
  city: string;
  state: string;
  location: string;
  description: string;
  fees: number;
  rating: number;
  type: CollegeType;
  campusSetting: CampusSetting;
  nationalRanking?: number;
  acceptanceRate?: number;
  graduationRate?: number;
  studentBodySize?: number;
  studentFacultyRatio?: number;
  inStateTuition?: number;
  outOfStateTuition?: number;
  avgFinancialAid?: number;
  roomAndBoard?: number;
  avgSatScore?: number;
  avgActScore?: number;
  avgGpa?: number;
  applicationDeadline?: string;
  websiteUrl?: string;
  logoUrl?: string;
  courses: Array<{ name: string; degree: string; duration: string; fees: number }>;
  placements: Array<{ averagePackage: number; highestPackage: number; placementRate: number; year: number }>;
  reviews: Array<{ authorName: string; rating: number; comment: string }>;
}

// Master institution directory covering 110 premier & regional institutions
const collegesData: SeedCollegeInput[] = [
  {
    name: "Massachusetts Institute of Technology",
    slug: "massachusetts-institute-of-technology",
    city: "Cambridge",
    state: "MA",
    location: "Cambridge, MA",
    description: "World leader in science, technology, engineering, and quantitative economics with groundbreaking research output.",
    fees: 59750,
    rating: 4.95,
    type: CollegeType.PRIVATE_NON_PROFIT,
    campusSetting: CampusSetting.URBAN,
    nationalRanking: 2,
    acceptanceRate: 0.04,
    graduationRate: 0.96,
    studentBodySize: 4638,
    studentFacultyRatio: 3,
    inStateTuition: 59750,
    outOfStateTuition: 59750,
    avgFinancialAid: 53000,
    roomAndBoard: 18730,
    avgSatScore: 1540,
    avgActScore: 35,
    avgGpa: 3.98,
    applicationDeadline: "January 1",
    websiteUrl: "https://www.mit.edu",
    courses: [
      { name: "Computer Science & Artificial Intelligence", degree: "B.S.", duration: "4 Years", fees: 59750 },
      { name: "Electrical Engineering", degree: "B.S.", duration: "4 Years", fees: 59750 },
      { name: "Mechanical Engineering", degree: "B.S.", duration: "4 Years", fees: 59750 },
      { name: "Computation and Cognition", degree: "M.S.", duration: "2 Years", fees: 59750 },
    ],
    placements: [
      { year: 2024, averagePackage: 128.5, highestPackage: 260.0, placementRate: 97.2 },
      { year: 2023, averagePackage: 122.0, highestPackage: 245.0, placementRate: 96.8 },
    ],
    reviews: [
      { authorName: "Alex Chen", rating: 5, comment: "Unparalleled engineering ecosystem and access to world-class labs." },
      { authorName: "Sarah Miller", rating: 5, comment: "Rigorous academics but collaborative problem set culture." },
    ],
  },
  {
    name: "Stanford University",
    slug: "stanford-university",
    city: "Stanford",
    state: "CA",
    location: "Stanford, CA",
    description: "Prestigious private research institution situated in Silicon Valley, renowned for entrepreneurial spirit and academic excellence.",
    fees: 61731,
    rating: 4.94,
    type: CollegeType.PRIVATE_NON_PROFIT,
    campusSetting: CampusSetting.SUBURBAN,
    nationalRanking: 3,
    acceptanceRate: 0.038,
    graduationRate: 0.95,
    studentBodySize: 7645,
    studentFacultyRatio: 5,
    inStateTuition: 61731,
    outOfStateTuition: 61731,
    avgFinancialAid: 58000,
    roomAndBoard: 19920,
    avgSatScore: 1530,
    avgActScore: 35,
    avgGpa: 3.96,
    applicationDeadline: "January 5",
    websiteUrl: "https://www.stanford.edu",
    courses: [
      { name: "Computer Science", degree: "B.S.", duration: "4 Years", fees: 61731 },
      { name: "Management Science and Engineering", degree: "B.S.", duration: "4 Years", fees: 61731 },
      { name: "Human Biology", degree: "B.A.", duration: "4 Years", fees: 61731 },
    ],
    placements: [
      { year: 2024, averagePackage: 132.0, highestPackage: 280.0, placementRate: 96.5 },
    ],
    reviews: [
      { authorName: "David Zhao", rating: 5, comment: "Direct pathway to startup venture capital and Silicon Valley tech." },
    ],
  },
  {
    name: "Harvard University",
    slug: "harvard-university",
    city: "Cambridge",
    state: "MA",
    location: "Cambridge, MA",
    description: "Oldest institution of higher learning in the United States, famous for liberal arts, law, business, and medicine.",
    fees: 57261,
    rating: 4.92,
    type: CollegeType.PRIVATE_NON_PROFIT,
    campusSetting: CampusSetting.URBAN,
    nationalRanking: 1,
    acceptanceRate: 0.034,
    graduationRate: 0.98,
    studentBodySize: 7153,
    studentFacultyRatio: 7,
    inStateTuition: 57261,
    outOfStateTuition: 57261,
    avgFinancialAid: 62000,
    roomAndBoard: 19500,
    avgSatScore: 1550,
    avgActScore: 35,
    avgGpa: 4.0,
    applicationDeadline: "January 1",
    websiteUrl: "https://www.harvard.edu",
    courses: [
      { name: "Computer Science (SEAS)", degree: "A.B.", duration: "4 Years", fees: 57261 },
      { name: "Economics", degree: "A.B.", duration: "4 Years", fees: 57261 },
      { name: "Government & International Relations", degree: "A.B.", duration: "4 Years", fees: 57261 },
      { name: "Applied Mathematics", degree: "A.B.", duration: "4 Years", fees: 57261 },
    ],
    placements: [
      { year: 2024, averagePackage: 125.0, highestPackage: 250.0, placementRate: 96.0 },
    ],
    reviews: [
      { authorName: "Emma Watson", rating: 5, comment: "Historic campus, world-renowned library collections, and elite alumni network." },
    ],
  },
  {
    name: "University of California, Berkeley",
    slug: "university-of-california-berkeley",
    city: "Berkeley",
    state: "CA",
    location: "Berkeley, CA",
    description: "Top-ranked public university known for academic rigor, social advocacy, and premier STEM programs.",
    fees: 14226,
    rating: 4.88,
    type: CollegeType.PUBLIC,
    campusSetting: CampusSetting.URBAN,
    nationalRanking: 15,
    acceptanceRate: 0.114,
    graduationRate: 0.93,
    studentBodySize: 32831,
    studentFacultyRatio: 19,
    inStateTuition: 14226,
    outOfStateTuition: 43980,
    avgFinancialAid: 22000,
    roomAndBoard: 20500,
    avgSatScore: 1480,
    avgActScore: 33,
    avgGpa: 3.92,
    applicationDeadline: "November 30",
    websiteUrl: "https://www.berkeley.edu",
    courses: [
      { name: "Electrical Engineering & Computer Sciences (EECS)", degree: "B.S.", duration: "4 Years", fees: 14226 },
      { name: "Business Administration (Haas)", degree: "B.S.", duration: "4 Years", fees: 14226 },
      { name: "Data Science", degree: "B.A.", duration: "4 Years", fees: 14226 },
    ],
    placements: [
      { year: 2024, averagePackage: 112.0, highestPackage: 230.0, placementRate: 93.8 },
    ],
    reviews: [
      { authorName: "Liam Patel", rating: 5, comment: "Top tier CS program with intense academic competition." },
      { authorName: "Jessica Wong", rating: 4, comment: "Large class sizes for lower division courses, but world-class faculty." },
    ],
  },
  {
    name: "University of Michigan",
    slug: "university-of-michigan",
    city: "Ann Arbor",
    state: "MI",
    location: "Ann Arbor, MI",
    description: "Premier public research university offering a vibrant college town atmosphere, exceptional sports, and top engineering.",
    fees: 16178,
    rating: 4.82,
    type: CollegeType.PUBLIC,
    campusSetting: CampusSetting.SUBURBAN,
    nationalRanking: 21,
    acceptanceRate: 0.177,
    graduationRate: 0.93,
    studentBodySize: 32282,
    studentFacultyRatio: 12,
    inStateTuition: 16178,
    outOfStateTuition: 55334,
    avgFinancialAid: 24500,
    roomAndBoard: 13171,
    avgSatScore: 1430,
    avgActScore: 33,
    avgGpa: 3.9,
    applicationDeadline: "February 1",
    websiteUrl: "https://umich.edu",
    courses: [
      { name: "Computer Science", degree: "B.S.E.", duration: "4 Years", fees: 16178 },
      { name: "Aerospace Engineering", degree: "B.S.E.", duration: "4 Years", fees: 16178 },
      { name: "Business Administration (Ross)", degree: "B.B.A.", duration: "4 Years", fees: 16178 },
      { name: "Information Analysis", degree: "B.S.I.", duration: "4 Years", fees: 16178 },
    ],
    placements: [
      { year: 2024, averagePackage: 98.5, highestPackage: 210.0, placementRate: 94.0 },
    ],
    reviews: [
      { authorName: "Brian O'Connor", rating: 5, comment: "Incredible school pride and stellar recruitment across Wall St and tech." },
    ],
  },
  {
    name: "Georgia Institute of Technology",
    slug: "georgia-institute-of-technology",
    city: "Atlanta",
    state: "GA",
    location: "Atlanta, GA",
    description: "Leading technological research university with exceptional return on investment and industry co-op programs.",
    fees: 12852,
    rating: 4.81,
    type: CollegeType.PUBLIC,
    campusSetting: CampusSetting.URBAN,
    nationalRanking: 33,
    acceptanceRate: 0.16,
    graduationRate: 0.91,
    studentBodySize: 18415,
    studentFacultyRatio: 21,
    inStateTuition: 12852,
    outOfStateTuition: 33964,
    avgFinancialAid: 15400,
    roomAndBoard: 12690,
    avgSatScore: 1450,
    avgActScore: 33,
    avgGpa: 3.91,
    applicationDeadline: "January 4",
    websiteUrl: "https://www.gatech.edu",
    courses: [
      { name: "Industrial & Systems Engineering", degree: "B.S.", duration: "4 Years", fees: 12852 },
      { name: "Computer Science", degree: "B.S.", duration: "4 Years", fees: 12852 },
      { name: "Biomedical Engineering", degree: "B.S.", duration: "4 Years", fees: 12852 },
    ],
    placements: [
      { year: 2024, averagePackage: 104.0, highestPackage: 215.0, placementRate: 95.1 },
    ],
    reviews: [
      { authorName: "Marcus Vance", rating: 5, comment: "Top ROI in higher education. Career fairs bring hundreds of major employers." },
    ],
  },
  {
    name: "Carnegie Mellon University",
    slug: "carnegie-mellon-university",
    city: "Pittsburgh",
    state: "PA",
    location: "Pittsburgh, PA",
    description: "Global research university recognized for artificial intelligence, robotics, drama, and interdisciplinary collaboration.",
    fees: 62260,
    rating: 4.89,
    type: CollegeType.PRIVATE_NON_PROFIT,
    campusSetting: CampusSetting.URBAN,
    nationalRanking: 24,
    acceptanceRate: 0.11,
    graduationRate: 0.92,
    studentBodySize: 7365,
    studentFacultyRatio: 6,
    inStateTuition: 62260,
    outOfStateTuition: 62260,
    avgFinancialAid: 45000,
    roomAndBoard: 17468,
    avgSatScore: 1530,
    avgActScore: 35,
    avgGpa: 3.92,
    applicationDeadline: "January 3",
    websiteUrl: "https://www.cmu.edu",
    courses: [
      { name: "School of Computer Science", degree: "B.S.", duration: "4 Years", fees: 62260 },
      { name: "Robotics", degree: "M.S.", duration: "2 Years", fees: 62260 },
      { name: "Information Systems", degree: "B.S.", duration: "4 Years", fees: 62260 },
    ],
    placements: [
      { year: 2024, averagePackage: 124.0, highestPackage: 250.0, placementRate: 96.2 },
    ],
    reviews: [
      { authorName: "Chloe Nguyen", rating: 5, comment: "The AI and software engineering faculty are pioneers in the field." },
    ],
  },
  {
    name: "University of Texas at Austin",
    slug: "university-of-texas-at-austin",
    city: "Austin",
    state: "TX",
    location: "Austin, TX",
    description: "Flagship Texas institution in the heart of the Silicon Hills tech hub with powerhouse business and engineering schools.",
    fees: 11752,
    rating: 4.79,
    type: CollegeType.PUBLIC,
    campusSetting: CampusSetting.URBAN,
    nationalRanking: 32,
    acceptanceRate: 0.287,
    graduationRate: 0.88,
    studentBodySize: 41309,
    studentFacultyRatio: 18,
    inStateTuition: 11752,
    outOfStateTuition: 40996,
    avgFinancialAid: 14200,
    roomAndBoard: 13058,
    avgSatScore: 1370,
    avgActScore: 31,
    avgGpa: 3.84,
    applicationDeadline: "December 1",
    websiteUrl: "https://www.utexas.edu",
    courses: [
      { name: "Mechanical Engineering", degree: "B.S.", duration: "4 Years", fees: 11752 },
      { name: "Finance (McCombs)", degree: "B.B.A.", duration: "4 Years", fees: 11752 },
      { name: "Computer Science (Turing Scholars)", degree: "B.S.", duration: "4 Years", fees: 11752 },
    ],
    placements: [
      { year: 2024, averagePackage: 89.0, highestPackage: 195.0, placementRate: 92.5 },
    ],
    reviews: [
      { authorName: "Tyler Green", rating: 4, comment: "Austin is an incredible city for students and recruiting is massive." },
    ],
  },
  {
    name: "University of Washington",
    slug: "university-of-washington",
    city: "Seattle",
    state: "WA",
    location: "Seattle, WA",
    description: "Top public research institution bordering Lake Washington, famed for computer science, medicine, and oceanography.",
    fees: 12242,
    rating: 4.78,
    type: CollegeType.PUBLIC,
    campusSetting: CampusSetting.URBAN,
    nationalRanking: 40,
    acceptanceRate: 0.48,
    graduationRate: 0.85,
    studentBodySize: 35582,
    studentFacultyRatio: 20,
    inStateTuition: 12242,
    outOfStateTuition: 40740,
    avgFinancialAid: 16800,
    roomAndBoard: 16068,
    avgSatScore: 1350,
    avgActScore: 30,
    avgGpa: 3.8,
    applicationDeadline: "November 15",
    websiteUrl: "https://www.washington.edu",
    courses: [
      { name: "Computer Science & Engineering (Allen School)", degree: "B.S.", duration: "4 Years", fees: 12242 },
      { name: "Bioengineering", degree: "B.S.", duration: "4 Years", fees: 12242 },
    ],
    placements: [
      { year: 2024, averagePackage: 96.0, highestPackage: 210.0, placementRate: 91.8 },
    ],
    reviews: [
      { authorName: "Derek Park", rating: 5, comment: "Direct pipeline to Microsoft, Amazon, and Seattle biotech." },
    ],
  },
  {
    name: "Purdue University",
    slug: "purdue-university",
    city: "West Lafayette",
    state: "IN",
    location: "West Lafayette, IN",
    description: "World-class public university known as the cradle of astronauts with frozen tuition for over a decade.",
    fees: 9992,
    rating: 4.75,
    type: CollegeType.PUBLIC,
    campusSetting: CampusSetting.SUBURBAN,
    nationalRanking: 43,
    acceptanceRate: 0.527,
    graduationRate: 0.83,
    studentBodySize: 37949,
    studentFacultyRatio: 14,
    inStateTuition: 9992,
    outOfStateTuition: 28794,
    avgFinancialAid: 13100,
    roomAndBoard: 10030,
    avgSatScore: 1320,
    avgActScore: 29,
    avgGpa: 3.75,
    applicationDeadline: "January 15",
    websiteUrl: "https://www.purdue.edu",
    courses: [
      { name: "Aeronautical & Astronautical Engineering", degree: "B.S.", duration: "4 Years", fees: 9992 },
      { name: "Agricultural and Biological Engineering", degree: "B.S.", duration: "4 Years", fees: 9992 },
      { name: "Cybersecurity", degree: "B.S.", duration: "4 Years", fees: 9992 },
    ],
    placements: [
      { year: 2024, averagePackage: 84.5, highestPackage: 185.0, placementRate: 93.0 },
    ],
    reviews: [
      { authorName: "Rachel Kim", rating: 5, comment: "Frozen tuition makes it one of the absolute best values in the country." },
    ],
  },
  {
    name: "University of North Carolina at Chapel Hill",
    slug: "university-of-north-carolina-at-chapel-hill",
    city: "Chapel Hill",
    state: "NC",
    location: "Chapel Hill, NC",
    description: "First public university in the US, known for research excellence, public health, and medicine.",
    fees: 8998,
    rating: 4.80,
    type: CollegeType.PUBLIC,
    campusSetting: CampusSetting.SUBURBAN,
    nationalRanking: 22,
    acceptanceRate: 0.171,
    graduationRate: 0.91,
    studentBodySize: 20021,
    studentFacultyRatio: 13,
    inStateTuition: 8998,
    outOfStateTuition: 37558,
    avgFinancialAid: 20500,
    roomAndBoard: 12512,
    avgSatScore: 1410,
    avgActScore: 32,
    avgGpa: 3.9,
    applicationDeadline: "January 15",
    websiteUrl: "https://www.unc.edu",
    courses: [
      { name: "Public Health", degree: "B.S.P.H.", duration: "4 Years", fees: 8998 },
      { name: "Business (Kenan-Flagler)", degree: "B.S.B.A.", duration: "4 Years", fees: 8998 },
    ],
    placements: [
      { year: 2024, averagePackage: 88.0, highestPackage: 190.0, placementRate: 91.5 },
    ],
    reviews: [
      { authorName: "Emily Davis", rating: 5, comment: "Beautiful campus, high quality of life, and unmatched in-state value." },
    ],
  },
  {
    name: "University of Virginia",
    slug: "university-of-virginia",
    city: "Charlottesville",
    state: "VA",
    location: "Charlottesville, VA",
    description: "Historic public institution founded by Thomas Jefferson, celebrated for student self-governance and honor code.",
    fees: 19698,
    rating: 4.81,
    type: CollegeType.PUBLIC,
    campusSetting: CampusSetting.SUBURBAN,
    nationalRanking: 24,
    acceptanceRate: 0.19,
    graduationRate: 0.94,
    studentBodySize: 17296,
    studentFacultyRatio: 15,
    inStateTuition: 19698,
    outOfStateTuition: 55914,
    avgFinancialAid: 23100,
    roomAndBoard: 13390,
    avgSatScore: 1440,
    avgActScore: 33,
    avgGpa: 3.92,
    applicationDeadline: "January 5",
    websiteUrl: "https://www.virginia.edu",
    courses: [
      { name: "Commerce (McIntire)", degree: "B.S.", duration: "4 Years", fees: 19698 },
      { name: "Systems Engineering", degree: "B.S.", duration: "4 Years", fees: 19698 },
    ],
    placements: [
      { year: 2024, averagePackage: 91.5, highestPackage: 195.0, placementRate: 93.4 },
    ],
    reviews: [
      { authorName: "Justin Lee", rating: 5, comment: "Unbeatable student traditions and prestigious alumni network." },
    ],
  },
];

// Systematic generator for states & institutional tiers to expand catalog to 110 diverse entries
const stateConfigs = [
  { state: "CA", cities: ["Los Angeles", "San Diego", "Davis", "Irvine", "Santa Barbara", "San Jose", "Pasadena", "Riverside"] },
  { state: "NY", cities: ["New York", "Ithaca", "Rochester", "Syracuse", "Buffalo", "Albany", "Troy", "Binghamton"] },
  { state: "TX", cities: ["Houston", "College Station", "Dallas", "Lubbock", "San Antonio", "Waco", "El Paso"] },
  { state: "IL", cities: ["Chicago", "Evanston", "Urbana", "Champaign", "Peoria", "Normal", "DeKalb"] },
  { state: "FL", cities: ["Gainesville", "Tallahassee", "Tampa", "Miami", "Orlando", "Boca Raton", "Coral Gables"] },
  { state: "OH", cities: ["Columbus", "Cleveland", "Cincinnati", "Dayton", "Oxford", "Akron", "Toledo"] },
  { state: "PA", cities: ["Philadelphia", "State College", "Bethlehem", "Villanova", "Carlisle", "Lancaster"] },
  { state: "MA", cities: ["Boston", "Amherst", "Medford", "Worcester", "Waltham", "Northampton", "Wellesley"] },
  { state: "NC", cities: ["Raleigh", "Durham", "Winston-Salem", "Charlotte", "Greensboro", "Boone"] },
  { state: "GA", cities: ["Athens", "Savannah", "Kennesaw", "Macon", "Augusta"] },
  { state: "WA", cities: ["Pullman", "Bellingham", "Spokane", "Tacoma", "Olympia"] },
  { state: "MI", cities: ["East Lansing", "Kalamazoo", "Detroit", "Houghton", "Mount Pleasant"] },
  { state: "VA", cities: ["Blacksburg", "Williamsburg", "Richmond", "Fairfax", "Harrisonburg"] },
  { state: "CO", cities: ["Boulder", "Denver", "Fort Collins", "Golden", "Colorado Springs"] },
  { state: "AZ", cities: ["Tempe", "Tucson", "Phoenix", "Flagstaff"] },
  { state: "IN", cities: ["Bloomington", "South Bend", "Terre Haute", "Muncie"] },
];

const institutionPrefixes = [
  "National", "Metropolitan", "Pacific", "Atlantic", "Midwestern", "Southern",
  "Northern", "Central", "Empire", "Golden State", "Valley", "Summit",
  "Heritage", "Keystone", "Highland", "Frontier", "Great Lakes", "Coastal"
];

const institutionDisciplines = [
  "Tech Institute", "Polytechnic University", "State University", "College of Arts & Sciences",
  "Institute of Technology", "Research University", "Academy of Sciences", "Engineering Institute"
];

// Generate entries up to 112 colleges
let idCounter = 13;
for (let i = 0; i < stateConfigs.length; i++) {
  const cfg = stateConfigs[i];
  for (let j = 0; j < cfg.cities.length; j++) {
    if (collegesData.length >= 112) break;
    const city = cfg.cities[j];
    const prefix = institutionPrefixes[(i * 3 + j) % institutionPrefixes.length];
    const discipline = institutionDisciplines[(i + j) % institutionDisciplines.length];
    const isPublic = (i + j) % 3 !== 0;
    const type = isPublic ? CollegeType.PUBLIC : CollegeType.PRIVATE_NON_PROFIT;
    const setting = j % 3 === 0 ? CampusSetting.URBAN : j % 3 === 1 ? CampusSetting.SUBURBAN : CampusSetting.RURAL;
    const name = `${prefix} ${city} ${discipline}`;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Calculated realistic metrics
    const ranking = idCounter;
    const acceptance = Math.min(0.85, Math.max(0.08, +(0.15 + (idCounter * 0.007)).toFixed(3)));
    const gradRate = Math.min(0.95, Math.max(0.65, +(0.95 - (idCounter * 0.003)).toFixed(2)));
    const inStateFees = isPublic ? Math.floor(8000 + (j * 1200) + (i * 450)) : Math.floor(42000 + (j * 2100));
    const outStateFees = isPublic ? Math.floor(inStateFees * 2.8) : inStateFees;
    const ratingVal = +(Math.max(3.2, Math.min(4.9, 4.95 - (idCounter * 0.015)))).toFixed(2);

    // Realistic missing data scenario: 10% of institutions don't require or report SAT/ACT scores (test-blind)
    const isTestOptional = idCounter % 8 === 0;
    const avgSat = isTestOptional ? undefined : Math.floor(1550 - (idCounter * 2.5));
    const avgAct = isTestOptional ? undefined : Math.floor(35 - (idCounter * 0.06));

    collegesData.push({
      name,
      slug,
      city,
      state: cfg.state,
      location: `${city}, ${cfg.state}`,
      description: `Accredited ${type.toLowerCase().replace('_', ' ')} institution in ${city}, providing comprehensive undergraduate and graduate programs across key academic disciplines.`,
      fees: inStateFees,
      rating: ratingVal,
      type,
      campusSetting: setting,
      nationalRanking: ranking <= 100 ? ranking : undefined,
      acceptanceRate: acceptance,
      graduationRate: gradRate,
      studentBodySize: Math.floor(5000 + (idCounter * 280)),
      studentFacultyRatio: Math.floor(10 + (idCounter % 12)),
      inStateTuition: inStateFees,
      outOfStateTuition: outStateFees,
      avgFinancialAid: isPublic ? Math.floor(11000 + (j * 800)) : Math.floor(32000 + (j * 1500)),
      roomAndBoard: Math.floor(11000 + (j * 600)),
      avgSatScore: avgSat,
      avgActScore: avgAct,
      avgGpa: +(Math.max(3.1, 3.95 - (idCounter * 0.008))).toFixed(2),
      applicationDeadline: j % 2 === 0 ? "January 15" : "February 1",
      websiteUrl: `https://www.${slug}.edu`,
      courses: (discipline.includes("Tech") || discipline.includes("Polytechnic") || discipline.includes("Engineering"))
        ? [
            { name: "Computer Science", degree: "B.S.", duration: "4 Years", fees: inStateFees },
            { name: "Data Science & Artificial Intelligence", degree: "B.S.", duration: "4 Years", fees: inStateFees },
            { name: "Mechanical Engineering", degree: "B.S.", duration: "4 Years", fees: inStateFees },
            { name: "Electrical Engineering", degree: "B.S.", duration: "4 Years", fees: inStateFees },
          ]
        : (discipline.includes("State") || discipline.includes("Research") || discipline.includes("University"))
        ? [
            { name: "Computer Science", degree: "B.S.", duration: "4 Years", fees: inStateFees },
            { name: "Business Administration", degree: "B.B.A.", duration: "4 Years", fees: inStateFees },
            { name: "Economics", degree: "B.A.", duration: "4 Years", fees: inStateFees },
            { name: "Biomedical Sciences", degree: "B.S.", duration: "4 Years", fees: inStateFees },
          ]
        : [
            { name: "Business Administration", degree: "B.B.A.", duration: "4 Years", fees: inStateFees },
            { name: "Economics", degree: "B.A.", duration: "4 Years", fees: inStateFees },
            { name: "Biomedical Sciences", degree: "B.S.", duration: "4 Years", fees: inStateFees },
            { name: "Information Technology", degree: "B.S.", duration: "4 Years", fees: inStateFees },
          ],
      placements: [
        {
          year: 2024,
          averagePackage: +(Math.max(52.0, 110.0 - (idCounter * 0.5))).toFixed(1),
          highestPackage: +(Math.max(90.0, 220.0 - (idCounter * 0.9))).toFixed(1),
          placementRate: +(Math.max(78.0, 95.0 - (idCounter * 0.14))).toFixed(1),
        },
      ],
      reviews: [
        { authorName: `Student Reviewer ${idCounter}`, rating: Math.round(ratingVal), comment: `Strong community atmosphere and engaging professors in ${city}.` },
      ],
    });

    idCounter++;
  }
}

async function main() {
  console.log(`Starting seed process for ${collegesData.length} colleges...`);

  // Realistic student reviewer accounts for genuine reviews
  const studentProfiles = [
    { name: "Aarav Sharma (B.S. Computer Science '24)", email: "aarav.sharma@alumni.edu" },
    { name: "Elena Rostova (Class of '23, Economics)", email: "elena.rostova@alumni.edu" },
    { name: "Marcus Vance (Mechanical Engineering '25)", email: "marcus.vance@student.edu" },
    { name: "Sarah Jenkins (Pre-Med Biology '24)", email: "sarah.jenkins@alumni.edu" },
    { name: "Priya Patel (Bioengineering '23)", email: "priya.patel@alumni.edu" },
    { name: "David Kim (Applied Mathematics '24)", email: "david.kim@alumni.edu" },
    { name: "Maya Lin (Class of '25, Architecture)", email: "maya.lin@student.edu" },
    { name: "Liam O'Connor (Finance & Analytics '23)", email: "liam.oconnor@alumni.edu" },
    { name: "Sophia Rodriguez (Electrical Engineering '24)", email: "sophia.rodriguez@alumni.edu" },
    { name: "Ananya Rao (Data Science '25)", email: "ananya.rao@student.edu" },
    { name: "Alexander Wright (Cognitive Science '23)", email: "alex.wright@alumni.edu" },
    { name: "Chloe Dupont (International Relations '24)", email: "chloe.dupont@alumni.edu" },
  ];

  const studentUsers = [];
  for (const s of studentProfiles) {
    const u = await prisma.user.upsert({
      where: { email: s.email },
      update: { name: s.name },
      create: {
        name: s.name,
        email: s.email,
        passwordHash: '$2a$10$demoHashedPasswordDummyStringForTestingOnly000',
      },
    });
    studentUsers.push(u);
  }

  // Ensure default demo user exists for testing
  await prisma.user.upsert({
    where: { email: 'demo@collegefinder.edu' },
    update: {},
    create: {
      name: 'Student Ambassador',
      email: 'demo@collegefinder.edu',
      passwordHash: '$2a$10$demoHashedPasswordDummyStringForTestingOnly000',
    },
  });

  let createdCount = 0;
  let courseCount = 0;
  let placementCount = 0;
  let reviewCount = 0;

  for (const c of collegesData) {
    const college = await prisma.college.upsert({
      where: { slug: c.slug },
      update: {
        name: c.name,
        city: c.city,
        state: c.state,
        location: c.location,
        description: c.description,
        fees: c.fees,
        rating: c.rating,
        type: c.type,
        campusSetting: c.campusSetting,
        nationalRanking: c.nationalRanking,
        acceptanceRate: c.acceptanceRate,
        graduationRate: c.graduationRate,
        studentBodySize: c.studentBodySize,
        studentFacultyRatio: c.studentFacultyRatio,
        inStateTuition: c.inStateTuition,
        outOfStateTuition: c.outOfStateTuition,
        avgFinancialAid: c.avgFinancialAid,
        roomAndBoard: c.roomAndBoard,
        avgSatScore: c.avgSatScore,
        avgActScore: c.avgActScore,
        avgGpa: c.avgGpa,
        applicationDeadline: c.applicationDeadline,
        websiteUrl: c.websiteUrl,
      },
      create: {
        name: c.name,
        slug: c.slug,
        city: c.city,
        state: c.state,
        location: c.location,
        description: c.description,
        fees: c.fees,
        rating: c.rating,
        type: c.type,
        campusSetting: c.campusSetting,
        nationalRanking: c.nationalRanking,
        acceptanceRate: c.acceptanceRate,
        graduationRate: c.graduationRate,
        studentBodySize: c.studentBodySize,
        studentFacultyRatio: c.studentFacultyRatio,
        inStateTuition: c.inStateTuition,
        outOfStateTuition: c.outOfStateTuition,
        avgFinancialAid: c.avgFinancialAid,
        roomAndBoard: c.roomAndBoard,
        avgSatScore: c.avgSatScore,
        avgActScore: c.avgActScore,
        avgGpa: c.avgGpa,
        applicationDeadline: c.applicationDeadline,
        websiteUrl: c.websiteUrl,
      },
    });

    createdCount++;

    // Create related courses
    for (const course of c.courses) {
      await prisma.course.create({
        data: {
          collegeId: college.id,
          name: course.name,
          degree: course.degree,
          duration: course.duration,
          fees: course.fees,
        },
      });
      courseCount++;
    }

    // Create related placements
    for (const p of c.placements) {
      await prisma.placement.create({
        data: {
          collegeId: college.id,
          averagePackage: p.averagePackage,
          highestPackage: p.highestPackage,
          placementRate: p.placementRate,
          year: p.year,
        },
      });
      placementCount++;
    }

    // Create related reviews with diverse authentic student accounts
    for (const r of c.reviews) {
      const reviewer = studentUsers[reviewCount % studentUsers.length];
      await prisma.review.create({
        data: {
          collegeId: college.id,
          userId: reviewer.id,
          rating: r.rating,
          comment: r.comment,
        },
      });
      reviewCount++;
    }
  }

  console.log('Seed completed successfully:');
  console.log(`- Colleges: ${createdCount}`);
  console.log(`- Courses: ${courseCount}`);
  console.log(`- Placements: ${placementCount}`);
  console.log(`- Reviews: ${reviewCount}`);
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
