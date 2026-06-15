export const STORAGE_KEY = "bb-next-project-calculation-demo-v4";
export const DEMO_TODAY = "2026-06-14";

export const categories = [
  "Bank",
  "মালামাল",
  "Staff",
  "Subcontractor",
  "Partners",
  "Equipment",
  "Personal Cost",
  "Others",
];

export const personalTransactionCategories = [
  "Staff",
  "Cleaner",
  "Office",
  "Utility",
  "Transport",
  "Food",
  "Personal Cost",
  "Others",
];

export const accessLevels = [
  { value: "none", label: "No access" },
  { value: "viewer", label: "Viewer" },
  { value: "editor", label: "Add Record" },
  { value: "manager", label: "Manager" },
];

function cleanItems(items) {
  return (Array.isArray(items) ? items : [])
    .map((item) => ({
      name: String(item?.name || item?.item || "").trim(),
      quantity: String(item?.quantity || "").trim(),
    }))
    .filter((item) => item.name);
}

export function makeRecord(
  id,
  projectId,
  date,
  time,
  type,
  location,
  category,
  addedBy,
  narration,
  quantity,
  price,
  depositSource = "",
  partnerId = null,
  evidence = "",
  relatedType = "",
  relatedId = null,
  relatedName = "",
  items = []
) {
  return {
    id,
    projectId,
    date,
    time,
    type,
    location,
    category,
    addedBy,
    narration,
    quantity,
    price,
    depositSource,
    partnerId,
    evidence,
    relatedType,
    relatedId,
    relatedName,
    items: cleanItems(items),
    createdAt: `${date}T${time}:00`,
  };
}

export function makePersonalTransaction(
  id,
  date,
  time,
  type,
  category,
  party,
  addedBy,
  narration,
  quantity,
  price,
  evidence = ""
) {
  return {
    id,
    date,
    time,
    type,
    category,
    party,
    addedBy,
    narration,
    quantity,
    price,
    evidence,
    createdAt: `${date}T${time}:00`,
  };
}

export function seedData() {
  return {
    version: 4,
    users: [
      {
        id: "admin",
        role: "Admin",
        name: "Admin Office",
        phone: "+8801711000001",
        title: "Owner / Admin",
        access: {},
      },
      {
        id: "manager",
        role: "Manager",
        name: "Mehedi Hasan",
        phone: "+8801711000002",
        title: "Project Manager",
        staffId: "s2",
        access: { p1: "manager", p2: "manager", p5: "editor", p7: "viewer" },
      },
      {
        id: "engineer",
        role: "Engineer",
        name: "Sadman Ahmed",
        phone: "+8801711000003",
        title: "Site Engineer",
        staffId: "s1",
        access: { p1: "editor", p3: "editor", p6: "viewer" },
      },
      {
        id: "partner",
        role: "Partner",
        name: "Rafiq Islam",
        phone: "+8801711000004",
        title: "Investment Partner",
        partnerId: "pt1",
        access: {},
      },
    ],
    staff: [
      { id: "s1", name: "Sadman Ahmed", designation: "Engineer", phone: "+8801812000011" },
      { id: "s2", name: "Mehedi Hasan", designation: "Manager", phone: "+8801812000012" },
      { id: "s3", name: "Nusrat Jahan", designation: "Engineer + Manager", phone: "+8801812000013" },
      { id: "s4", name: "Rina Akter", designation: "Engineer", phone: "+8801812000014" },
      { id: "s5", name: "Farhan Kabir", designation: "Site Engineer", phone: "+8801812000015" },
      { id: "s6", name: "Joy Das", designation: "Manager", phone: "+8801812000016" },
    ],
    partners: [
      { id: "pt1", name: "Rafiq Islam", phone: "+8801913000021" },
      { id: "pt2", name: "Nasir Uddin", phone: "+8801913000022" },
      { id: "pt3", name: "Chowdhury Holdings", phone: "+8801913000023" },
      { id: "pt4", name: "Arman Builders", phone: "+8801913000024" },
    ],
    subcontractors: [
      { id: "sc1", name: "M/S Karim Mason Team", specialty: "Masonry" },
      { id: "sc2", name: "Star Electrical Team", specialty: "Electrical" },
      { id: "sc3", name: "Delta Thai & Glass", specialty: "Interior Finishing" },
      { id: "sc4", name: "Nahar Plumbing Works", specialty: "Plumbing" },
      { id: "sc5", name: "Rahman Steel Fixers", specialty: "Steel Work" },
    ],
    projects: [
      {
        id: "p1",
        title: "Bashundhara Villa Extension",
        location: "Bashundhara R/A",
        department: "Civil",
        createdAt: "2026-04-28",
        staffIds: ["s1", "s2"],
        partnerIds: ["pt1"],
        subcontractorIds: ["sc1", "sc5"],
        status: "Active",
        lastEdited: "2026-06-14T14:25:00",
      },
      {
        id: "p2",
        title: "Mirpur Warehouse Retrofit",
        location: "Mirpur-11",
        department: "Industrial",
        createdAt: "2026-05-02",
        staffIds: ["s2", "s5"],
        partnerIds: ["pt2"],
        subcontractorIds: ["sc2", "sc5"],
        status: "Active",
        lastEdited: "2026-06-14T12:40:00",
      },
      {
        id: "p3",
        title: "Uttara Office Interior",
        location: "Uttara Sector 7",
        department: "Interior",
        createdAt: "2026-03-18",
        staffIds: ["s1", "s3"],
        partnerIds: ["pt3"],
        subcontractorIds: ["sc3", "sc2"],
        status: "Completed",
        lastEdited: "2026-06-12T17:30:00",
      },
      {
        id: "p4",
        title: "Gazipur Factory Drainage",
        location: "Gazipur",
        department: "Plumbing",
        createdAt: "2026-05-11",
        staffIds: ["s4", "s6"],
        partnerIds: ["pt4"],
        subcontractorIds: ["sc4"],
        status: "Active",
        lastEdited: "2026-06-14T11:05:00",
      },
      {
        id: "p5",
        title: "Banani Duplex Finishing",
        location: "Banani DOHS",
        department: "Finishing",
        createdAt: "2026-05-20",
        staffIds: ["s2", "s3"],
        partnerIds: ["pt1"],
        subcontractorIds: ["sc1", "sc3"],
        status: "Active",
        lastEdited: "2026-06-13T18:20:00",
      },
      {
        id: "p6",
        title: "Narayanganj Boundary Wall",
        location: "Narayanganj",
        department: "Civil",
        createdAt: "2026-05-27",
        staffIds: ["s1", "s5"],
        partnerIds: ["pt2"],
        subcontractorIds: ["sc1"],
        status: "Active",
        lastEdited: "2026-06-13T09:45:00",
      },
      {
        id: "p7",
        title: "Savar Staff Quarter Repair",
        location: "Savar",
        department: "Maintenance",
        createdAt: "2026-04-10",
        staffIds: ["s4", "s6"],
        partnerIds: [],
        subcontractorIds: ["sc4", "sc5"],
        status: "Completed",
        lastEdited: "2026-06-09T16:15:00",
      },
      {
        id: "p8",
        title: "Dhanmondi Lift Lobby Upgrade",
        location: "Dhanmondi",
        department: "Interior",
        createdAt: "2026-06-01",
        staffIds: ["s3", "s5"],
        partnerIds: ["pt3"],
        subcontractorIds: ["sc2", "sc3"],
        status: "Active",
        lastEdited: "2026-06-12T15:35:00",
      },
    ],
    records: seedRecords(),
    personalTransactions: seedPersonalTransactions(),
    partnerReturns: [
      { id: "ret1", projectId: "p1", partnerId: "pt1", amount: 50000, date: "2026-06-13" },
      { id: "ret2", projectId: "p3", partnerId: "pt3", amount: 120000, date: "2026-06-12" },
      { id: "ret3", projectId: "p5", partnerId: "pt1", amount: 25000, date: "2026-06-11" },
    ],
  };
}

function seedRecords() {
  return [
    makeRecord("r001", "p1", "2026-06-14", "09:20", "জমা", "Office", "Bank", "Admin Office", "Owner fund received through bank", "1 transfer", 300000, "Owner/Admin", null, "bank-slip-p1-0614.pdf"),
    makeRecord("r002", "p1", "2026-06-14", "10:45", "খরচ", "Side", "মালামাল", "Sadman Ahmed", "Cement and sand delivery", "100 bag", 56000, "", null, "cement-bill.jpg", "", null, "", [
      { name: "Cement", quantity: "60 bag" },
      { name: "Sand", quantity: "220 cft" },
      { name: "Brick chips", quantity: "45 cft" },
    ]),
    makeRecord("r003", "p1", "2026-06-14", "14:25", "খরচ", "Side", "Staff", "Sadman Ahmed", "Mason team advance", "8 person", 24000, "", null, "labor-advance.jpg"),
    makeRecord("r004", "p1", "2026-06-13", "11:20", "জমা", "Office", "Partners", "Rafiq Islam", "Partner জমা for slab work", "1 deposit", 150000, "Partner", "pt1", "partner-deposit-p1.pdf"),
    makeRecord("r005", "p1", "2026-06-13", "16:05", "খরচ", "Side", "Equipment", "Mehedi Hasan", "Concrete mixer rent", "1 day", 9000, "", null, "mixer-rent.jpg"),
    makeRecord("r006", "p1", "2026-06-12", "12:10", "খরচ", "Office", "Personal Cost", "Admin Office", "Lunch and local transport", "1 day", 6200),
    makeRecord("r007", "p2", "2026-06-14", "08:50", "জমা", "Office", "Bank", "Admin Office", "Initial project fund", "1 transfer", 450000, "Owner/Admin", null, "bank-slip-p2.pdf"),
    makeRecord("r008", "p2", "2026-06-14", "12:40", "খরচ", "Side", "মালামাল", "Farhan Kabir", "Steel rod delivery", "1.5 ton", 178000, "", null, "rod-bill.jpg", "", null, "", [
      { name: "10mm steel rod", quantity: "0.8 ton" },
      { name: "12mm steel rod", quantity: "0.5 ton" },
      { name: "Binding wire", quantity: "42 kg" },
    ]),
    makeRecord("r009", "p2", "2026-06-13", "15:15", "খরচ", "Side", "Subcontractor", "Mehedi Hasan", "Electrical team booking", "1 team", 35000, "", null, "electrical-advance.pdf"),
    makeRecord("r010", "p2", "2026-06-12", "10:35", "জমা", "Office", "Partners", "Nasir Uddin", "Partner investment", "1 deposit", 175000, "Partner", "pt2"),
    makeRecord("r011", "p3", "2026-06-12", "09:30", "জমা", "Office", "Bank", "Admin Office", "Final client payment", "1 transfer", 220000, "Owner/Admin", null, "final-payment.pdf"),
    makeRecord("r012", "p3", "2026-06-12", "17:30", "খরচ", "Side", "মালামাল", "Nusrat Jahan", "Glass partition final bill", "1 lot", 64000, "", null, "glass-bill.jpg", "", null, "", [
      { name: "Tempered glass", quantity: "240 sft" },
      { name: "Aluminium section", quantity: "18 pcs" },
      { name: "Silicone and fitting", quantity: "1 lot" },
    ]),
    makeRecord("r013", "p3", "2026-06-11", "13:00", "খরচ", "Office", "Others", "Admin Office", "Permit and cleaning", "1 lot", 14500),
    makeRecord("r014", "p3", "2026-06-10", "11:45", "জমা", "Office", "Partners", "Chowdhury Holdings", "Partner জমা settled", "1 deposit", 180000, "Partner", "pt3", "partner-p3.pdf"),
    makeRecord("r015", "p4", "2026-06-14", "11:05", "খরচ", "Side", "মালামাল", "Rina Akter", "PVC pipe and fittings", "82 pcs", 83000, "", null, "pipe-bill.jpg", "", null, "", [
      { name: "PVC pipe 4 inch", quantity: "42 pcs" },
      { name: "Elbow fitting", quantity: "24 pcs" },
      { name: "Drain cover", quantity: "16 pcs" },
    ]),
    makeRecord("r016", "p4", "2026-06-14", "09:10", "জমা", "Office", "Bank", "Admin Office", "Drainage work fund", "1 transfer", 260000, "Owner/Admin", null, "gazipur-bank.pdf"),
    makeRecord("r017", "p4", "2026-06-13", "10:20", "জমা", "Office", "Partners", "Arman Builders", "Partner contribution", "1 deposit", 90000, "Partner", "pt4"),
    makeRecord("r018", "p4", "2026-06-13", "18:00", "খরচ", "Side", "Staff", "Joy Das", "Night shift helper bill", "12 person", 19200, "", null, "helper-bill.jpg"),
    makeRecord("r019", "p5", "2026-06-13", "18:20", "খরচ", "Side", "Subcontractor", "Nusrat Jahan", "Thai work progress bill", "1 lot", 73000, "", null, "thai-progress.pdf"),
    makeRecord("r020", "p5", "2026-06-13", "12:10", "জমা", "Office", "Partners", "Rafiq Islam", "Partner জমা for finishing materials", "1 deposit", 120000, "Partner", "pt1", "partner-p5.jpg"),
    makeRecord("r021", "p5", "2026-06-12", "14:35", "খরচ", "Side", "মালামাল", "Mehedi Hasan", "Tiles and grout", "620 sft", 138500, "", null, "tiles-bill.jpg", "", null, "", [
      { name: "Floor tiles", quantity: "520 sft" },
      { name: "Wall tiles", quantity: "100 sft" },
      { name: "Grout and adhesive", quantity: "1 lot" },
    ]),
    makeRecord("r022", "p5", "2026-06-11", "10:00", "জমা", "Office", "Bank", "Admin Office", "Owner fund", "1 transfer", 250000),
    makeRecord("r023", "p6", "2026-06-13", "09:45", "খরচ", "Side", "মালামাল", "Sadman Ahmed", "Brick delivery", "6000 pcs", 72000, "", null, "brick-delivery.jpg", "", null, "", [
      { name: "First class brick", quantity: "4500 pcs" },
      { name: "Picked brick", quantity: "1500 pcs" },
      { name: "Unloading labour", quantity: "6 person" },
    ]),
    makeRecord("r024", "p6", "2026-06-12", "16:20", "জমা", "Office", "Partners", "Nasir Uddin", "Partner wall work investment", "1 deposit", 95000, "Partner", "pt2", "partner-p6.pdf"),
    makeRecord("r025", "p6", "2026-06-12", "09:15", "খরচ", "Side", "Equipment", "Farhan Kabir", "Excavator rent", "5 hour", 18000),
    makeRecord("r026", "p6", "2026-06-11", "12:05", "জমা", "Office", "Bank", "Admin Office", "Advance fund from owner", "1 transfer", 180000, "Owner/Admin", null, "advance-p6.pdf"),
    makeRecord("r027", "p7", "2026-06-09", "16:15", "খরচ", "Side", "মালামাল", "Rina Akter", "Repair paint and putty", "1 lot", 42000, "", null, "paint-bill.jpg", "", null, "", [
      { name: "Wall putty", quantity: "12 bag" },
      { name: "Interior paint", quantity: "8 gallon" },
      { name: "Brush and roller", quantity: "1 set" },
    ]),
    makeRecord("r028", "p7", "2026-06-09", "11:10", "জমা", "Office", "Bank", "Admin Office", "Maintenance allocation", "1 transfer", 120000),
    makeRecord("r029", "p7", "2026-06-08", "17:05", "খরচ", "Side", "Staff", "Joy Das", "Repair labor", "7 person", 17500, "", null, "repair-labor.jpg"),
    makeRecord("r030", "p8", "2026-06-12", "15:35", "খরচ", "Side", "মালামাল", "Nusrat Jahan", "Lobby wall panel", "1 lot", 86000, "", null, "panel-bill.pdf", "", null, "", [
      { name: "Wall panel board", quantity: "38 pcs" },
      { name: "Metal channel", quantity: "22 pcs" },
      { name: "Adhesive and screw", quantity: "1 lot" },
    ]),
    makeRecord("r031", "p8", "2026-06-12", "10:25", "জমা", "Office", "Partners", "Chowdhury Holdings", "Partner জমা for lift lobby", "1 deposit", 125000, "Partner", "pt3", "partner-p8.pdf"),
    makeRecord("r032", "p8", "2026-06-11", "13:50", "খরচ", "Office", "Others", "Admin Office", "Design print and approval fee", "1 lot", 9600),
    makeRecord("r033", "p8", "2026-06-10", "09:40", "জমা", "Office", "Bank", "Admin Office", "Admin project cash", "1 transfer", 160000),
    makeRecord("r034", "p2", "2026-06-11", "18:15", "খরচ", "Side", "Personal Cost", "Farhan Kabir", "Tea, transport and unloading", "1 day", 11800),
    makeRecord("r035", "p4", "2026-06-12", "15:45", "খরচ", "Side", "Equipment", "Rina Akter", "Water pump rent", "2 day", 15500, "", null, "pump-rent.jpg"),
    makeRecord("r036", "p1", "2026-06-11", "10:30", "জমা", "Office", "Bank", "Admin Office", "Additional admin cash", "1 transfer", 90000),
  ];
}

function seedPersonalTransactions() {
  return [
    makePersonalTransaction("ot001", "2026-06-14", "18:30", "খরচ", "Cleaner", "Room cleaner", "Admin Office", "Monthly cleaner payment", "1 month", 10000, "cleaner-payment-june.pdf"),
    makePersonalTransaction("ot002", "2026-06-13", "12:15", "খরচ", "Food", "Admin Office", "Admin Office", "Office lunch and tea", "1 day", 3200),
    makePersonalTransaction("ot003", "2026-06-12", "16:45", "জমা", "Office", "Admin Office", "Admin Office", "Non-project cash returned to office", "1 return", 15000),
  ];
}
