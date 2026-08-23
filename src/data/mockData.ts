import drManojKumarImg from '../assets/images/dr_manoj_kumar_1786374179949.jpg';
import {
  Publication,
  BlogPost,
  CareerMilestone,
  AcademicDegree,
  AwardItem,
  GalleryItem,
  TechnicalVertical,
  ActiveSession,
  TaskReminder,
  SystemSettings,
  TelemetryLog
} from '../types';

export const MANOJ_KUMAR_PROFILE = {
  name: "Dr. Manoj Kumar",
  title: "SENIOR SCIENTIST @ CSIR-IMMT",
  department: "Department of Materials and Metallurgical Engineering",
  institution: "CSIR - Institute of Minerals and Materials Technology (Bhubaneswar, India)",
  appointmentPeriod: "JAN 2025 - PRESENT",
  bioHeadline: "Pioneering Additive Manufacturing",
  bioDescription: "Bridging metallurgical science with advanced manufacturing. Leading researcher in process-structure-properties and high-precision laser material processing.",
  specializations: ["Metallurgy", "Laser Processing", "3D Printing"],
  heroTagline: "Advancing Metal Additive Manufacturing",
  heroDescription: "Specializing in high-performance Metal 3D printing (DED, SLM, SLS) and advanced Coating Technologies (Plasma Spray, HVOF). Engineering next-generation Superalloys, YSZ, and Intermetallic structures for extreme industrial applications.",
  avatarUrl: drManojKumarImg,
  stats: {
    yearsExperience: "15+",
    affiliation: "CSIR-IMMT",
    patentsFiled: "12",
    citations: "850+",
    totalCitationsCount: 1420,
    technicalPublicationsCount: 42,
    industrialPatentsCount: 8,
    activeProjects: 40
  },
  links: {
    orcid: "0000-0002-1825-0097",
    googleScholar: "https://scholar.google.com",
    researchGate: "https://researchgate.net",
    csirProfile: "https://immts.res.in",
    linkedIn: "https://linkedin.com"
  }
};

export const MOCK_TECHNICAL_VERTICALS: TechnicalVertical[] = [
  {
    category: "CORE SPECIALIZATION",
    title: "Metal 3D Printing & Additive Manufacturing",
    description: "Advanced research into Directed Energy Deposition (DED), Selective Laser Melting (SLM), and Selective Laser Sintering (SLS) for complex structural fabrication.",
    methods: ["DED", "SLM", "SLS", "Inconel 718", "Ti-6Al-4V"]
  },
  {
    category: "SURFACE ENGINEERING",
    title: "Coating Technologies",
    description: "Pioneering Plasma Spray, HVOF (High Velocity Oxy-Fuel), and Laser Surface Alloying (LSA) for wear and heat resistance.",
    methods: ["Plasma Spray", "HVOF", "LSA", "YSZ Thermal Barrier"]
  },
  {
    category: "ADVANCED MATERIALS",
    title: "High-Temperature Superalloys",
    description: "Development of Superalloys, Yttria-Stabilized Zirconia (YSZ), high-strength Aluminum, and complex Intermetallics for aerospace.",
    methods: ["Microstructure Analysis", "XRD Phase ID", "SEM/EBSD"]
  }
];

export const MOCK_PUBLICATIONS: Publication[] = [
  {
    id: "pub-01",
    title: "Microstructural Evolution of Ni-based Superalloys during Laser Surface Alloying (LSA)",
    type: "Journal",
    year: 2024,
    doi: "10.1016/j.surfcoat.2024.130",
    authors: "Kumar, M., & Gupta, R.",
    journal: "Surface & Coatings Tech.",
    abstract: "Investigation into the solidification kinetics and phase stability of Inconel 718 surfaces modified via high-power diode laser processing. Demonstrates 45% hardness enhancement.",
    tags: ["LSA", "Superalloys", "Laser Processing"],
    citations: 184,
    url: "https://doi.org/10.1016/j.surfcoat.2024.130"
  },
  {
    id: "pub-02",
    title: "Thermal Dynamics and Melt Pool Morphology in DED Processes",
    type: "Journal",
    year: 2024,
    doi: "10.1007/s11666-024-017",
    authors: "Kumar, M., Chen, L., & Schmidt, F.",
    journal: "J. Thermal Spray Tech.",
    abstract: "This research presents a transient thermal model for Directed Energy Deposition, analyzing the effect of laser power on melt pool stability and residual stress distribution.",
    tags: ["DED", "Additive Manufacturing", "Thermal Modeling"],
    citations: 92,
    url: "https://doi.org/10.1007/s11666-024-017"
  },
  {
    id: "pub-03",
    title: "Advanced Plasma Spray Coating Method for YSZ Thermal Barriers",
    type: "Patent",
    year: 2023,
    patentNo: "US Patent: 11,482,903 B2",
    authors: "Inventors: Kumar, M. et al.",
    journal: "USPTO Registered Patent",
    abstract: "System and method for enhancing the bond-coat adhesion and strain tolerance of Yttria-Stabilized Zirconia (YSZ) coatings on turbine blades under extreme cycles.",
    tags: ["YSZ", "Plasma Spray", "Thermal Barrier"],
    citations: 45,
    url: "https://patents.google.com"
  },
  {
    id: "pub-04",
    title: "Failure Analysis of SLM-Fabricated Tool Steels under Cyclic Loading",
    type: "Conference",
    year: 2023,
    confProc: "Proc. MS&T 2023",
    authors: "Kumar, M. & Sharma, R.",
    journal: "MS&T '23 International Conference",
    abstract: "Fractographic study and microstructural characterization of Selective Laser Melting (SLM) components under cyclic thermal-mechanical loading conditions.",
    tags: ["SLM", "Failure Analysis", "Metallurgy"],
    citations: 31,
    url: "https://mst.org"
  },
  {
    id: "pub-05",
    title: "Characterization of DED-fabricated Superalloy components for high-temperature turbine applications",
    type: "Journal",
    year: 2024,
    doi: "10.1016/j.addma.2024.104",
    authors: "Kumar, M., et al.",
    journal: "Additive Manufacturing Journal",
    abstract: "In-depth microstructural mapping and creep testing of nickel-based superalloys synthesized via high-rate DED laser powder deposition.",
    tags: ["DED", "Superalloys", "Creep Test"],
    citations: 112,
    url: "https://doi.org"
  },
  {
    id: "pub-06",
    title: "Optimization of Plasma Spray parameters for YSZ thermal barrier coatings",
    type: "Journal",
    year: 2023,
    doi: "10.1016/j.surfcoat.2023.128911",
    authors: "Kumar, M., & Sharma, R.",
    journal: "Surface & Coatings Technology (Vol 450)",
    abstract: "Factorial design of experiments analyzing torch current, gas flow velocity, and powder feed rate on phase composition and thermal conductivity.",
    tags: ["Plasma Spray", "YSZ", "Coating Integrity"],
    citations: 210,
    url: "https://doi.org"
  }
];

export const MOCK_BLOG_POSTS: BlogPost[] = [
  {
    id: "blog-01",
    logCode: "LOG_042_IMMT",
    title: "Microstructural Evolution in Metal 3D Printing",
    excerpt: "A deep dive into grain boundary dynamics and phase transformation during laser powder bed fusion (LPBF) processes at CSIR-IMMT.",
    content: "During high-energy laser powder bed fusion (LPBF), thermal gradients often exceed 10^6 K/s, creating unique non-equilibrium microstructures. In our latest laboratory runs at CSIR-IMMT, we analyzed cellular dendritic growth in Inconel 718 alloys using electron backscatter diffraction (EBSD). The resulting orientation maps reveal strong texture along the building direction, which directly correlates with anisotropic yield strength.",
    date: "MAR 12, 2024",
    status: "PUBLISHED",
    readTime: "22 MIN",
    tags: ["#METAL-3D-PRINTING", "#MICROSTRUCTURE", "#LPBF"],
    isFeatured: true
  },
  {
    id: "blog-02",
    logCode: "LOG_041_IMMT",
    title: "Thermal Spray Coating Integrity",
    excerpt: "Investigating the adhesion strength and porosity of ceramic-metal composite coatings for high-temperature wear resistance.",
    content: "HVOF and Plasma Spray techniques deposit splats that solidify rapidly upon impact. By fine-tuning feed powder preheating and particle velocity exceeding Mach 2, bond strength reached record levels of 72 MPa on nickel superalloy substrates.",
    date: "MAR 02, 2024",
    status: "PUBLISHED",
    readTime: "14 MIN",
    tags: ["#COATING-TECH", "#HVOF", "#SURFACE-ENG"]
  },
  {
    id: "blog-03",
    logCode: "LOG_040_IMMT",
    title: "Forensic Material Failure Analysis",
    excerpt: "Scanning Electron Microscopy (SEM) analysis of fatigue-induced fractures in 3D printed turbine blades.",
    content: "Fractographic evidence points to sub-surface pore initiation during rapid solidification. Implementing hot isostatic pressing (HIP) post-treatment successfully healed 98.4% of internal voids.",
    date: "FEB 28, 2024",
    status: "PUBLISHED",
    readTime: "18 MIN",
    tags: ["#FAILURE-ANALYSIS", "#SEM", "#METALLURGY"]
  },
  {
    id: "blog-04",
    logCode: "LOG_039_IMMT_INT",
    title: "Novel Sintering Parameters for Reactive Powder Alloys",
    excerpt: "Internal R&D report on high-efficiency sintering protocols for metal powders at CSIR-IMMT lab facilities.",
    content: "Controlled argon-atmosphere sintering prevents oxidation while optimizing density above 99.2% for intermetallic Titanium Aluminide compounds.",
    date: "FEB 15, 2024",
    status: "DRAFTING",
    readTime: "10 MIN",
    tags: ["#SINTERING", "#INTERMETALLICS", "#IMMT-LABS"]
  }
];

export const MOCK_CAREER_JOURNEY: CareerMilestone[] = [
  {
    period: "2025 — PRESENT",
    title: "Senior Scientist",
    institution: "CSIR-IMMT",
    description: "Leading advanced metallurgical research and industrial consulting projects in metal 3D printing and surface technology.",
    isCurrent: true
  },
  {
    period: "2021 — 2025",
    title: "Scientist",
    institution: "CSIR-IMMT",
    description: "Focused on materials processing, thermal spray coatings, and structural characterization for high-temp engineering applications."
  },
  {
    period: "2021 — 2025 (Project Lead)",
    title: "Doctoral Researcher",
    institution: "IIT Kharagpur",
    description: "Conducting high-impact research in metallurgical engineering during final tenure phases, establishing laser-cladding protocols."
  },
  {
    period: "2019",
    title: "Visiting Researcher",
    institution: "University of Warwick, UK",
    description: "International collaborative research on laser-matter interaction dynamics and ultra-fast thermal camera modeling."
  },
  {
    period: "2015 — 2016",
    title: "Assistant Professor",
    institution: "Vignan's Foundation for Science, Technology & Research",
    description: "Academic instruction and curriculum development in mechanical and materials engineering."
  },
  {
    period: "2013",
    title: "Trainee",
    institution: "M. N. Dastur & Company (P) Ltd.",
    description: "Early exposure to metallurgical consulting and industrial process design for integrated steel plants."
  }
];

export const MOCK_ACADEMIC_FOUNDATION: AcademicDegree[] = [
  {
    period: "2016 — 2021",
    degree: "Ph.D. in Metallurgical Engineering",
    institution: "Indian Institute of Technology Kharagpur",
    field: "Metallurgical & Materials Engineering",
    description: "Advanced research in laser-based additive manufacturing and metallurgical physics."
  },
  {
    period: "2010 — 2015",
    degree: "M.Tech. in Materials Engineering",
    institution: "Indian Institute of Technology Kharagpur",
    field: "Materials & Computational Thermodynamics",
    description: "Specialization in materials processing, phase equilibria, and computational thermodynamics."
  }
];

export const MOCK_AWARDS: AwardItem[] = [
  {
    year: "2023",
    title: "National Excellence in Research Medal",
    description: "Awarded for breakthrough contributions in nano-crystalline alloy structures and laser deposition physics."
  },
  {
    year: "2021",
    title: "Fulbright Academic Fellow",
    description: "International research fellowship focused on sustainable metallurgy practices at MIT Metallurgy Labs."
  },
  {
    year: "2018",
    title: "Young Scientist Award",
    description: "Recognized by the Global Science Foundation (ISCA) for early-career innovation in additive manufacturing."
  },
  {
    year: "2015",
    title: "Best Doctoral Thesis",
    description: "Comprehensive analysis of thermal degradation in aerospace composites, Indian Institute of Technology (KGP)."
  }
];

export const MOCK_GALLERY: GalleryItem[] = [
  {
    id: "gal-01",
    title: "High-precision laser cladding process",
    figureNo: "FIG 1",
    category: "Cladding",
    imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800",
    description: "Coaxial laser beam melting Inconel powder nozzle onto stainless steel substrate at CSIR-IMMT lab.",
    scaleBar: "Power: 2.4 kW | Feed: 12 g/min"
  },
  {
    id: "gal-02",
    title: "Additive Manufacturing Bed",
    category: "3D Printing",
    imageUrl: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&q=80&w=800",
    description: "Selective laser melting build chamber showing lattice grid structural build up in argon atmosphere.",
    scaleBar: "Layer thickness: 30 µm"
  },
  {
    id: "gal-03",
    title: "Alloy Microstructure Analysis",
    category: "Microstructure",
    imageUrl: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&q=80&w=800",
    description: "Optical micrograph showing gamma-double-prime precipitate phases in heat-treated superalloy.",
    scaleBar: "Mag: 500x"
  },
  {
    id: "gal-04",
    title: "Pilot Scale Reactor Setup",
    category: "Reactor",
    imageUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=800",
    description: "Hydro-metallurgical pressure leaching autoclave reactor for high-purity metal extraction.",
    scaleBar: "Temp: 350°C | Press: 40 bar"
  },
  {
    id: "gal-05",
    title: "SEM Scan - Nano-Crystalline",
    category: "SEM Scan",
    imageUrl: "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=800",
    description: "Scanning electron microscopy EBSD crystal orientation map of nanostructure grain boundary.",
    scaleBar: "SEM (SEM), 500 nm scale bar"
  }
];

export const MOCK_ACTIVE_SESSIONS: ActiveSession[] = [
  {
    id: "sess-01",
    device: "MacBook Pro 16\" (Current)",
    ip: "192.168.1.104",
    location: "Bhubaneswar, IN",
    authorizedAt: "09:41 UTC",
    isCurrent: true,
    status: 'active'
  },
  {
    id: "sess-02",
    device: "Pixel 7 Pro",
    ip: "203.0.113.42",
    location: "Cambridge, UK",
    authorizedAt: "Last active: 2h ago",
    isCurrent: false,
    status: 'idle'
  }
];

export const MOCK_TASK_REMINDERS: TaskReminder[] = [
  {
    id: "task-01",
    title: "Submit Surface Coatings Tech Paper Revision",
    category: "Paper Review",
    dueTime: "Today at 18:00 UTC",
    priority: "High",
    completed: false,
    encryptedPayload: "AES-256-GCM:7f81a9c2de..."
  },
  {
    id: "task-02",
    title: "HVOF Thermal Spray Calibration Run #14",
    category: "Lab Experiment",
    dueTime: "Tomorrow at 09:30 UTC",
    priority: "High",
    completed: false
  },
  {
    id: "task-03",
    title: "CSIR-IMMT Quarterly Research Grant Report",
    category: "Grant Update",
    dueTime: "12 Aug 2026",
    priority: "Medium",
    completed: true
  }
];

export const DEFAULT_SETTINGS: SystemSettings = {
  displayMode: 'dark',
  accentColor: 'gold',
  language: 'English (US)',
  dataRegion: 'North America (US-East)',
  currency: 'USD ($)',
  timezone: 'UTC - Coordinated Universal Time',
  typographyScale: 100,
  highContrast: false,
  screenReaderOpt: true,
  autoPlayMedia: true,
  dataSaverMode: false,
  hardwarePasskeys: true,
  twoFactorAuth: true,
  globalDnd: false,
  dndSchedule: 'Never',
  pushDms: true,
  pushMentions: true,
  pushLikes: false,
  deliveryFrequency: 'Instant',
  publicProfile: true,
  showResearchOutput: true,
  cameraAccess: false,
  microphoneAccess: false,
  offlineSyncEnabled: true,
  e2eEncryptionEnabled: true
};

export const MOCK_TELEMETRY: TelemetryLog[] = [
  {
    id: "tel-01",
    timestamp: "2026-08-07 10:42:01 UTC",
    event: "Successful local DB offline index sync (IndexedDB active)",
    type: "sync",
    status: "success"
  },
  {
    id: "tel-02",
    timestamp: "2026-08-07 09:15:44 UTC",
    event: "Security settings modified: AES-256 vault verified",
    type: "security",
    status: "success"
  },
  {
    id: "tel-03",
    timestamp: "2026-08-05 23:05:11 UTC",
    event: "Push notification alert triggered for task #01",
    type: "system",
    status: "success"
  }
];
