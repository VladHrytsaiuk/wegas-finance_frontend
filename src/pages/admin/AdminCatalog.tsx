import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import {
  HiChevronDown,
  HiFolder,
  HiOutlineBuildingStorefront,
  HiOutlineFolder,
  HiOutlineMagnifyingGlass,
  HiOutlineUsers,
  HiPencil,
  HiXMark,
  HiPhoto,
  HiArchiveBox,
  HiPlus,
} from "react-icons/hi2";
import { SmartIcon } from "../../utils/IconMap";
import {
  getAdminCategoriesApi,
  getAdminCounterpartiesApi,
  getAdminCounterpartyCategoriesApi,
  updateAdminCounterpartyApi,
  updateAdminCounterpartyCategoryApi,
  updateAdminCategoryApi,
  createAdminCategoryApi,
  createAdminCounterpartyApi,
  createAdminCounterpartyCategoryApi,
  archiveAdminCategoryApi,
  archiveAdminCounterpartyApi,
  archiveAdminCounterpartyCategoryApi,
  type AdminCategoryInput,
  type AdminCounterparty,
  type AdminCounterpartyInput,
  type AdminCounterpartyCategoryInput,
} from "../../services/apiAdminCatalog";
import { ColorPicker, IconPicker } from "../../components/ui/ColorIconPicker";
import type { Category, CounterpartyCategory } from "../../types";
import { useIsMobile } from "../../hooks/useIsMobile";

const Page = styled.section`width:100%;max-width:1180px;margin:0 auto;`;
const PageHeader = styled.header`
  display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;
  padding: .5rem 0 1.75rem;
  h1{margin:0;color:var(--color-text-main);font-size:1.55rem;line-height:1.2}
  p{margin:.5rem 0 0;color:var(--color-text-secondary);font-size:.92rem}
`;
const Eyebrow = styled.div`display:flex;align-items:center;gap:.45rem;margin-bottom:.55rem;color:var(--color-brand-700);font-size:.72rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;svg{width:16px;height:16px}`;
const Count = styled.span`display:inline-flex;align-items:center;justify-content:center;min-width:2rem;height:2rem;padding:0 .55rem;border:1px solid var(--color-border);border-radius:999px;background:var(--color-bg-surface);color:var(--color-text-secondary);font-size:.78rem;font-weight:700;`;
const AddButton = styled.button`height:34px;padding:0 .85rem;border:0;border-radius:8px;background:var(--color-brand-600);color:#fff;font:inherit;font-size:.8rem;font-weight:750;cursor:pointer;&:hover{background:var(--color-brand-700)}`;
const Panel = styled.section`background:var(--color-bg-surface);border:1px solid var(--color-border);border-radius:16px;box-shadow:var(--shadow-sm);overflow:hidden;`;
const Toolbar = styled.div`display:flex;align-items:center;gap:1rem;padding:.8rem 1rem;border-bottom:1px solid var(--color-border);`;
const Search = styled.label`
  display:flex;align-items:center;gap:.55rem;flex:1;max-width:380px;padding:.52rem .7rem;border:1px solid var(--color-border);border-radius:9px;color:var(--color-text-tertiary);background:var(--color-bg-page);
  &:focus-within{border-color:var(--color-brand-500);box-shadow:0 0 0 3px var(--color-brand-100)}
  input{width:100%;border:0;outline:0;background:transparent;color:var(--color-text-main);font:inherit;font-size:.84rem;}
  svg{width:18px;height:18px;flex:0 0 18px;}
`;
const TreeActions = styled.div`display:flex;gap:.4rem;margin-left:auto;button{height:32px;padding:0 .65rem;border:1px solid var(--color-border);border-radius:7px;background:var(--color-bg-surface);color:var(--color-text-secondary);font:inherit;font-size:.75rem;font-weight:700;cursor:pointer;&:hover{border-color:var(--color-brand-400);color:var(--color-brand-700);}}`;
const Tree = styled.div`padding:.65rem;min-height:360px;`;
const Empty = styled.div`min-height:280px;display:flex;align-items:center;justify-content:center;color:var(--color-text-secondary);`;
const Row = styled.div<{ $level:number; $root?:boolean }>`
  display:flex;align-items:center;gap:.45rem;min-height:44px;padding:.3rem .55rem .3rem ${p => .55 + p.$level * 1.45}rem;border-radius:9px;position:relative;
  ${p => p.$level > 0 ? `&::before{content:"";position:absolute;left:${.55 + (p.$level - 1) * 1.45 + .6}rem;top:0;bottom:0;width:1px;background:var(--color-border);opacity:.8;}` : ""}
  &:hover{background:var(--color-bg-page)}
`;
const Toggle = styled.button<{ $expanded:boolean }>`
  width:24px;height:24px;border:0;border-radius:6px;background:transparent;color:var(--color-text-tertiary);display:grid;place-items:center;cursor:pointer;flex:0 0 24px;
  &:hover{background:var(--color-bg-hover);color:var(--color-text-main)}
  svg{width:16px;height:16px;transform:rotate(${p => p.$expanded ? "0deg" : "-90deg"});transition:transform .18s;}
`;
const Spacer = styled.div`width:24px;flex:0 0 24px;`;
const IconBox = styled.div<{ $color?:string }>`
  width:29px;height:29px;display:grid;place-items:center;flex:0 0 29px;border-radius:8px;overflow:hidden;
  background:${p => p.$color ? `${p.$color}18` : "var(--color-bg-surface-secondary)"};color:${p => p.$color || "var(--color-text-secondary)"};border:1px solid ${p => p.$color ? `${p.$color}28` : "var(--color-border)"};
  img{width:100%;height:100%;object-fit:cover !important;} svg{width:16px;height:16px;}
`;
const Name = styled.span<{ $root?:boolean }>`min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--color-text-main);font-size:.88rem;font-weight:${p => p.$root ? 750 : 550};`;
const Meta = styled.span`margin-left:auto;color:var(--color-text-tertiary);font-family:"JetBrains Mono",monospace;font-size:.7rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:36%;`;
const NodeCount = styled.span`display:grid;place-items:center;min-width:20px;height:20px;padding:0 5px;border-radius:999px;background:var(--color-bg-surface-secondary);color:var(--color-text-secondary);font-size:.68rem;font-weight:700;`;
const EditButton = styled.button`display:grid;place-items:center;width:28px;height:28px;border:0;border-radius:7px;background:transparent;color:var(--color-text-tertiary);cursor:pointer;opacity:0;transition:.16s;&:hover{background:var(--color-brand-50);color:var(--color-brand-700)}${Row}:hover &{opacity:1}svg{width:16px;height:16px;}`;
const Backdrop = styled.div`position:fixed;inset:0;z-index:5000;display:grid;place-items:center;padding:1.5rem;background:rgba(15,23,42,.44);backdrop-filter:blur(2px);`;
const Dialog = styled.form`width:min(100%,560px);padding:1.5rem;border:1px solid var(--color-border);border-radius:16px;background:var(--color-bg-surface);box-shadow:var(--shadow-lg);h2{margin:0;color:var(--color-text-main);font-size:1.18rem;}p{margin:.35rem 0 1.35rem;color:var(--color-text-secondary);font-size:.84rem;}`;
const DialogHeader = styled.div`display:flex;justify-content:space-between;gap:1rem;button{border:0;background:transparent;color:var(--color-text-tertiary);cursor:pointer;padding:.2rem;svg{width:20px;height:20px;}}`;
const Fields = styled.div`display:grid;grid-template-columns:1fr 1fr;gap:1rem;.wide{grid-column:1/-1;}label{display:flex;flex-direction:column;gap:.4rem;color:var(--color-text-secondary);font-size:.76rem;font-weight:700;}input,select{height:38px;box-sizing:border-box;padding:0 .7rem;border:1px solid var(--color-border);border-radius:8px;background:var(--color-bg-page);color:var(--color-text-main);font:inherit;font-size:.86rem;}input:focus,select:focus{outline:2px solid var(--color-brand-200);border-color:var(--color-brand-500);}input[readonly]{color:var(--color-text-tertiary);}`;
const DialogActions = styled.div`display:flex;justify-content:flex-end;gap:.7rem;margin-top:1.5rem;padding-top:1rem;border-top:1px solid var(--color-border);button{height:38px;padding:0 1rem;border:1px solid var(--color-border);border-radius:8px;background:var(--color-bg-surface);color:var(--color-text-main);font:inherit;font-weight:700;cursor:pointer;}button[type="submit"]{border-color:var(--color-brand-600);background:var(--color-brand-600);color:#fff;}button:disabled{opacity:.6;cursor:wait;}`;
const FormError = styled.p`color:var(--color-danger-600,#dc2626)!important;margin:1rem 0 0!important;`;
const LogoPreview = styled.div`
  display:flex;align-items:center;gap:.75rem;margin-top:.1rem;padding:.65rem;
  border:1px solid var(--color-border);border-radius:9px;background:var(--color-bg-surface);
  span{color:var(--color-text-tertiary);font-size:.74rem;font-weight:600;}
`;
const LogoPreviewBox = styled.div`
  width:52px;height:52px;display:grid;place-items:center;overflow:hidden;flex:0 0 52px;
  border:1px solid var(--color-border);border-radius:12px;background:var(--color-bg-page);
  img{width:100%;height:100%;object-fit:cover!important;}svg{width:25px;height:25px;}
`;

type CatalogKind = "overview" | "categories" | "counterparties";
type EditableRecord = { kind:"category"; value:AdminCategory } | { kind:"counterparty"; value:AdminCounterparty } | { kind:"counterparty-category"; value:AdminCounterpartyCategory };
type TreeNode = { id:string; name:string; icon:string; color?:string; logo?:string | null; meta?:string; usageCount?:number; usageIsAggregate?:boolean; record?:EditableRecord; children:TreeNode[] };
type AdminCategory = Category & { system_key?: string; usage_count?: number };
type AdminCounterpartyCategory = CounterpartyCategory & { system_key?: string; usage_count?: number };

const normalizeIcon = (icon?: string) => {
  if (!icon) return "HiTag";
  if (icon.startsWith("Hi")) return icon;
  return `Hi${icon.replace(/[-_]([a-z])/g, (_, char: string) => char.toUpperCase()).replace(/^./, char => char.toUpperCase())}`;
};

const typeLabels: Record<string, string> = { shop: "Магазини", person: "Люди", other: "Інше", expense: "Витрати", income: "Доходи" };
const typeIcons: Record<string, string> = { shop: "HiShoppingCart", person: "HiUser", other: "HiTag", expense: "HiArrowTrendingDown", income: "HiArrowTrendingUp" };
const typeColors: Record<string, string> = { shop: "#6366f1", person: "#a855f7", other: "#64748b", expense: "#ef4444", income: "#16a34a" };

function CatalogTree({ nodes, query, onEdit, onArchive, onAddChild, collapsed, setCollapsed }: { nodes: TreeNode[]; query: string; onEdit?: (record: EditableRecord) => void; onArchive?: (record: EditableRecord) => void; onAddChild?: (record: EditableRecord) => void; collapsed:Set<string>; setCollapsed:React.Dispatch<React.SetStateAction<Set<string>>> }) {
  const filter = query.trim().toLocaleLowerCase();
  const matches = (node: TreeNode): TreeNode | null => {
    const children = node.children.map(matches).filter((value): value is TreeNode => Boolean(value));
    return !filter || node.name.toLocaleLowerCase().includes(filter) || children.length ? { ...node, children } : null;
  };
  const visible = nodes.map(matches).filter((value): value is TreeNode => Boolean(value));
  const renderNode = (node: TreeNode, level = 0) => {
    const hasChildren = node.children.length > 0;
    const expanded = filter.length > 0 || !collapsed.has(node.id);
    return <div key={node.id}>
      <Row $level={level} $root={level === 0}>
        {hasChildren ? <Toggle type="button" $expanded={expanded} onClick={() => setCollapsed(previous => {
          const next = new Set(previous); if (next.has(node.id)) next.delete(node.id); else next.add(node.id); return next;
        })} aria-label={expanded ? "Згорнути" : "Розгорнути"}><HiChevronDown /></Toggle> : <Spacer />}
        <IconBox $color={node.color}><SmartIcon iconName={node.icon} logo={node.logo} size={16} color={node.color} fillContainer={Boolean(node.logo)} /></IconBox>
        <Name $root={level === 0}>{node.name}</Name>
        {hasChildren && <NodeCount>{node.children.length}</NodeCount>}
        {node.meta && <Meta title={node.meta}>{node.meta}</Meta>}
        {node.record && onAddChild && ((node.record.kind === 'category' && !node.record.value.parent_id) || node.record.kind === 'counterparty-category') && <EditButton type="button" title={node.record.kind === 'category' ? "Додати підкатегорію" : "Додати контрагента"} onClick={event => { event.stopPropagation(); onAddChild(node.record!); }}><HiPlus /></EditButton>}
        {node.record && onEdit && <EditButton type="button" title="Редагувати" onClick={event => { event.stopPropagation(); onEdit(node.record!); }}><HiPencil /></EditButton>}
        {node.record && onArchive && <EditButton type="button" title="Архівувати" onClick={event => { event.stopPropagation(); onArchive(node.record!); }}><HiArchiveBox /></EditButton>}
      </Row>
      {hasChildren && expanded && node.children.map(child => renderNode(child, level + 1))}
    </div>;
  };
  return <Tree>{visible.length ? visible.map(node => renderNode(node)) : <Empty>Нічого не знайдено.</Empty>}</Tree>;
}

function buildCategoriesTree(categories: AdminCategory[]): TreeNode[] {
  return ["expense", "income"].map(type => {
    const scoped = categories.filter(item => item.type === type);
    const byId = new Map(scoped.map(item => [item.id, {
      id: item.id, name: item.name, icon: normalizeIcon(item.icon), color: item.color,
      meta: item.system_key || "без system key", usageCount: item.usage_count || 0, record: { kind: "category", value: item }, children: [] as TreeNode[],
    }]));
    const roots: TreeNode[] = [];

    scoped.forEach(item => {
      const node = byId.get(item.id)!;
      const parent = item.parent_id ? byId.get(item.parent_id) : undefined;
      if (parent) parent.children.push(node); else roots.push(node);
    });

    return { id: `type-${type}`, name: typeLabels[type], icon: typeIcons[type], color: typeColors[type], children: sortTreeByUsage(roots, true) };
  }).filter(node => node.children.length);
}

function buildCounterpartiesTree(counterparties: AdminCounterparty[], categories: AdminCounterpartyCategory[]): TreeNode[] {
  return ["shop", "person", "other"].map(type => {
    const byCategory = new Map(categories.filter(category => category.type === type).map(category => [category.id, category]));
    const roots: TreeNode[] = [];
    byCategory.forEach(category => roots.push({ id: category.id, name: category.name, icon: normalizeIcon(category.icon), color: category.color, usageCount: category.usage_count || 0, usageIsAggregate: true, record: { kind: "counterparty-category", value: category }, children: [] }));
    const orphan: TreeNode[] = [];
    counterparties.filter(item => item.type === type).forEach(item => {
      const node = { id: item.id, name: item.name, icon: normalizeIcon(item.icon), logo: item.logo, color: typeColors[type], meta: item.system_key || "без system key", usageCount: item.usage_count || 0, record: { kind: "counterparty" as const, value: item }, children: [] };
      const category = roots.find(root => root.id === item.category?.id) ?? roots.find(root => root.name === item.category?.name);
      if (category) category.children.push(node); else orphan.push(node);
    });
    if (orphan.length) roots.push({ id: `uncategorized-${type}`, name: "Без групи", icon: "HiArchiveBox", color: "#94a3b8", children: orphan });
    return { id: `type-${type}`, name: typeLabels[type], icon: typeIcons[type], color: typeColors[type], children: sortTreeByUsage(roots) };
  }).filter(node => node.children.length);
}

function sortTreeByUsage(nodes: TreeNode[], pinOtherToBottom = false) {
  const totalUsage = (node: TreeNode): number => node.usageIsAggregate
    ? node.usageCount || 0
    : (node.usageCount || 0) + node.children.reduce((total, child) => total + totalUsage(child), 0);
  nodes.forEach(node => {
    if (node.children.length) sortTreeByUsage(node.children, pinOtherToBottom);
  });
  return nodes.sort((left, right) => {
    if (pinOtherToBottom) {
      const leftIsOther = left.name.trim().toLocaleLowerCase() === "інше";
      const rightIsOther = right.name.trim().toLocaleLowerCase() === "інше";
      if (leftIsOther !== rightIsOther) return leftIsOther ? 1 : -1;
    }
    return totalUsage(right) - totalUsage(left);
  });
}

const pageConfig: Record<CatalogKind, { title:string; description:string; icon: typeof HiOutlineFolder }> = {
  overview: { title: "Адміністрування платформи", description: "Глобальні довідники та системні шаблони WeGaS.", icon: HiOutlineFolder },
  categories: { title: "Категорії", description: "Глобальні категорії доходів і витрат.", icon: HiOutlineFolder },
  counterparties: { title: "Контрагенти", description: "Глобальний каталог з групами контрагентів, магазинами, людьми та сервісами.", icon: HiOutlineBuildingStorefront },
};

export default function AdminCatalog() {
  const { pathname } = useLocation();
  const isMobile = useIsMobile();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<EditableRecord | null>(null);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [creatingCounterparty, setCreatingCounterparty] = useState<"group" | "counterparty" | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<EditableRecord | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const queryClient = useQueryClient();
  const kind: CatalogKind = pathname.endsWith("/categories") ? "categories" : pathname.endsWith("/counterparties") ? "counterparties" : "overview";
  const categoryQuery = useQuery({ queryKey:["admin", "categories"], queryFn:getAdminCategoriesApi, enabled: kind === "categories" || kind === "overview" });
  const cpCategoryQuery = useQuery({ queryKey:["admin", "counterparty-categories"], queryFn:getAdminCounterpartyCategoriesApi, enabled: kind === "counterparties" || kind === "overview" });
  const counterpartyQuery = useQuery({ queryKey:["admin", "counterparties"], queryFn:getAdminCounterpartiesApi, enabled: kind === "counterparties" || kind === "overview" });
  const config = pageConfig[kind];
  const PageIcon = config.icon;
  const nodes = useMemo(() => {
    if (kind === "categories") return buildCategoriesTree(categoryQuery.data ?? []);
    if (kind === "counterparties") return buildCounterpartiesTree(counterpartyQuery.data ?? [], (cpCategoryQuery.data ?? []) as AdminCounterpartyCategory[]);
    return [];
  }, [kind, categoryQuery.data, cpCategoryQuery.data, counterpartyQuery.data]);
  const loading = kind === "categories" ? categoryQuery.isLoading : kind === "counterparties" ? counterpartyQuery.isLoading || cpCategoryQuery.isLoading : false;
  const failed = kind === "categories" ? categoryQuery.isError : kind === "counterparties" ? counterpartyQuery.isError || cpCategoryQuery.isError : false;
  const recordCount = kind === "categories" ? (categoryQuery.data?.length ?? 0) : (counterpartyQuery.data?.length ?? 0);
  const expandableNodeIds = useMemo(() => {
    const ids = new Set<string>();
    const collect = (node: TreeNode) => { if (node.children.length) { ids.add(node.id); node.children.forEach(collect); } };
    nodes.forEach(collect);
    return ids;
  }, [nodes]);
  const invalidateCounterpartyCatalog = () => queryClient.invalidateQueries({ queryKey: ["admin", "counterparties"] });
  const invalidateCounterpartyCategories = () => queryClient.invalidateQueries({ queryKey: ["admin", "counterparty-categories"] });
  const updateCounterparty = useMutation({ mutationFn: ({ id, input }: { id:string; input:AdminCounterpartyInput }) => updateAdminCounterpartyApi(id, input), onSuccess: () => { invalidateCounterpartyCatalog(); setEditing(null); } });
  const updateCounterpartyCategory = useMutation({ mutationFn: ({ id, input }: { id:string; input:AdminCounterpartyCategoryInput }) => updateAdminCounterpartyCategoryApi(id, input), onSuccess: () => { invalidateCounterpartyCategories(); setEditing(null); } });
  const updateCategory = useMutation({ mutationFn: ({ id, input }: { id:string; input:AdminCategoryInput }) => updateAdminCategoryApi(id, input), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin", "categories"] }); setEditing(null); } });
  const createCategory = useMutation({ mutationFn: createAdminCategoryApi, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin", "categories"] }); setEditing(null); setIsCreatingCategory(false); } });
  const createCounterparty = useMutation({ mutationFn: createAdminCounterpartyApi, onSuccess: () => { invalidateCounterpartyCatalog(); setEditing(null); setCreatingCounterparty(null); } });
  const createCounterpartyCategory = useMutation({ mutationFn: createAdminCounterpartyCategoryApi, onSuccess: () => { invalidateCounterpartyCategories(); setEditing(null); setCreatingCounterparty(null); } });
  const archiveCategory = useMutation({ mutationFn: archiveAdminCategoryApi, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin", "categories"] }); setArchiveTarget(null); } });
  const archiveCounterparty = useMutation({ mutationFn: archiveAdminCounterpartyApi, onSuccess: () => { invalidateCounterpartyCatalog(); setArchiveTarget(null); } });
  const archiveCounterpartyCategory = useMutation({ mutationFn: archiveAdminCounterpartyCategoryApi, onSuccess: () => { invalidateCounterpartyCategories(); setArchiveTarget(null); } });

  if (isMobile) return <Page>Адмінка доступна лише з ПК.</Page>;
  if (kind === "overview") return <Page><PageHeader><div><Eyebrow><HiOutlineUsers /> Platform admin</Eyebrow><h1>{config.title}</h1><p>{config.description}</p></div></PageHeader><Panel><Empty>Оберіть розділ у меню, щоб відкрити глобальний довідник.</Empty></Panel></Page>;
  return <Page>
    <PageHeader><div><Eyebrow><PageIcon /> Platform admin</Eyebrow><h1>{config.title}</h1><p>{config.description}</p></div><div style={{ display: "flex", gap: ".6rem", alignItems: "center" }}>{kind === "categories" && <><AddButton type="button" onClick={() => { setIsCreatingCategory(true); setEditing({ kind: "category", value: { id: "", name: "", type: "expense", icon: "HiTag", color: "#6366f1", parent_id: "", system_key: "" } as AdminCategory }); }}>Додати категорію</AddButton></>}{kind === "counterparties" && <><AddButton type="button" onClick={() => { setCreatingCounterparty("group"); setEditing({ kind: "counterparty-category", value: { id: "", name: "", type: "shop", icon: "HiTag", color: "#6366f1", system_key: "" } as AdminCounterpartyCategory }); }}>Додати групу</AddButton><AddButton type="button" onClick={() => { setCreatingCounterparty("counterparty"); setEditing({ kind: "counterparty", value: { id: "", name: "", type: "shop", icon: "HiBuildingStorefront", logo: "", system_key: "", category_id: null } }); }}>Додати контрагента</AddButton></>}<Count>{recordCount}</Count></div></PageHeader>
    <Panel><Toolbar><Search><HiOutlineMagnifyingGlass /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Пошук у довіднику" aria-label="Пошук у довіднику" /></Search><TreeActions><button type="button" onClick={() => setCollapsed(new Set())}>Розгорнути все</button><button type="button" onClick={() => setCollapsed(new Set(expandableNodeIds))}>Згорнути все</button></TreeActions></Toolbar>{loading ? <Empty>Завантаження…</Empty> : failed ? <Empty>Не вдалося завантажити довідник.</Empty> : <CatalogTree nodes={nodes} query={search} onEdit={kind === "categories" || kind === "counterparties" ? setEditing : undefined} onArchive={kind === "categories" || kind === "counterparties" ? setArchiveTarget : undefined} onAddChild={kind === "categories" || kind === "counterparties" ? (record) => {
      if (record.kind === "category") {
        setIsCreatingCategory(true);
        setEditing({ kind: "category", value: { id: "", name: "", type: record.value.type, icon: "HiTag", color: record.value.color, parent_id: record.value.id, system_key: "" } as AdminCategory });
      } else if (record.kind === "counterparty-category") {
        setCreatingCounterparty("counterparty");
        setEditing({ kind: "counterparty", value: { id: "", name: "", type: record.value.type, icon: "HiBuildingStorefront", logo: "", system_key: "", category_id: record.value.id } as unknown as AdminCounterparty });
      }
    } : undefined} collapsed={collapsed} setCollapsed={setCollapsed} />}</Panel>
    {editing?.kind === "category" && <AdminCategoryEditor category={editing.value} categories={(categoryQuery.data ?? []) as AdminCategory[]} isNew={isCreatingCategory} onClose={() => { setEditing(null); setIsCreatingCategory(false); }} onSave={(id, input) => isCreatingCategory ? createCategory.mutate(input) : updateCategory.mutate({ id, input })} isSaving={updateCategory.isPending || createCategory.isPending} error={updateCategory.error || createCategory.error} />}
    {editing && editing.kind !== "category" && <AdminCounterpartyEditor record={editing} isNew={Boolean(creatingCounterparty)} categories={(cpCategoryQuery.data ?? []) as AdminCounterpartyCategory[]} onClose={() => { setEditing(null); setCreatingCounterparty(null); }} onSaveCounterparty={(id, input) => creatingCounterparty ? createCounterparty.mutate(input) : updateCounterparty.mutate({ id, input })} onSaveCategory={(id, input) => creatingCounterparty ? createCounterpartyCategory.mutate(input) : updateCounterpartyCategory.mutate({ id, input })} isSaving={updateCounterparty.isPending || updateCounterpartyCategory.isPending || createCounterparty.isPending || createCounterpartyCategory.isPending} error={updateCounterparty.error || updateCounterpartyCategory.error || createCounterparty.error || createCounterpartyCategory.error} />}
    {archiveTarget && <ArchiveDialog record={archiveTarget} isLoading={archiveCategory.isPending || archiveCounterparty.isPending || archiveCounterpartyCategory.isPending} onClose={() => setArchiveTarget(null)} onConfirm={() => { if (archiveTarget.kind === "category") archiveCategory.mutate(archiveTarget.value.id); else if (archiveTarget.kind === "counterparty") archiveCounterparty.mutate(archiveTarget.value.id); else archiveCounterpartyCategory.mutate(archiveTarget.value.id); }} />}
  </Page>;
}

function AdminCategoryEditor({
  category,
  categories,
  isNew,
  onClose,
  onSave,
  isSaving,
  error,
}: {
  category: AdminCategory;
  categories: AdminCategory[];
  isNew: boolean;
  onClose: () => void;
  onSave: (id: string, input: AdminCategoryInput) => void;
  isSaving: boolean;
  error: unknown;
}) {
  const [name, setName] = useState(category.name);
  const [type, setType] = useState(category.type);
  const [icon, setIcon] = useState(category.icon || "HiTag");
  const [color, setColor] = useState(category.color || "");
  const [parentId, setParentId] = useState(category.parent_id || "");
  const parents = categories.filter(item => item.id !== category.id && item.type === type && !item.parent_id);
  const parent = parents.find(item => item.id === parentId);
  const generatedKey = `category:${type}:${parent?.system_key?.replace(`category:${type}:`, "") || "root"}:${name.trim().toLocaleLowerCase().replace(/\s+/g, "-")}`;
  const systemKey = isNew ? generatedKey : category.system_key || "";

  return <Backdrop role="presentation" onMouseDown={event => { if (event.target === event.currentTarget && !isSaving) onClose(); }}>
    <Dialog onSubmit={event => { event.preventDefault(); if (name.trim() && systemKey) onSave(category.id, { name: name.trim(), type, icon, color, parent_id: parentId || null, system_key: systemKey }); }} onMouseDown={event => event.stopPropagation()}>
      <DialogHeader><div><h2>{isNew ? "Нова категорія" : "Редагувати категорію"}</h2><p>{isNew ? "Створіть глобальний шаблон для нових сімей." : "Зміни буде синхронізовано з локальними копіями."}</p></div><button type="button" onClick={onClose} disabled={isSaving} aria-label="Закрити"><HiXMark /></button></DialogHeader>
      <Fields>
        <label className="wide">Назва<input value={name} onChange={event => setName(event.target.value)} autoFocus required /></label>
        <label>Тип<select value={type} onChange={event => { setType(event.target.value); setParentId(""); }}><option value="expense">Витрата</option><option value="income">Дохід</option></select></label>
        <label>Батьківська група<select value={parentId} onChange={event => setParentId(event.target.value)}><option value="">Коренева категорія</option>{parents.map(parent => <option key={parent.id} value={parent.id}>{parent.name}</option>)}</select></label>
        <label>Колір<ColorPicker color={color} onColorChange={setColor} square /></label>
        <label>Іконка<IconPicker icon={icon} onIconChange={setIcon} color={color} square /></label>
        <label className="wide">System key<input value={systemKey} readOnly /></label>
      </Fields>
      {error instanceof Error && <FormError>{error.message || "Не вдалося зберегти зміни."}</FormError>}
      <DialogActions><button type="button" onClick={onClose} disabled={isSaving}>Скасувати</button><button type="submit" disabled={isSaving || !name.trim() || !systemKey}>{isSaving ? "Збереження…" : isNew ? "Створити" : "Зберегти"}</button></DialogActions>
    </Dialog>
  </Backdrop>;
}

function ArchiveDialog({ record, isLoading, onClose, onConfirm }: { record: EditableRecord; isLoading: boolean; onClose: () => void; onConfirm: () => void }) {
  return <Backdrop role="presentation" onMouseDown={event => { if (event.target === event.currentTarget && !isLoading) onClose(); }}>
    <Dialog onSubmit={event => { event.preventDefault(); onConfirm(); }} onMouseDown={event => event.stopPropagation()}>
      <DialogHeader><div><h2>Архівувати «{record.value.name}»?</h2><p>Запис зникне з глобального каталогу, але не буде фізично видалений.</p></div><button type="button" onClick={onClose} disabled={isLoading} aria-label="Закрити"><HiXMark /></button></DialogHeader>
      <DialogActions><button type="button" onClick={onClose} disabled={isLoading}>Скасувати</button><button type="submit" disabled={isLoading}>{isLoading ? "Архівація…" : "Архівувати"}</button></DialogActions>
    </Dialog>
  </Backdrop>;
}

function AdminCounterpartyEditor({
  record,
  isNew,
  categories,
  onClose,
  onSaveCounterparty,
  onSaveCategory,
  isSaving,
  error,
}: {
  record: EditableRecord;
  isNew: boolean;
  categories: AdminCounterpartyCategory[];
  onClose: () => void;
  onSaveCounterparty: (id: string, input: AdminCounterpartyInput) => void;
  onSaveCategory: (id: string, input: AdminCounterpartyCategoryInput) => void;
  isSaving: boolean;
  error: unknown;
}) {
  const source = record.value;
  const isGroup = record.kind === "counterparty-category";
  const group = isGroup ? record.value : null;
  const counterparty = record.kind === "counterparty" ? record.value : null;
  const [name, setName] = useState(source.name);
  const [type, setType] = useState(source.type);
  const [icon, setIcon] = useState(source.icon || "HiTag");
  const [color, setColor] = useState(group?.color || "");
  const [logo, setLogo] = useState(counterparty?.logo || "");
  const [categoryId, setCategoryId] = useState(counterparty?.category_id || counterparty?.category?.id || "");
  const logoInputRef = useRef<HTMLInputElement>(null);
  const systemKey = source.system_key || "";
  const generatedKey = `${isGroup ? "counterparty-category" : "counterparty"}:${type}:${name.trim().toLocaleLowerCase().replace(/\s+/g, "-")}`;
  const effectiveSystemKey = isNew ? generatedKey : systemKey;
  const filteredCategories = categories.filter(category => category.type === type);
  const selectLogo = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== "image/svg+xml" || file.size > 20 * 1024) return;
    const reader = new FileReader();
    reader.onload = () => setLogo(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !effectiveSystemKey) return;
    if (isGroup) {
      onSaveCategory(source.id, { name: name.trim(), type, icon, color, system_key: effectiveSystemKey });
      return;
    }
    onSaveCounterparty(source.id, {
      name: name.trim(), type, icon, logo, category_id: categoryId || null, system_key: effectiveSystemKey,
    });
  };

  return <Backdrop role="presentation" onMouseDown={event => { if (event.target === event.currentTarget && !isSaving) onClose(); }}>
    <Dialog onSubmit={submit} onMouseDown={event => event.stopPropagation()}>
      <DialogHeader><div><h2>{isNew ? (isGroup ? "Нова група" : "Новий контрагент") : (isGroup ? "Редагувати групу" : "Редагувати контрагента")}</h2><p>{isNew ? "Створіть глобальний шаблон для нових сімей." : "Зміни буде синхронізовано з локальними копіями."}</p></div><button type="button" onClick={onClose} disabled={isSaving} aria-label="Закрити"><HiXMark /></button></DialogHeader>
      <Fields>
        <label className="wide">Назва<input value={name} onChange={event => setName(event.target.value)} autoFocus required /></label>
        <label>Тип<select value={type} onChange={event => { setType(event.target.value); if (!isGroup) setCategoryId(""); }}>
          <option value="shop">Магазин</option><option value="person">Людина</option><option value="other">Інше</option>
        </select></label>
        <label>Іконка<IconPicker icon={icon} onIconChange={setIcon} color={color || "#6366f1"} square /></label>
        {isGroup ? <label>Колір<ColorPicker color={color} onColorChange={setColor} square /></label> : <>
          <label>Група<select value={categoryId} onChange={event => setCategoryId(event.target.value)}><option value="">Без групи</option>{filteredCategories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
          <label className="wide">Логотип<input ref={logoInputRef} type="file" accept=".svg,image/svg+xml" onChange={selectLogo} style={{ display: "none" }} /><button type="button" onClick={() => logoInputRef.current?.click()} style={{ height: "38px", border: "1px dashed var(--color-border)", borderRadius: "8px", background: "var(--color-bg-page)", color: "var(--color-text-main)", cursor: "pointer" }}><HiPhoto style={{ width: "16px", verticalAlign: "middle", marginRight: ".4rem" }} />{logo ? "Замінити SVG-логотип" : "Додати SVG-логотип"}</button><LogoPreview><LogoPreviewBox><SmartIcon iconName={icon} logo={logo || null} size={25} color={typeColors[type] || "#6366f1"} fillContainer={Boolean(logo)} /></LogoPreviewBox><span>{logo ? "Так логотип виглядатиме у каталозі" : "Зараз відображається вибрана іконка"}</span></LogoPreview>{logo && <button type="button" onClick={() => { setLogo(""); if (logoInputRef.current) logoInputRef.current.value = ""; }} style={{ marginTop: ".35rem", border: 0, background: "transparent", color: "var(--color-danger-600, #dc2626)", cursor: "pointer", textAlign: "left" }}>Прибрати логотип</button>}</label>
        </>}
        <label className="wide">System key<input value={effectiveSystemKey} readOnly /></label>
      </Fields>
      {error instanceof Error && <FormError>{error.message || "Не вдалося зберегти зміни."}</FormError>}
      <DialogActions><button type="button" onClick={onClose} disabled={isSaving}>Скасувати</button><button type="submit" disabled={isSaving || !name.trim() || !effectiveSystemKey}>{isSaving ? "Збереження…" : isNew ? "Створити" : "Зберегти"}</button></DialogActions>
    </Dialog>
  </Backdrop>;
}
