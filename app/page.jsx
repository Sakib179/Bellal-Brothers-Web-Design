"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BadgeDollarSign,
  Banknote,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Download,
  FileText,
  FolderKanban,
  HandCoins,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Menu,
  MoreHorizontal,
  Plus,
  Printer,
  ReceiptText,
  RefreshCcw,
  Search,
  ShieldCheck,
  Trash2,
  UploadCloud,
  UserCog,
  Users,
  X,
} from "lucide-react";
import { accessLevels, categories, DEMO_TODAY, makeRecord, seedData, STORAGE_KEY } from "@/lib/demo-data";
import {
  classNames,
  formatDate,
  formatDateTime,
  formatTime,
  groupByDate,
  money,
  nowTime,
  sortedRecords,
  todayISO,
  totalsFor,
  weekday,
} from "@/lib/format";

const navByRole = {
  Admin: [
    ["dashboard", "Dashboard", LayoutDashboard],
    ["projects", "Projects", FolderKanban],
    ["income", "জমা", ArrowUpRight],
    ["expenses", "খরচ", ArrowDownRight],
    ["reports", "Reports", BarChart3],
    ["staff", "Staff", UserCog],
    ["partners", "Partner", HandCoins],
    ["subcontractors", "Subcontractor", Building2],
    ["profile", "Profile", Users],
    ["access", "Access Control", ShieldCheck],
  ],
  Manager: [
    ["dashboard", "Dashboard", LayoutDashboard],
    ["projects", "Projects", FolderKanban],
    ["income", "জমা", ArrowUpRight],
    ["expenses", "খরচ", ArrowDownRight],
    ["reports", "Reports", BarChart3],
    ["profile", "Profile", Users],
  ],
  Engineer: [
    ["dashboard", "Dashboard", LayoutDashboard],
    ["projects", "Projects", FolderKanban],
    ["income", "জমা", ArrowUpRight],
    ["expenses", "খরচ", ArrowDownRight],
    ["reports", "Reports", BarChart3],
    ["profile", "Profile", Users],
  ],
  Partner: [
    ["dashboard", "Dashboard", LayoutDashboard],
    ["projects", "Projects", FolderKanban],
    ["income", "জমা", ArrowUpRight],
    ["partners", "Partner", HandCoins],
    ["reports", "Reports", BarChart3],
    ["profile", "Profile", Users],
  ],
};

const pageText = {
  dashboard: ["Dashboard", "Live project finance overview based on this demo role."],
  projects: ["Projects", "Project status, access, staff, partner, subcontractor, and balance."],
  income: ["জমা", "All visible deposits grouped by date and entry time."],
  expenses: ["খরচ", "All visible expenses grouped by date and entry time."],
  reports: ["Reports", "Generate project statements, category reports, and partner জমা reports."],
  staff: ["Staff", "Managers and engineers with active project coverage."],
  partners: ["Partner", "Partner investment, returned amount, and due balance."],
  subcontractors: ["Subcontractor", "Assigned subcontractors and recorded subcontractor cost."],
  profile: ["Profile", "Current role, defaults, and frontend demo controls."],
  access: ["Access Control", "Admin can decide who can see or edit each project."],
  "project-detail": ["Project Detail", "Date-wise project ledger with daily totals."],
};

const badgeTone = {
  green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  red: "border-rose-200 bg-rose-50 text-rose-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  blue: "border-sky-200 bg-sky-50 text-sky-700",
  gray: "border-slate-200 bg-slate-100 text-slate-700",
  ink: "border-slate-300 bg-white text-slate-800",
};

export default function Home() {
  const [store, setStore] = useState(() => seedData());
  const [userId, setUserId] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [projectId, setProjectId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState("");
  const [projectSearch, setProjectSearch] = useState("");
  const [projectFilters, setProjectFilters] = useState({ type: "সব", location: "সব", search: "" });
  const [ledgerSearch, setLedgerSearch] = useState({ income: "", expenses: "" });
  const [reportFilters, setReportFilters] = useState(null);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.version === 2) window.queueMicrotask(() => setStore(parsed));
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const currentUser = useMemo(() => store.users.find((user) => user.id === userId) || null, [store.users, userId]);
  const isAdmin = currentUser?.role === "Admin";

  const visibleIds = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === "Admin") return store.projects.map((project) => project.id);
    if (currentUser.role === "Partner") {
      return store.projects
        .filter((project) => project.partnerIds.includes(currentUser.partnerId))
        .map((project) => project.id);
    }
    return Object.entries(currentUser.access || {})
      .filter(([, level]) => level && level !== "none")
      .map(([id]) => id);
  }, [currentUser, store.projects]);

  function persist(nextStore) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextStore));
  }

  function commit(nextStore, message) {
    setStore(nextStore);
    persist(nextStore);
    if (message) setToast(message);
  }

  function staffName(id) {
    return store.staff.find((staff) => staff.id === id)?.name || "Unknown";
  }

  function partnerName(id) {
    return store.partners.find((partner) => partner.id === id)?.name || "No partner";
  }

  function subcontractorName(id) {
    return store.subcontractors.find((sub) => sub.id === id)?.name || "No subcontractor";
  }

  function getProject(id) {
    return store.projects.find((project) => project.id === id);
  }

  function projectRecords(id, records = store.records) {
    return records.filter((record) => record.projectId === id);
  }

  function projectTotals(id, records = store.records) {
    return totalsFor(projectRecords(id, records));
  }

  function projectLastEdited(project) {
    const latestRecord = projectRecords(project.id)
      .map((record) => `${record.date}T${record.time}:00`)
      .sort()
      .pop();
    return latestRecord && latestRecord > project.lastEdited ? latestRecord : project.lastEdited;
  }

  function sortedProjects(projects) {
    return [...projects].sort((a, b) => projectLastEdited(b).localeCompare(projectLastEdited(a)));
  }

  function visibleProjects() {
    const idSet = new Set(visibleIds);
    return sortedProjects(store.projects.filter((project) => idSet.has(project.id)));
  }

  function allVisibleRecords() {
    const idSet = new Set(visibleIds);
    return store.records.filter((record) => idSet.has(record.projectId));
  }

  function canEditProject(id) {
    if (!currentUser) return false;
    if (currentUser.role === "Admin") return true;
    if (currentUser.role === "Partner") {
      return store.projects.some((project) => project.id === id && project.partnerIds.includes(currentUser.partnerId));
    }
    return ["editor", "manager"].includes(currentUser.access?.[id]);
  }

  function canDeleteRecord(record) {
    if (!currentUser) return false;
    if (currentUser.role === "Admin") return true;
    if (!canEditProject(record.projectId)) return false;
    return currentUser.role === "Manager" || record.addedBy === currentUser.name;
  }

  function defaultLocation() {
    return currentUser?.role === "Admin" || currentUser?.role === "Partner" ? "Office" : "Side";
  }

  function partnerDepositTotal(partnerId, scopedProjectId = null) {
    return store.records
      .filter((record) => record.type === "জমা" && record.depositSource === "Partner")
      .filter((record) => record.partnerId === partnerId)
      .filter((record) => !scopedProjectId || record.projectId === scopedProjectId)
      .reduce((sum, record) => sum + Number(record.price || 0), 0);
  }

  function partnerReturnedTotal(partnerId, scopedProjectId = null) {
    return store.partnerReturns
      .filter((item) => item.partnerId === partnerId)
      .filter((item) => !scopedProjectId || item.projectId === scopedProjectId)
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }

  function projectPartnerDue(id) {
    return store.partners.reduce((sum, partner) => {
      return sum + partnerDepositTotal(partner.id, id) - partnerReturnedTotal(partner.id, id);
    }, 0);
  }

  function pageAllowed(nextPage) {
    if (!currentUser) return false;
    if (nextPage === "project-detail") return projectId && visibleIds.includes(projectId);
    return (navByRole[currentUser.role] || []).some(([id]) => id === nextPage);
  }

  function goTo(nextPage) {
    setPage(nextPage);
    if (nextPage !== "project-detail") setProjectId(null);
    setSidebarOpen(false);
  }

  useEffect(() => {
    if (!currentUser) return;
    if (!pageAllowed(page)) {
      window.queueMicrotask(() => {
        setPage("dashboard");
        setProjectId(null);
      });
    }
  }, [currentUser, page, projectId, visibleIds]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleLogin(nextUserId) {
    setUserId(nextUserId);
    setPage("dashboard");
    setProjectId(null);
    setSidebarOpen(false);
  }

  function openProject(id) {
    setProjectId(id);
    setPage("project-detail");
    setProjectFilters({ type: "সব", location: "সব", search: "" });
  }

  function matchNames(raw, collection) {
    const names = String(raw || "")
      .split(",")
      .map((name) => name.trim().toLowerCase())
      .filter(Boolean);
    return names
      .map((name) => collection.find((item) => item.name.toLowerCase() === name || item.name.toLowerCase().includes(name))?.id)
      .filter(Boolean);
  }

  function addProject(event) {
    event.preventDefault();
    if (!isAdmin) return setToast("Only Admin can add a project.");
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") || "").trim();
    const location = String(form.get("location") || "").trim();
    if (!title || !location) return setToast("Project name and location are required.");

    const nextStore = structuredClone(store);
    nextStore.projects.push({
      id: `p${Date.now()}`,
      title,
      location,
      department: String(form.get("department") || "Civil"),
      createdAt: String(form.get("createdAt") || todayISO()),
      staffIds: matchNames(form.get("staffNames"), nextStore.staff),
      partnerIds: matchNames(form.get("partnerNames"), nextStore.partners),
      subcontractorIds: matchNames(form.get("subcontractorNames"), nextStore.subcontractors),
      status: "Active",
      lastEdited: `${todayISO()}T${nowTime()}:00`,
    });
    setModal(null);
    setPage("projects");
    commit(nextStore, "Project added.");
  }

  function addRecord(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const projectName = String(data.get("projectName") || "").trim().toLowerCase();
    const project = visibleProjects().find((item) => item.title.toLowerCase() === projectName);
    if (!project) return setToast("Select a project from your accessible project list.");
    if (!canEditProject(project.id)) return setToast("You do not have add-record access for this project.");

    const type = currentUser.role === "Partner" ? "জমা" : String(data.get("type") || "খরচ");
    const depositSource = type === "জমা" ? String(data.get("depositSource") || "Owner/Admin") : "";
    const partnerInput = String(data.get("partnerName") || "").trim().toLowerCase();
    const partnerId =
      depositSource === "Partner"
        ? currentUser.role === "Partner"
          ? currentUser.partnerId
          : store.partners.find((partner) => partner.name.toLowerCase() === partnerInput || partner.name.toLowerCase().includes(partnerInput))?.id ||
            project.partnerIds[0] ||
            null
        : null;
    const date = String(data.get("date") || DEMO_TODAY);
    const time = String(data.get("time") || "10:00");
    const price = Number(data.get("price") || 0);
    const narration = String(data.get("narration") || "").trim();
    if (!narration || price <= 0) return setToast("Narration and a valid price are required.");

    const file = form.elements.evidence?.files?.[0];
    const nextStore = structuredClone(store);
    nextStore.records.push(
      makeRecord(
        `r${Date.now()}`,
        project.id,
        date,
        time,
        type,
        String(data.get("location") || defaultLocation()),
        String(data.get("category") || "Others"),
        currentUser.name,
        narration,
        String(data.get("quantity") || "").trim(),
        price,
        depositSource,
        partnerId,
        file?.name || ""
      )
    );
    const nextProject = nextStore.projects.find((item) => item.id === project.id);
    nextProject.lastEdited = `${date}T${time}:00`;
    setModal(null);
    commit(nextStore, "Record saved.");
  }

  function deleteRecord(id) {
    const record = store.records.find((item) => item.id === id);
    if (!record || !canDeleteRecord(record)) return setToast("This role cannot delete the selected record.");
    if (!window.confirm("Delete this demo record?")) return;
    const nextStore = structuredClone(store);
    nextStore.records = nextStore.records.filter((item) => item.id !== id);
    const nextProject = nextStore.projects.find((item) => item.id === record.projectId);
    const latest = nextStore.records
      .filter((item) => item.projectId === record.projectId)
      .map((item) => `${item.date}T${item.time}:00`)
      .sort()
      .pop();
    if (nextProject && latest) nextProject.lastEdited = latest;
    commit(nextStore, "Record deleted.");
  }

  function updateAccess(nextUserId, nextProjectId, level) {
    const nextStore = structuredClone(store);
    const nextUser = nextStore.users.find((item) => item.id === nextUserId);
    nextUser.access = nextUser.access || {};
    nextUser.access[nextProjectId] = level;
    commit(nextStore, "Access updated.");
  }

  function markPartnerReturned(partnerId) {
    const nextStore = structuredClone(store);
    let total = 0;
    nextStore.projects
      .filter((project) => project.partnerIds.includes(partnerId))
      .forEach((project) => {
        const due = partnerDepositTotal(partnerId, project.id) - partnerReturnedTotal(partnerId, project.id);
        if (due <= 0) return;
        total += due;
        nextStore.partnerReturns.push({
          id: `ret${Date.now()}${project.id}`,
          projectId: project.id,
          partnerId,
          amount: due,
          date: todayISO(),
        });
      });
    commit(nextStore, total ? `Returned marked for ${money(total)}.` : "No due amount found.");
  }

  function resetDemo() {
    if (!window.confirm("Reset all frontend demo data?")) return;
    const nextStore = seedData();
    setReportFilters(null);
    setProjectId(null);
    setPage("dashboard");
    commit(nextStore, "Demo data reset.");
  }

  function buildReport(filters = reportFilters) {
    if (!filters) return null;
    const idSet = new Set(visibleIds);
    const records = sortedRecords(
      store.records
        .filter((record) => idSet.has(record.projectId))
        .filter((record) => filters.projectId === "all" || record.projectId === filters.projectId)
        .filter((record) => !filters.from || record.date >= filters.from)
        .filter((record) => !filters.to || record.date <= filters.to)
        .filter((record) => filters.type === "সব" || record.type === filters.type)
        .filter((record) => filters.category === "সব" || record.category === filters.category)
        .filter((record) => filters.location === "সব" || record.location === filters.location)
        .filter((record) => filters.partnerOnly !== "yes" || (record.type === "জমা" && record.depositSource === "Partner"))
    );
    const project = filters.projectId === "all" ? null : getProject(filters.projectId);
    return {
      records,
      totals: totalsFor(records),
      subtitle: `${project?.title || "All visible projects"} · ${formatDate(filters.from)} to ${formatDate(filters.to)}`,
    };
  }

  function generateReport(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setReportFilters({
      projectId: String(data.get("projectId") || "all"),
      from: String(data.get("from") || "2026-06-01"),
      to: String(data.get("to") || DEMO_TODAY),
      type: String(data.get("type") || "সব"),
      category: String(data.get("category") || "সব"),
      location: String(data.get("location") || "সব"),
      partnerOnly: String(data.get("partnerOnly") || "no"),
    });
    setToast("Report generated.");
  }

  function downloadReport() {
    const report = buildReport();
    if (!report) return;
    const headers = ["Date", "Time", "Project", "Type", "Location", "Category", "Added By", "Narration", "Quantity", "Price", "Deposit Source", "Partner"];
    const rows = report.records.map((record) => {
      const project = getProject(record.projectId);
      return [
        record.date,
        formatTime(record.time),
        project?.title || "",
        record.type,
        record.location,
        record.category,
        record.addedBy,
        record.narration,
        record.quantity,
        record.price,
        record.depositSource,
        record.partnerId ? partnerName(record.partnerId) : "",
      ];
    });
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `project-statement-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (!currentUser) {
    return <LoginScreen store={store} onLogin={handleLogin} />;
  }

  const [title, subtitle] = page === "project-detail" && projectId ? [getProject(projectId)?.title || "Project Detail", pageText["project-detail"][1]] : pageText[page] || pageText.dashboard;

  return (
    <div className="min-h-screen" data-page={page}>
      <div
        className={classNames("fixed inset-0 z-40 bg-slate-950/35 lg:hidden", sidebarOpen ? "block" : "hidden")}
        onClick={() => setSidebarOpen(false)}
      />
      <aside
        className={classNames(
          "fixed inset-y-0 left-0 z-50 flex w-[292px] flex-col border-r border-slate-200 bg-white/95 shadow-xl backdrop-blur lg:translate-x-0 lg:shadow-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-20 items-center gap-3 border-b border-slate-200 px-5">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-slate-950 text-sm font-black text-white">BB</div>
          <div className="min-w-0">
            <p className="truncate text-base font-black text-slate-950">Bellal Brothers</p>
            <p className="truncate text-xs font-semibold text-slate-500">{currentUser.name}</p>
          </div>
        </div>
        <nav className="bb-scrollbar flex-1 overflow-y-auto p-3">
          <div className="grid gap-1">
            {navByRole[currentUser.role].map(([id, label, Icon]) => (
              <button
                type="button"
                key={id}
                onClick={() => goTo(id)}
                className={classNames(
                  "flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-bold transition",
                  page === id
                    ? "bg-slate-950 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                )}
              >
                <Icon size={18} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </nav>
        <div className="border-t border-slate-200 p-3">
          <button
            type="button"
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-black text-slate-700 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
            onClick={() => {
              setUserId(null);
              setPage("dashboard");
              setProjectId(null);
              setModal(null);
            }}
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </aside>

      <main className="min-h-screen min-w-0 lg:ml-[292px] lg:w-[calc(100vw-292px)]">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur no-print">
          <div className="flex min-h-20 items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 lg:hidden"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>
              <div className="min-w-0">
                <h1 className="truncate text-xl font-black text-slate-950 sm:text-2xl">{title}</h1>
                <p className="mt-1 line-clamp-2 text-sm font-medium text-slate-500">{subtitle}</p>
              </div>
            </div>
            <div className="hidden items-center gap-2 md:flex">
              <button type="button" onClick={() => setModal({ type: "record" })} className="bb-btn-primary">
                <Plus size={17} />
                Add record
              </button>
            </div>
          </div>
        </header>
        <div className="mx-auto min-w-0 max-w-[1560px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">{renderPage()}</div>
      </main>

      {modal && renderModal()}
      {toast && (
        <div className="fixed bottom-4 right-4 z-[80] max-w-[calc(100vw-2rem)] rounded-lg bg-slate-950 px-4 py-3 text-sm font-bold text-white shadow-2xl">
          {toast}
        </div>
      )}
    </div>
  );

  function renderPage() {
    if (page === "dashboard") return <DashboardPage />;
    if (page === "projects") return <ProjectsPage />;
    if (page === "project-detail") return <ProjectDetailPage />;
    if (page === "income") return <LedgerPage type="জমা" />;
    if (page === "expenses") return <LedgerPage type="খরচ" />;
    if (page === "reports") return <ReportsPage />;
    if (page === "staff") return <StaffPage />;
    if (page === "partners") return <PartnersPage />;
    if (page === "subcontractors") return <SubcontractorsPage />;
    if (page === "profile") return <ProfilePage />;
    if (page === "access") return <AccessPage />;
    return <DashboardPage />;
  }

  function DashboardPage() {
    const projects = visibleProjects();
    const records = allVisibleRecords();
    const totals = totalsFor(records);
    const active = projects.filter((project) => project.status === "Active").length;
    const todaysRecords = records.filter((record) => record.date === DEMO_TODAY);
    const todaysTotals = totalsFor(todaysRecords);
    const recent = sortedRecords(records).slice(0, 8);
    const chartProjects = projects.slice(0, 6);
    const maxBalance = Math.max(...chartProjects.map((project) => Math.abs(projectTotals(project.id).balance)), 1);
    const partnerDue =
      currentUser.role === "Partner"
        ? partnerDepositTotal(currentUser.partnerId) - partnerReturnedTotal(currentUser.partnerId)
        : store.partners.reduce((sum, partner) => sum + partnerDepositTotal(partner.id) - partnerReturnedTotal(partner.id), 0);

    return (
      <div className="grid min-w-0 gap-5">
        <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Visible projects" value={projects.length} helper={`${active} active now`} icon={FolderKanban} tone="blue" />
          <MetricCard label="মোট জমা" value={money(totals.income)} helper="All visible deposits" icon={ArrowUpRight} tone="green" />
          <MetricCard label="মোট খরচ" value={money(totals.expense)} helper="All visible expenses" icon={ArrowDownRight} tone="red" />
          <MetricCard label="Balance" value={money(totals.balance)} helper={`Today ${money(todaysTotals.balance)}`} icon={BadgeDollarSign} tone="amber" />
        </div>

        <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(330px,0.65fr)]">
          <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <SectionHead
              title="Project balance"
              subtitle="The longest bars are the projects needing attention."
              action={
                <button type="button" className="bb-btn-secondary" onClick={() => goTo("projects")}>
                  View projects
                  <ArrowRight size={16} />
                </button>
              }
            />
            <div className="mt-4 grid gap-3">
              {chartProjects.map((project) => {
                const totals = projectTotals(project.id);
                const width = Math.max(8, Math.round((Math.abs(totals.balance) / maxBalance) * 100));
                return (
                  <button
                    type="button"
                    key={project.id}
                    onClick={() => openProject(project.id)}
                    className="grid gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-3 text-left hover:border-teal-200 hover:bg-teal-50/50 sm:grid-cols-[190px_minmax(0,1fr)_120px] sm:items-center"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-slate-900">{project.title}</p>
                      <p className="mt-1 truncate text-xs font-semibold text-slate-500">{project.location}</p>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-white ring-1 ring-slate-200">
                      <div className="h-full rounded-full bg-teal-600" style={{ width: `${width}%` }} />
                    </div>
                    <p className={classNames("text-sm font-black sm:text-right", totals.balance >= 0 ? "text-emerald-700" : "text-rose-700")}>
                      {money(totals.balance)}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <SectionHead title="Quick actions" subtitle="All actions update frontend demo data." />
            <div className="mt-4 grid gap-3">
              {isAdmin && (
                <ActionButton icon={FolderKanban} title="Add project" text="Create a new project with optional staff and partner." onClick={() => setModal({ type: "project" })} />
              )}
              <ActionButton icon={ReceiptText} title="Add record" text="Add জমা or খরচ with file-name evidence." onClick={() => setModal({ type: "record" })} />
              <ActionButton icon={BarChart3} title="Generate report" text="Build filtered statements and partner জমা report." onClick={() => goTo("reports")} />
              {isAdmin && <ActionButton icon={ShieldCheck} title="Access matrix" text="Control project permissions by user." onClick={() => goTo("access")} />}
            </div>
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs font-bold uppercase text-amber-700">Partner due</p>
              <p className="mt-1 text-2xl font-black text-amber-900">{money(partnerDue)}</p>
            </div>
          </section>
        </div>

        <section className="min-w-0 rounded-lg border border-slate-200 bg-white shadow-sm">
          <TableHeader title="Recent entries" subtitle="Latest project records by date and time." />
          <RecordTable records={recent} showProject />
          <RecordCards records={recent} showProject />
        </section>
      </div>
    );
  }

  function ProjectsPage() {
    const projects = visibleProjects().filter((project) => {
      const query = projectSearch.trim().toLowerCase();
      if (!query) return true;
      return [
        project.title,
        project.location,
        project.department,
        project.staffIds.map(staffName).join(" "),
        project.partnerIds.map(partnerName).join(" "),
        project.subcontractorIds.map(subcontractorName).join(" "),
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
    const totals = totalsFor(projects.flatMap((project) => projectRecords(project.id)));
    const active = projects.filter((project) => project.status === "Active").length;

    return (
      <div className="grid min-w-0 gap-5">
        <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Projects" value={projects.length} helper="Visible in this role" icon={FolderKanban} tone="blue" />
          <MetricCard label="Active now" value={active} helper="Sorted by last edit" icon={CheckCircle2} tone="green" />
          <MetricCard label="জমা" value={money(totals.income)} helper="Across listed projects" icon={ArrowUpRight} tone="green" />
          <MetricCard label="Balance" value={money(totals.balance)} helper="জমা - খরচ" icon={BadgeDollarSign} tone="amber" />
        </div>

        <section className="min-w-0 rounded-lg border border-slate-200 bg-white shadow-sm">
          <TableHeader
            title="Project list"
            subtitle="Finance, people, status, and quick project detail access."
            action={
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <SearchBox value={projectSearch} onChange={setProjectSearch} placeholder="Search project, staff, partner" />
                {isAdmin && (
                  <button type="button" className="bb-btn-primary" onClick={() => setModal({ type: "project" })}>
                    <Plus size={17} />
                    Add project
                  </button>
                )}
              </div>
            }
          />
          <ProjectTable projects={projects} />
          <ProjectCards projects={projects} />
        </section>
      </div>
    );
  }

  function ProjectDetailPage() {
    const project = getProject(projectId);
    if (!project) return <EmptyState title="Project not found" />;
    const totals = projectTotals(project.id);
    const records = sortedRecords(projectRecords(project.id)).filter((record) => {
      const query = projectFilters.search.trim().toLowerCase();
      const text = [record.category, record.addedBy, record.narration, record.quantity, record.price].join(" ").toLowerCase();
      return (
        (projectFilters.type === "সব" || record.type === projectFilters.type) &&
        (projectFilters.location === "সব" || record.location === projectFilters.location) &&
        (!query || text.includes(query))
      );
    });

    return (
      <div className="grid min-w-0 gap-5">
        <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <button type="button" onClick={() => goTo("projects")} className="mb-4 inline-flex items-center gap-2 text-sm font-black text-slate-600 hover:text-slate-950">
            <ArrowLeft size={16} />
            Back to projects
          </button>
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
            <div>
              <h2 className="text-2xl font-black text-slate-950 sm:text-3xl">{project.title}</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge tone="ink" icon={CalendarDays}>
                  Created {formatDate(project.createdAt)}
                </Badge>
                <Badge tone="blue" icon={Building2}>
                  {project.location}
                </Badge>
                <Badge tone="amber" icon={BriefcaseBusiness}>
                  {project.department}
                </Badge>
                <Badge tone={project.status === "Active" ? "green" : "gray"} icon={CheckCircle2}>
                  {project.status}
                </Badge>
              </div>
              <p className="mt-3 text-sm font-medium text-slate-500">
                Staff: {project.staffIds.map(staffName).join(", ") || "Optional"} · Partner: {project.partnerIds.map(partnerName).join(", ") || "No partner"}
              </p>
            </div>
            {canEditProject(project.id) && (
              <button type="button" className="bb-btn-primary" onClick={() => setModal({ type: "record", projectId: project.id })}>
                <Plus size={17} />
                Add record
              </button>
            )}
          </div>
        </section>

        <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Project জমা" value={money(totals.income)} helper="All deposits" icon={ArrowUpRight} tone="green" />
          <MetricCard label="Project খরচ" value={money(totals.expense)} helper="All expenses" icon={ArrowDownRight} tone="red" />
          <MetricCard label="Total balance" value={money(totals.balance)} helper="জমা - খরচ" icon={BadgeDollarSign} tone="amber" />
          <MetricCard label="Partner due" value={money(projectPartnerDue(project.id))} helper="Partner জমা minus returned" icon={HandCoins} tone="blue" />
        </div>

        <section className="min-w-0 rounded-lg border border-slate-200 bg-white shadow-sm">
          <TableHeader
            title="Project ledger"
            subtitle="Date-wise table with daily জমা, খরচ, and balance totals."
            action={
              <div className="grid w-full gap-2 xl:w-auto xl:grid-flow-col xl:items-center">
                <Segment
                  value={projectFilters.type}
                  options={["সব", "জমা", "খরচ"]}
                  onChange={(value) => setProjectFilters((prev) => ({ ...prev, type: value }))}
                />
                <Segment
                  value={projectFilters.location}
                  options={["সব", "Side", "Office"]}
                  onChange={(value) => setProjectFilters((prev) => ({ ...prev, location: value }))}
                />
                <SearchBox
                  value={projectFilters.search}
                  onChange={(value) => setProjectFilters((prev) => ({ ...prev, search: value }))}
                  placeholder="Search narration, category"
                />
              </div>
            }
          />
          <ProjectLedgerTable records={records} />
          <ProjectLedgerCards records={records} />
        </section>
      </div>
    );
  }

  function LedgerPage({ type }) {
    const key = type === "জমা" ? "income" : "expenses";
    const query = ledgerSearch[key].trim().toLowerCase();
    const records = sortedRecords(
      allVisibleRecords()
        .filter((record) => record.type === type)
        .filter((record) => {
          const project = getProject(record.projectId);
          return [
            project?.title,
            project?.location,
            record.location,
            record.category,
            record.addedBy,
            record.narration,
            record.quantity,
            record.price,
            record.depositSource,
            record.partnerId ? partnerName(record.partnerId) : "",
          ]
            .join(" ")
            .toLowerCase()
            .includes(query);
        })
    );
    const total = records.reduce((sum, record) => sum + Number(record.price || 0), 0);
    const todayTotal = records.filter((record) => record.date === DEMO_TODAY).reduce((sum, record) => sum + Number(record.price || 0), 0);
    const officeTotal = records.filter((record) => record.location === "Office").reduce((sum, record) => sum + Number(record.price || 0), 0);
    const sideTotal = records.filter((record) => record.location === "Side").reduce((sum, record) => sum + Number(record.price || 0), 0);

    return (
      <div className="grid min-w-0 gap-5">
        <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label={`Overall ${type}`} value={money(total)} helper={`${records.length} visible records`} icon={type === "জমা" ? ArrowUpRight : ArrowDownRight} tone={type === "জমা" ? "green" : "red"} />
          <MetricCard label="Today" value={money(todayTotal)} helper={formatDate(DEMO_TODAY)} icon={CalendarDays} tone="blue" />
          <MetricCard label="Office" value={money(officeTotal)} helper="Office entries" icon={Banknote} tone="amber" />
          <MetricCard label="Side" value={money(sideTotal)} helper="Site entries" icon={Building2} tone="blue" />
        </div>

        <section className="min-w-0 rounded-lg border border-slate-200 bg-white shadow-sm">
          <TableHeader
            title={`${type} records date wise`}
            subtitle="Project, location, category, added by/time, narration, evidence, and delete action."
            action={
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <SearchBox
                  value={ledgerSearch[key]}
                  onChange={(value) => setLedgerSearch((prev) => ({ ...prev, [key]: value }))}
                  placeholder="Search project, category, narration"
                />
                <button type="button" className="bb-btn-primary" onClick={() => setModal({ type: "record", recordType: type })}>
                  <Plus size={17} />
                  Add {type}
                </button>
              </div>
            }
          />
          <GroupedLedgerTable records={records} />
          <GroupedLedgerCards records={records} />
        </section>
      </div>
    );
  }

  function ReportsPage() {
    const projects = visibleProjects();
    const filters =
      reportFilters || {
        projectId: "all",
        type: "সব",
        from: "2026-06-01",
        to: DEMO_TODAY,
        category: "সব",
        location: "সব",
        partnerOnly: "no",
      };
    const report = buildReport(filters);

    return (
      <div className="grid min-w-0 gap-5">
        <form onSubmit={generateReport} className="mx-auto w-full max-w-5xl min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <SectionHead title="Statement builder" subtitle="Use these controls to generate costing and partner reports." />
          <div className="mt-4 grid gap-4">
            <Field label="Project">
              <select name="projectId" defaultValue={filters.projectId} className="bb-input">
                <option value="all">All visible projects</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="From">
                <input name="from" type="date" defaultValue={filters.from} className="bb-input" />
              </Field>
              <Field label="To">
                <input name="to" type="date" defaultValue={filters.to} className="bb-input" />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Type">
                <select name="type" defaultValue={filters.type} className="bb-input">
                  <option value="সব">সব</option>
                  <option value="জমা">Only জমা</option>
                  <option value="খরচ">Only খরচ</option>
                </select>
              </Field>
              <Field label="Location">
                <select name="location" defaultValue={filters.location} className="bb-input">
                  <option value="সব">সব</option>
                  <option value="Office">Office</option>
                  <option value="Side">Side</option>
                </select>
              </Field>
            </div>
            <Field label="Category">
              <select name="category" defaultValue={filters.category} className="bb-input">
                <option value="সব">সব category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Partner report">
              <select name="partnerOnly" defaultValue={filters.partnerOnly} className="bb-input">
                <option value="no">All records</option>
                <option value="yes">Only partner জমা</option>
              </select>
            </Field>
            <button type="submit" className="bb-btn-primary w-full">
              <BarChart3 size={17} />
              Generate report
            </button>
          </div>
        </form>

        <section className="min-w-0 rounded-lg border border-slate-200 bg-white shadow-sm print-surface">
          <TableHeader
            title="Report preview"
            subtitle={reportFilters ? report.subtitle : "Generate a report to preview the statement."}
            action={
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <button type="button" className="bb-btn-secondary" disabled={!reportFilters} onClick={downloadReport}>
                  <Download size={17} />
                  CSV
                </button>
                <button type="button" className="bb-btn-secondary" disabled={!reportFilters} onClick={() => window.print()}>
                  <Printer size={17} />
                  Print / PDF
                </button>
              </div>
            }
          />
          {reportFilters ? (
            <div className="p-4 pt-0">
              <div className="mb-4 grid gap-3 md:grid-cols-4">
                <MiniStat label="Records" value={report.records.length} />
                <MiniStat label="জমা" value={money(report.totals.income)} tone="green" />
                <MiniStat label="খরচ" value={money(report.totals.expense)} tone="red" />
                <MiniStat label="Balance" value={money(report.totals.balance)} tone={report.totals.balance >= 0 ? "green" : "red"} />
              </div>
              <RecordTable records={report.records} showProject />
              <RecordCards records={report.records} showProject />
            </div>
          ) : (
            <EmptyState title="No report generated" text="Choose filters and press Generate report." />
          )}
        </section>
      </div>
    );
  }

  function StaffPage() {
    const idSet = new Set(visibleIds);
    const rows = store.staff.map((staff) => {
      const assigned = store.projects.filter((project) => project.staffIds.includes(staff.id));
      const visibleAssigned = isAdmin ? assigned : assigned.filter((project) => idSet.has(project.id));
      return {
        staff,
        assigned: visibleAssigned,
        active: visibleAssigned.filter((project) => project.status === "Active"),
      };
    });
    return (
      <section className="min-w-0 rounded-lg border border-slate-200 bg-white shadow-sm">
        <TableHeader title="Staff list" subtitle="Designation, assigned count, and active project names." />
        <div className="bb-scrollbar overflow-x-auto p-4 pt-0">
          <table className="min-w-[850px] w-full text-left text-sm">
            <thead className="text-xs font-black uppercase text-slate-500">
              <tr>
                <th className="py-3 pr-4">Name</th>
                <th className="py-3 pr-4">Designation</th>
                <th className="py-3 pr-4">Assigned</th>
                <th className="py-3 pr-4">Active projects</th>
                <th className="py-3 pr-4">Phone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map(({ staff, assigned, active }) => (
                <tr key={staff.id}>
                  <td className="py-4 pr-4 font-black text-slate-950">{staff.name}</td>
                  <td className="py-4 pr-4 text-slate-600">{staff.designation}</td>
                  <td className="py-4 pr-4 text-slate-700">{assigned.length}</td>
                  <td className="py-4 pr-4">
                    <div className="flex flex-wrap gap-2">
                      {active.length ? active.map((project) => <Badge key={project.id}>{project.title}</Badge>) : <span className="text-slate-400">No active project</span>}
                    </div>
                  </td>
                  <td className="py-4 pr-4 text-slate-600">{staff.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  function PartnersPage() {
    const partners = isAdmin ? store.partners : store.partners.filter((partner) => partner.id === currentUser.partnerId);
    return (
      <section className="min-w-0 rounded-lg border border-slate-200 bg-white shadow-sm">
        <TableHeader title="Partner investment" subtitle="Co-worked projects, deposited money, returned amount, and due balance." />
        <div className="bb-scrollbar overflow-x-auto p-4 pt-0">
          <table className="min-w-[900px] w-full text-left text-sm">
            <thead className="text-xs font-black uppercase text-slate-500">
              <tr>
                <th className="py-3 pr-4">Partner</th>
                <th className="py-3 pr-4">Co-worked projects</th>
                <th className="py-3 pr-4 text-right">জমা</th>
                <th className="py-3 pr-4 text-right">Returned</th>
                <th className="py-3 pr-4 text-right">Due</th>
                <th className="py-3 pr-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {partners.map((partner) => {
                const projects = store.projects.filter((project) => project.partnerIds.includes(partner.id));
                const deposit = partnerDepositTotal(partner.id);
                const returned = partnerReturnedTotal(partner.id);
                const due = deposit - returned;
                return (
                  <tr key={partner.id}>
                    <td className="py-4 pr-4">
                      <p className="font-black text-slate-950">{partner.name}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">{partner.phone}</p>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex flex-wrap gap-2">
                        {projects.map((project) => (
                          <Badge key={project.id} tone="blue">
                            {project.title}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-right font-black text-emerald-700">{money(deposit)}</td>
                    <td className="py-4 pr-4 text-right font-black text-slate-700">{money(returned)}</td>
                    <td className={classNames("py-4 pr-4 text-right font-black", due > 0 ? "text-rose-700" : "text-emerald-700")}>{money(due)}</td>
                    <td className="py-4 pr-4 text-right">
                      {isAdmin && due > 0 ? (
                        <button type="button" className="bb-btn-secondary ml-auto" onClick={() => markPartnerReturned(partner.id)}>
                          <HandCoins size={16} />
                          Mark returned
                        </button>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  function SubcontractorsPage() {
    const idSet = new Set(visibleIds);
    const rows = store.subcontractors.map((sub) => {
      const projects = store.projects
        .filter((project) => project.subcontractorIds.includes(sub.id))
        .filter((project) => isAdmin || idSet.has(project.id));
      const active = projects.filter((project) => project.status === "Active");
      const cost = store.records
        .filter((record) => record.category === "Subcontractor")
        .filter((record) => projects.some((project) => project.id === record.projectId))
        .reduce((sum, record) => sum + Number(record.price || 0), 0);
      return { sub, projects, active, cost };
    });

    return (
      <section className="min-w-0 rounded-lg border border-slate-200 bg-white shadow-sm">
        <TableHeader title="Subcontractor list" subtitle="Assigned projects, active count, specialty, and recorded cost." />
        <div className="bb-scrollbar overflow-x-auto p-4 pt-0">
          <table className="min-w-[850px] w-full text-left text-sm">
            <thead className="text-xs font-black uppercase text-slate-500">
              <tr>
                <th className="py-3 pr-4">Name</th>
                <th className="py-3 pr-4">Specialty</th>
                <th className="py-3 pr-4">Projects</th>
                <th className="py-3 pr-4">Active</th>
                <th className="py-3 pr-4 text-right">Recorded cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map(({ sub, projects, active, cost }) => (
                <tr key={sub.id}>
                  <td className="py-4 pr-4 font-black text-slate-950">{sub.name}</td>
                  <td className="py-4 pr-4 text-slate-600">{sub.specialty}</td>
                  <td className="py-4 pr-4">
                    <div className="flex flex-wrap gap-2">
                      {projects.length ? projects.map((project) => <Badge key={project.id}>{project.title}</Badge>) : <span className="text-slate-400">No visible project</span>}
                    </div>
                  </td>
                  <td className="py-4 pr-4 text-slate-700">{active.length}</td>
                  <td className="py-4 pr-4 text-right font-black text-rose-700">{money(cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  function ProfilePage() {
    const projects = visibleProjects();
    const totals = totalsFor(allVisibleRecords());
    return (
      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(320px,0.42fr)_minmax(0,1fr)]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid h-16 w-16 place-items-center rounded-lg bg-slate-950 text-xl font-black text-white">
            {currentUser.name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)}
          </div>
          <h2 className="mt-4 text-2xl font-black text-slate-950">{currentUser.name}</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">{currentUser.title}</p>
          <div className="mt-5 divide-y divide-slate-100">
            <Definition label="Role" value={currentUser.role} />
            <Definition label="Phone" value={currentUser.phone} />
            <Definition label="Visible projects" value={projects.length} />
            <Definition label="Default location" value={defaultLocation()} />
            <Definition label="Visible balance" value={money(totals.balance)} />
          </div>
        </section>
        <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <SectionHead title="Demo controls" subtitle="The project has no backend; these actions are stored in browser localStorage." />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ActionButton icon={ReceiptText} title="Add record" text="Create a role-based record entry." onClick={() => setModal({ type: "record" })} />
            <ActionButton icon={BarChart3} title="Open reports" text="Generate a filtered project statement." onClick={() => goTo("reports")} />
            {isAdmin && <ActionButton icon={ShieldCheck} title="Access control" text="Adjust project-level permission." onClick={() => goTo("access")} />}
            <ActionButton icon={RefreshCcw} title="Reset demo" text="Restore original dummy data." onClick={resetDemo} />
          </div>
        </section>
      </div>
    );
  }

  function AccessPage() {
    if (!isAdmin) return <EmptyState title="Only Admin can use access control" />;
    const staffUsers = store.users.filter((user) => ["Manager", "Engineer"].includes(user.role));
    return (
      <div className="grid min-w-0 gap-5">
        <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <SectionHead title="Permission meaning" subtitle="No access hides the project. Viewer can see only. Add Record can enter daily records. Manager can add records and delete own/team records." />
          <div className="mt-4 flex flex-wrap gap-2">
            {accessLevels.map((level) => (
              <Badge key={level.value} tone={level.value === "manager" ? "green" : level.value === "editor" ? "blue" : level.value === "viewer" ? "amber" : "gray"}>
                {level.label}
              </Badge>
            ))}
          </div>
        </section>
        <section className="min-w-0 rounded-lg border border-slate-200 bg-white shadow-sm">
          <TableHeader title="Project access matrix" subtitle="Change any selector and the role preview updates immediately." />
          <div className="grid gap-3 p-4 pt-0">
            {staffUsers.flatMap((user) =>
              store.projects.map((project) => (
                <div key={`${user.id}-${project.id}`} className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 lg:grid-cols-[220px_minmax(0,1fr)_190px] lg:items-center">
                  <div>
                    <p className="font-black text-slate-950">{user.name}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">{user.role}</p>
                  </div>
                  <div>
                    <p className="font-black text-slate-800">{project.title}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {project.location} · {project.status}
                    </p>
                  </div>
                  <select value={user.access?.[project.id] || "none"} onChange={(event) => updateAccess(user.id, project.id, event.target.value)} className="bb-input bg-white">
                    {accessLevels.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    );
  }

  function renderModal() {
    if (modal.type === "project") return <ProjectModal />;
    if (modal.type === "record") return <RecordModal />;
    if (modal.type === "evidence") return <EvidenceModal />;
    return null;
  }

  function ProjectModal() {
    return (
      <Modal title="Add new project" onClose={() => setModal(null)}>
        <form onSubmit={addProject} className="grid gap-4">
          <Datalists />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Project name">
              <input name="title" required className="bb-input" placeholder="Project title" />
            </Field>
            <Field label="Location">
              <input name="location" required className="bb-input" placeholder="Area or site location" />
            </Field>
            <Field label="Department">
              <select name="department" className="bb-input" defaultValue="Civil">
                {["Civil", "Industrial", "Interior", "Electrical", "Plumbing", "Finishing", "Maintenance"].map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Creating date">
              <input name="createdAt" value={todayISO()} readOnly className="bb-input bg-slate-50" />
            </Field>
          </div>
          <Field label="Staff optional" hint="Comma separated; suggestions come from the demo staff list.">
            <input name="staffNames" list="staff-options" className="bb-input" placeholder="Sadman Ahmed, Mehedi Hasan" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Partner optional">
              <input name="partnerNames" list="partner-options" className="bb-input" placeholder="Start typing partner name" />
            </Field>
            <Field label="Subcontractor optional">
              <input name="subcontractorNames" list="subcontractor-options" className="bb-input" placeholder="Start typing subcontractor name" />
            </Field>
          </div>
          <ModalActions onClose={() => setModal(null)} submitLabel="Add project" />
        </form>
      </Modal>
    );
  }

  function RecordModal() {
    const editableProjects = visibleProjects().filter((project) => canEditProject(project.id));
    const presetProject = modal.projectId ? getProject(modal.projectId) : null;
    const presetType = currentUser.role === "Partner" ? "জমা" : modal.recordType || "খরচ";
    const partnerUser = currentUser.role === "Partner";

    return (
      <Modal title="Add জমা / খরচ record" onClose={() => setModal(null)} wide>
        <form onSubmit={addRecord} className="grid gap-4">
          <Datalists />
          <Field label="Project name">
            <input name="projectName" list="project-options" required defaultValue={presetProject?.title || ""} className="bb-input" placeholder="Start typing project name" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Type">
              {partnerUser ? (
                <>
                  <input value="জমা" disabled className="bb-input bg-slate-50" />
                  <input type="hidden" name="type" value="জমা" />
                </>
              ) : (
                <select name="type" defaultValue={presetType} className="bb-input">
                  <option value="জমা">জমা</option>
                  <option value="খরচ">খরচ</option>
                </select>
              )}
            </Field>
            <Field label="Location">
              <select name="location" defaultValue={defaultLocation()} className="bb-input">
                <option value="Office">Office</option>
                <option value="Side">Side</option>
              </select>
            </Field>
            <Field label="Date">
              <input type="date" name="date" defaultValue={todayISO()} required className="bb-input" />
            </Field>
            <Field label="Time">
              <input type="time" name="time" defaultValue={nowTime()} required className="bb-input" />
            </Field>
            <Field label="Category">
              <select name="category" defaultValue={partnerUser ? "Partners" : "মালামাল"} className="bb-input">
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="জমা source">
              {partnerUser ? (
                <>
                  <input value="Partner" disabled className="bb-input bg-slate-50" />
                  <input type="hidden" name="depositSource" value="Partner" />
                </>
              ) : (
                <select name="depositSource" defaultValue="Owner/Admin" className="bb-input">
                  <option value="Owner/Admin">Owner/Admin</option>
                  <option value="Partner">Partner</option>
                </select>
              )}
            </Field>
            <Field label="Partner name for partner জমা">
              <input name="partnerName" list="partner-options" defaultValue={partnerUser ? partnerName(currentUser.partnerId) : ""} className="bb-input" placeholder="Optional unless source is Partner" />
            </Field>
            <Field label="Quantity optional">
              <input name="quantity" className="bb-input" placeholder="100 bag, 1 day, blank if not countable" />
            </Field>
          </div>
          <Field label="Price">
            <input name="price" type="number" min="0" step="1" required className="bb-input" placeholder="Amount in BDT" />
          </Field>
          <Field label="Narration">
            <textarea name="narration" required className="bb-input min-h-24 resize-y" placeholder="Write what happened in this entry" />
          </Field>
          <Field label="PDF/Image evidence" hint="Frontend demo stores the file name only.">
            <label className="flex min-h-24 cursor-pointer items-center justify-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 text-sm font-bold text-slate-500 hover:border-teal-300 hover:bg-teal-50">
              <UploadCloud size={20} />
              <span>Select PDF/image evidence</span>
              <input name="evidence" type="file" accept="image/*,.pdf" className="sr-only" />
            </label>
          </Field>
          {!editableProjects.length && <EmptyState title="No editable project" text="This role currently has no project with add-record access." compact />}
          <ModalActions onClose={() => setModal(null)} submitLabel="Save record" disabled={!editableProjects.length} />
        </form>
      </Modal>
    );
  }

  function EvidenceModal() {
    const record = store.records.find((item) => item.id === modal.recordId);
    const project = record ? getProject(record.projectId) : null;
    return (
      <Modal title="Evidence" onClose={() => setModal(null)}>
        {record ? (
          <div className="grid gap-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <Definition label="Project" value={project?.title || "Unknown"} />
              <Definition label="Record" value={`${record.type} · ${money(record.price)}`} />
              <Definition label="Date" value={`${formatDate(record.date)} ${formatTime(record.time)}`} />
              <Definition label="File" value={record.evidence || "No file attached"} />
            </div>
            <EmptyState
              title={record.evidence ? "Evidence preview placeholder" : "No evidence attached"}
              text={record.evidence ? "In the backend version this will open the uploaded PDF or image." : "This demo record has no file name."}
              compact
            />
            <button type="button" className="bb-btn-primary ml-auto" onClick={() => setModal(null)}>
              Done
            </button>
          </div>
        ) : (
          <EmptyState title="Record not found" />
        )}
      </Modal>
    );
  }

  function Datalists() {
    return (
      <>
        <datalist id="staff-options">
          {store.staff.map((item) => (
            <option key={item.id} value={item.name} />
          ))}
        </datalist>
        <datalist id="partner-options">
          {store.partners.map((item) => (
            <option key={item.id} value={item.name} />
          ))}
        </datalist>
        <datalist id="subcontractor-options">
          {store.subcontractors.map((item) => (
            <option key={item.id} value={item.name} />
          ))}
        </datalist>
        <datalist id="project-options">
          {visibleProjects().map((item) => (
            <option key={item.id} value={item.title} />
          ))}
        </datalist>
      </>
    );
  }

  function ProjectTable({ projects }) {
    if (!projects.length) return <EmptyState title="No project found" compact />;
    return (
      <div className="bb-scrollbar hidden overflow-x-auto p-4 pt-0 lg:block">
        <table className="min-w-[1040px] w-full text-left text-sm">
          <thead className="text-xs font-black uppercase text-slate-500">
            <tr>
              <th className="py-3 pr-4">Project title</th>
              <th className="py-3 pr-4">Assigned staff</th>
              <th className="py-3 pr-4">Partner / Subcontractor</th>
              <th className="py-3 pr-4">Last edited</th>
              <th className="py-3 pr-4">জমা / খরচ / Balance</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 text-right">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {projects.map((project) => {
              const totals = projectTotals(project.id);
              return (
                <tr key={project.id} className="align-top">
                  <td className="py-4 pr-4">
                    <p className="font-black text-slate-950">{project.title}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {project.location} · {project.department} · Created {formatDate(project.createdAt)}
                    </p>
                  </td>
                  <td className="py-4 pr-4">
                    <PillList items={project.staffIds.map(staffName)} empty="Optional" />
                  </td>
                  <td className="py-4 pr-4">
                    <p className="font-bold text-slate-800">{project.partnerIds.map(partnerName).join(", ") || "No partner"}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">{project.subcontractorIds.map(subcontractorName).join(", ") || "No subcontractor"}</p>
                  </td>
                  <td className="py-4 pr-4 text-slate-600">{formatDateTime(projectLastEdited(project))}</td>
                  <td className="py-4 pr-4">
                    <FinanceStack totals={totals} />
                  </td>
                  <td className="py-4 pr-4">
                    <Badge tone={project.status === "Active" ? "green" : "gray"}>{project.status}</Badge>
                  </td>
                  <td className="py-4 text-right">
                    <button type="button" className="bb-icon-btn ml-auto" onClick={() => openProject(project.id)} aria-label={`Open ${project.title}`}>
                      <ChevronRight size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  function ProjectCards({ projects }) {
    if (!projects.length) return null;
    return (
      <div className="grid gap-3 p-4 pt-0 lg:hidden">
        {projects.map((project) => {
          const totals = projectTotals(project.id);
          return (
            <article key={project.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-base font-black text-slate-950">{project.title}</h3>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {project.location} · {project.department}
                  </p>
                </div>
                <Badge tone={project.status === "Active" ? "green" : "gray"}>{project.status}</Badge>
              </div>
              <div className="mt-3">
                <FinanceStack totals={totals} />
              </div>
              <div className="mt-4 grid gap-2 text-sm">
                <InfoRow label="Staff" value={project.staffIds.map(staffName).join(", ") || "Optional"} />
                <InfoRow label="Partner" value={project.partnerIds.map(partnerName).join(", ") || "No partner"} />
                <InfoRow label="Last edited" value={formatDateTime(projectLastEdited(project))} />
              </div>
              <button type="button" className="bb-btn-primary mt-4 w-full" onClick={() => openProject(project.id)}>
                Open detail
                <ArrowRight size={16} />
              </button>
            </article>
          );
        })}
      </div>
    );
  }

  function ProjectLedgerTable({ records }) {
    if (!records.length) return <EmptyState title="No records match this filter" compact />;
    const groups = groupByDate(records);
    return (
      <div className="bb-scrollbar hidden overflow-x-auto p-4 pt-0 xl:block">
        <table className="bb-ledger-table min-w-[1080px] w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-black uppercase text-slate-500">
            <tr>
              <th className="px-3 py-3">Date</th>
              <th className="px-3 py-3 text-center">#</th>
              <th className="px-3 py-3">Type</th>
              <th className="px-3 py-3">Location</th>
              <th className="px-3 py-3">Category</th>
              <th className="px-3 py-3">Added by</th>
              <th className="px-3 py-3">Time</th>
              <th className="px-3 py-3">Narration</th>
              <th className="px-3 py-3">Quantity</th>
              <th className="px-3 py-3 text-right">Price</th>
              <th className="px-3 py-3 text-center">File</th>
              <th className="px-3 py-3 text-center">Delete</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groups).map(([date, dateRecords]) => (
              <LedgerDateRows key={date} date={date} records={dateRecords} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function LedgerDateRows({ date, records }) {
    const totals = totalsFor(records);
    return (
      <>
        {records.map((record, index) => (
          <tr key={record.id} className="align-top">
            {index === 0 && (
              <td rowSpan={records.length + 1} className="w-36 bg-slate-50 px-3 py-3 font-black text-slate-800">
                {formatDate(date)}
                <span className="mt-1 block text-xs font-semibold text-slate-500">{weekday(date)}</span>
              </td>
            )}
            <td className="px-3 py-3 text-center font-black text-slate-500">{index + 1}</td>
            <td className="px-3 py-3">
              <TypeBadge type={record.type} />
            </td>
            <td className="px-3 py-3">
              <Badge tone={record.location === "Office" ? "green" : "blue"}>{record.location}</Badge>
            </td>
            <td className="px-3 py-3 font-semibold text-slate-700">{record.category}</td>
            <td className="px-3 py-3 text-slate-600">{record.addedBy}</td>
            <td className="px-3 py-3 text-slate-600">{formatTime(record.time)}</td>
            <td className="min-w-64 px-3 py-3 text-slate-700">{record.narration}</td>
            <td className="px-3 py-3 text-slate-600">{record.quantity || "-"}</td>
            <td className={classNames("px-3 py-3 text-right font-black", record.type === "জমা" ? "text-emerald-700" : "text-rose-700")}>{money(record.price)}</td>
            <td className="px-3 py-3 text-center">
              <button type="button" className="bb-icon-btn mx-auto" onClick={() => setModal({ type: "evidence", recordId: record.id })} aria-label="View evidence">
                <FileText size={17} />
              </button>
            </td>
            <td className="px-3 py-3 text-center">
              {canDeleteRecord(record) ? (
                <button type="button" className="bb-icon-btn mx-auto hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700" onClick={() => deleteRecord(record.id)} aria-label="Delete record">
                  <Trash2 size={17} />
                </button>
              ) : (
                <LockKeyhole className="mx-auto text-slate-300" size={17} />
              )}
            </td>
          </tr>
        ))}
        <tr className="bg-slate-50 font-black">
          <td colSpan={7} className="px-3 py-3 text-slate-700">
            Daily total
          </td>
          <td colSpan={4} className="px-3 py-3">
            <div className="flex flex-wrap justify-end gap-4">
              <span className="text-emerald-700">জমা {money(totals.income)}</span>
              <span className="text-rose-700">খরচ {money(totals.expense)}</span>
              <span className={totals.balance >= 0 ? "text-emerald-700" : "text-rose-700"}>Balance {money(totals.balance)}</span>
            </div>
          </td>
        </tr>
      </>
    );
  }

  function ProjectLedgerCards({ records }) {
    if (!records.length) return null;
    const groups = groupByDate(records);
    return (
      <div className="grid gap-4 p-4 pt-0 xl:hidden">
        {Object.entries(groups).map(([date, dateRecords]) => {
          const totals = totalsFor(dateRecords);
          return (
            <section key={date} className="grid gap-3">
              <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="font-black text-slate-800">
                  {formatDate(date)} · {weekday(date)}
                </p>
                <p className={classNames("font-black", totals.balance >= 0 ? "text-emerald-700" : "text-rose-700")}>{money(totals.balance)}</p>
              </div>
              {dateRecords.map((record, index) => (
                <RecordCard key={record.id} record={record} index={index + 1} />
              ))}
            </section>
          );
        })}
      </div>
    );
  }

  function GroupedLedgerTable({ records }) {
    if (!records.length) return <EmptyState title="No records found" compact />;
    const groups = groupByDate(records);
    return (
      <div className="bb-scrollbar hidden overflow-x-auto p-4 pt-0 xl:block">
        <table className="bb-ledger-table min-w-[1060px] w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-black uppercase text-slate-500">
            <tr>
              <th className="px-3 py-3">Date</th>
              <th className="px-3 py-3 text-center">#</th>
              <th className="px-3 py-3">Project</th>
              <th className="px-3 py-3">Location</th>
              <th className="px-3 py-3">Category</th>
              <th className="px-3 py-3">Added by / Time</th>
              <th className="px-3 py-3">Narration</th>
              <th className="px-3 py-3">Quantity</th>
              <th className="px-3 py-3 text-right">Price</th>
              <th className="px-3 py-3 text-center">Evidence</th>
              <th className="px-3 py-3 text-center">Delete</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groups).map(([date, dateRecords]) => (
              <GroupedDateRows key={date} date={date} records={dateRecords} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function GroupedDateRows({ date, records }) {
    const dayTotal = records.reduce((sum, record) => sum + Number(record.price || 0), 0);
    return (
      <>
        {records.map((record, index) => {
          const project = getProject(record.projectId);
          return (
            <tr key={record.id} className="align-top">
              {index === 0 && (
                <td rowSpan={records.length + 1} className="w-36 bg-slate-50 px-3 py-3 font-black text-slate-800">
                  {formatDate(date)}
                  <span className="mt-1 block text-xs font-semibold text-slate-500">{weekday(date)}</span>
                </td>
              )}
              <td className="px-3 py-3 text-center font-black text-slate-500">{index + 1}</td>
              <td className="px-3 py-3">
                <p className="font-black text-slate-900">{project?.title || "Unknown"}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">{project?.location}</p>
              </td>
              <td className="px-3 py-3">
                <Badge tone={record.location === "Office" ? "green" : "blue"}>{record.location}</Badge>
              </td>
              <td className="px-3 py-3">
                <p className="font-semibold text-slate-700">{record.category}</p>
                {record.depositSource === "Partner" && <p className="mt-1 text-xs font-semibold text-slate-500">Partner: {partnerName(record.partnerId)}</p>}
              </td>
              <td className="px-3 py-3 text-slate-600">
                {record.addedBy}
                <span className="mt-1 block text-xs font-semibold text-slate-500">{formatTime(record.time)}</span>
              </td>
              <td className="min-w-64 px-3 py-3 text-slate-700">{record.narration}</td>
              <td className="px-3 py-3 text-slate-600">{record.quantity || "-"}</td>
              <td className={classNames("px-3 py-3 text-right font-black", record.type === "জমা" ? "text-emerald-700" : "text-rose-700")}>{money(record.price)}</td>
              <td className="px-3 py-3 text-center">
                <button type="button" className="bb-icon-btn mx-auto" onClick={() => setModal({ type: "evidence", recordId: record.id })}>
                  <FileText size={17} />
                </button>
              </td>
              <td className="px-3 py-3 text-center">
                {canDeleteRecord(record) ? (
                  <button type="button" className="bb-icon-btn mx-auto hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700" onClick={() => deleteRecord(record.id)}>
                    <Trash2 size={17} />
                  </button>
                ) : (
                  <LockKeyhole className="mx-auto text-slate-300" size={17} />
                )}
              </td>
            </tr>
          );
        })}
        <tr className="bg-slate-50 font-black">
          <td colSpan={7} className="px-3 py-3 text-slate-700">
            Daily {records[0]?.type} total
          </td>
          <td className={classNames("px-3 py-3 text-right", records[0]?.type === "জমা" ? "text-emerald-700" : "text-rose-700")}>{money(dayTotal)}</td>
          <td />
          <td />
        </tr>
      </>
    );
  }

  function GroupedLedgerCards({ records }) {
    if (!records.length) return null;
    const groups = groupByDate(records);
    return (
      <div className="grid gap-4 p-4 pt-0 xl:hidden">
        {Object.entries(groups).map(([date, dateRecords]) => (
          <section key={date} className="grid gap-3">
            <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="font-black text-slate-800">
                {formatDate(date)} · {weekday(date)}
              </p>
              <p className="font-black text-slate-900">{money(dateRecords.reduce((sum, record) => sum + Number(record.price || 0), 0))}</p>
            </div>
            {dateRecords.map((record, index) => (
              <RecordCard key={record.id} record={record} index={index + 1} showProject />
            ))}
          </section>
        ))}
      </div>
    );
  }

  function RecordTable({ records, showProject = false }) {
    if (!records.length) return <EmptyState title="No records yet" compact />;
    return (
      <div className="bb-scrollbar hidden overflow-x-auto p-4 pt-0 lg:block">
        <table className="min-w-[980px] w-full text-left text-sm">
          <thead className="text-xs font-black uppercase text-slate-500">
            <tr>
              {showProject && <th className="py-3 pr-4">Project</th>}
              <th className="py-3 pr-4">Date</th>
              <th className="py-3 pr-4">Type</th>
              <th className="py-3 pr-4">Location</th>
              <th className="py-3 pr-4">Category</th>
              <th className="py-3 pr-4">Added by</th>
              <th className="py-3 pr-4">Narration</th>
              <th className="py-3 pr-4 text-right">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.map((record) => {
              const project = getProject(record.projectId);
              return (
                <tr key={record.id} className="align-top">
                  {showProject && (
                    <td className="py-4 pr-4">
                      <p className="font-black text-slate-900">{project?.title || "Unknown"}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">{project?.location}</p>
                    </td>
                  )}
                  <td className="py-4 pr-4">
                    <p className="font-bold text-slate-700">{formatDate(record.date)}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">{formatTime(record.time)}</p>
                  </td>
                  <td className="py-4 pr-4">
                    <TypeBadge type={record.type} />
                  </td>
                  <td className="py-4 pr-4">
                    <Badge tone={record.location === "Office" ? "green" : "blue"}>{record.location}</Badge>
                  </td>
                  <td className="py-4 pr-4 text-slate-600">{record.category}</td>
                  <td className="py-4 pr-4 text-slate-600">{record.addedBy}</td>
                  <td className="py-4 pr-4 text-slate-700">{record.narration}</td>
                  <td className={classNames("py-4 pr-4 text-right font-black", record.type === "জমা" ? "text-emerald-700" : "text-rose-700")}>{money(record.price)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  function RecordCards({ records, showProject = false }) {
    if (!records.length) return null;
    return (
      <div className="grid gap-3 p-4 pt-0 lg:hidden">
        {records.map((record, index) => (
          <RecordCard key={record.id} record={record} index={index + 1} showProject={showProject} />
        ))}
      </div>
    );
  }

  function RecordCard({ record, index, showProject = false }) {
    const project = getProject(record.projectId);
    return (
      <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-black text-slate-950">
              {index ? `${index}. ` : ""}
              {showProject ? project?.title || "Unknown" : record.category}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              {formatDate(record.date)} · {formatTime(record.time)}
            </p>
          </div>
          <TypeBadge type={record.type} />
        </div>
        <div className="mt-3 grid gap-2 text-sm">
          <InfoRow label="Location" value={record.location} />
          <InfoRow label="Added by" value={record.addedBy} />
          <InfoRow label="Category" value={record.category} />
          <InfoRow label="Quantity" value={record.quantity || "-"} />
          <InfoRow label="Narration" value={record.narration} />
          <InfoRow label="Price" value={money(record.price)} valueClass={record.type === "জমা" ? "text-emerald-700" : "text-rose-700"} />
          {record.depositSource === "Partner" && <InfoRow label="Partner" value={partnerName(record.partnerId)} />}
        </div>
        <div className="mt-4 flex gap-2">
          <button type="button" className="bb-icon-btn" onClick={() => setModal({ type: "evidence", recordId: record.id })} aria-label="View evidence">
            <FileText size={17} />
          </button>
          {canDeleteRecord(record) && (
            <button type="button" className="bb-icon-btn hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700" onClick={() => deleteRecord(record.id)} aria-label="Delete record">
              <Trash2 size={17} />
            </button>
          )}
        </div>
      </article>
    );
  }
}

function LoginScreen({ store, onLogin }) {
  const totals = totalsFor(store.records);
  const active = store.projects.filter((project) => project.status === "Active").length;
  const roles = [
    ["admin", "Admin", ShieldCheck, "Full access, reports, partner returns, and access control."],
    ["manager", "Manager", UserCog, "Assigned projects with add-record permission."],
    ["engineer", "Engineer", BriefcaseBusiness, "Assigned site projects and daily entry tools."],
    ["partner", "Partner", HandCoins, "Own project deposits, return status, and statements."],
  ];

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8" data-page="login">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,0.65fr)] lg:items-center">
        <section className="rounded-lg border border-white/70 bg-white/70 p-5 shadow-sm backdrop-blur sm:p-7 lg:p-9">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-slate-950 text-sm font-black text-white">BB</div>
            <div>
              <h1 className="text-xl font-black text-slate-950">Bellal Brothers</h1>
              <p className="mt-1 text-sm font-semibold text-slate-500">Project calculation frontend demo</p>
            </div>
          </div>
          <div className="mt-10 max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-teal-700">Frontend preview</p>
            <h2 className="mt-3 text-4xl font-black leading-[1.02] text-slate-950 sm:text-5xl lg:text-6xl">
              Project calculation, access, and partner money tracking.
            </h2>
            <p className="mt-5 max-w-2xl text-base font-medium leading-8 text-slate-600">
              Choose a role to preview how Admin, Manager, Engineer, and Partner will use the system. All data is dummy frontend data stored in the browser.
            </p>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <MiniStat label="Projects" value={store.projects.length} />
            <MiniStat label="Active now" value={active} />
            <MiniStat label="Current balance" value={money(totals.balance)} tone={totals.balance >= 0 ? "green" : "red"} />
          </div>
          <div className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
            <div className="grid grid-cols-7 gap-px bg-slate-200 text-xs font-black text-slate-500">
              {["Date", "Type", "Location", "Category", "Narration", "Qty", "Price"].map((item) => (
                <div key={item} className="bg-white px-3 py-2">
                  {item}
                </div>
              ))}
            </div>
            {store.records.slice(0, 4).map((record) => (
              <div key={record.id} className="grid grid-cols-7 gap-px bg-slate-200 text-xs font-semibold text-slate-600">
                <div className="bg-white px-3 py-2">{formatDate(record.date)}</div>
                <div className="bg-white px-3 py-2">{record.type}</div>
                <div className="bg-white px-3 py-2">{record.location}</div>
                <div className="bg-white px-3 py-2">{record.category}</div>
                <div className="truncate bg-white px-3 py-2">{record.narration}</div>
                <div className="bg-white px-3 py-2">{record.quantity || "-"}</div>
                <div className="bg-white px-3 py-2 font-black">{money(record.price)}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-xl sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-black text-slate-950">Login as role</h3>
              <p className="mt-1 text-sm font-semibold text-slate-500">No backend is connected.</p>
            </div>
            <ChevronDown className="text-slate-300" />
          </div>
          <div className="mt-5 grid gap-3">
            {roles.map(([id, label, Icon, text]) => (
              <button
                key={id}
                type="button"
                onClick={() => onLogin(id)}
                className="group flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-teal-200 hover:bg-teal-50 hover:shadow-md"
              >
                <span className="grid h-12 w-12 place-items-center rounded-lg bg-slate-100 text-slate-700 group-hover:bg-white group-hover:text-teal-700">
                  <Icon size={21} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-black text-slate-950">{label}</span>
                  <span className="mt-1 block text-sm font-medium leading-6 text-slate-500">{text}</span>
                </span>
                <ArrowRight className="text-slate-300 group-hover:text-teal-700" size={19} />
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function MetricCard({ label, value, helper, icon: Icon, tone = "blue" }) {
  const iconClass = {
    blue: "bg-sky-50 text-sky-700",
    green: "bg-emerald-50 text-emerald-700",
    red: "bg-rose-50 text-rose-700",
    amber: "bg-amber-50 text-amber-700",
  }[tone];
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black text-slate-500">{label}</p>
          <p className="mt-3 text-2xl font-black tracking-tight text-slate-950">{value}</p>
        </div>
        <span className={classNames("grid h-10 w-10 place-items-center rounded-lg", iconClass)}>
          <Icon size={19} />
        </span>
      </div>
      <p className="mt-3 text-xs font-semibold text-slate-500">{helper}</p>
    </article>
  );
}

function MiniStat({ label, value, tone = "ink" }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className={classNames("mt-1 text-lg font-black", tone === "green" ? "text-emerald-700" : tone === "red" ? "text-rose-700" : "text-slate-950")}>{value}</p>
    </div>
  );
}

function SectionHead({ title, subtitle, action }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="text-lg font-black text-slate-950">{title}</h2>
        {subtitle && <p className="mt-1 text-sm font-medium text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function TableHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="text-lg font-black text-slate-950">{title}</h2>
        {subtitle && <p className="mt-1 text-sm font-medium text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function ActionButton({ icon: Icon, title, text, onClick }) {
  return (
    <button type="button" onClick={onClick} className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-teal-200 hover:bg-teal-50">
      <span className="grid h-10 w-10 place-items-center rounded-lg bg-white text-teal-700 shadow-sm">
        <Icon size={18} />
      </span>
      <span>
        <span className="block text-sm font-black text-slate-950">{title}</span>
        <span className="mt-1 block text-xs font-semibold leading-5 text-slate-500">{text}</span>
      </span>
    </button>
  );
}

function SearchBox({ value, onChange, placeholder }) {
  return (
    <label className="relative block w-full sm:w-72">
      <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="bb-input pl-10" />
    </label>
  );
}

function Segment({ options, value, onChange }) {
  return (
    <div className="grid grid-flow-col rounded-lg border border-slate-200 bg-slate-50 p-1">
      {options.map((option) => (
        <button
          type="button"
          key={option}
          onClick={() => onChange(option)}
          className={classNames(
            "h-8 rounded-md px-3 text-sm font-black transition",
            value === option ? "bg-slate-950 text-white shadow-sm" : "text-slate-500 hover:bg-white hover:text-slate-900"
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div className="grid gap-1.5">
      <span className="text-sm font-black text-slate-700">{label}</span>
      {children}
      {hint && <span className="text-xs font-semibold leading-5 text-slate-500">{hint}</span>}
    </div>
  );
}

function Modal({ title, children, onClose, wide = false }) {
  return (
    <div className="fixed inset-0 z-[70] grid place-items-end bg-slate-950/45 p-0 backdrop-blur-sm sm:place-items-center sm:p-4 no-print" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={classNames("max-h-[92vh] w-full overflow-auto rounded-t-lg border border-slate-200 bg-white shadow-2xl sm:rounded-lg", wide ? "sm:max-w-3xl" : "sm:max-w-xl")}>
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
          <h3 className="text-lg font-black text-slate-950">{title}</h3>
          <button type="button" className="bb-icon-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </section>
    </div>
  );
}

function ModalActions({ onClose, submitLabel, disabled = false }) {
  return (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <button type="button" onClick={onClose} className="bb-btn-secondary">
        Cancel
      </button>
      <button type="submit" disabled={disabled} className="bb-btn-primary">
        <Plus size={17} />
        {submitLabel}
      </button>
    </div>
  );
}

function Badge({ children, tone = "ink", icon: Icon }) {
  return (
    <span className={classNames("inline-flex min-h-7 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-black", badgeTone[tone] || badgeTone.ink)}>
      {Icon && <Icon size={13} />}
      {children}
    </span>
  );
}

function TypeBadge({ type }) {
  return (
    <Badge tone={type === "জমা" ? "green" : "red"} icon={type === "জমা" ? ArrowUpRight : ArrowDownRight}>
      {type}
    </Badge>
  );
}

function FinanceStack({ totals }) {
  return (
    <div className="grid min-w-40 gap-1.5">
      <div className="flex items-center justify-between gap-3 text-sm font-black text-emerald-700">
        <span>↑ জমা</span>
        <span>{money(totals.income)}</span>
      </div>
      <div className="flex items-center justify-between gap-3 text-sm font-black text-rose-700">
        <span>↓ খরচ</span>
        <span>{money(totals.expense)}</span>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-dashed border-slate-300 pt-1.5 text-sm font-black text-slate-900">
        <span>Balance</span>
        <span className={totals.balance >= 0 ? "text-emerald-700" : "text-rose-700"}>{money(totals.balance)}</span>
      </div>
    </div>
  );
}

function PillList({ items, empty }) {
  if (!items.length) return <span className="text-sm font-semibold text-slate-400">{empty}</span>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Badge key={item}>{item}</Badge>
      ))}
    </div>
  );
}

function InfoRow({ label, value, valueClass = "" }) {
  return (
    <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-3">
      <span className="font-bold text-slate-400">{label}</span>
      <span className={classNames("min-w-0 font-black text-slate-800", valueClass)}>{value}</span>
    </div>
  );
}

function Definition({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <dt className="text-sm font-bold text-slate-500">{label}</dt>
      <dd className="text-right text-sm font-black text-slate-900">{value}</dd>
    </div>
  );
}

function EmptyState({ title, text, compact = false }) {
  return (
    <div className={classNames("grid place-items-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-center", compact ? "m-4 p-5" : "p-10")}>
      <div>
        <MoreHorizontal className="mx-auto text-slate-300" size={28} />
        <p className="mt-2 font-black text-slate-700">{title}</p>
        {text && <p className="mt-1 text-sm font-medium text-slate-500">{text}</p>}
      </div>
    </div>
  );
}
