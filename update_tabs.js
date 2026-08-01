const fs = require('fs');
let c = fs.readFileSync('components/sections/MenuCategoryTabs.tsx', 'utf8');

c = c.replace(
  /interface MenuCategoryTabsProps \{[\s\S]*?\}/,
  'interface MenuCategoryTabsProps {\n  categories: readonly MenuCategory[];\n  allBestSellers?: any[];\n}'
);

c = c.replace(
  /export function MenuCategoryTabs\(\{ categories \}: MenuCategoryTabsProps\) \{/,
  'export function MenuCategoryTabs({ categories, allBestSellers = [] }: MenuCategoryTabsProps) {'
);

c = c.replace(
  /<ItemPanel\s+category=\{activeCategory\}\s+panelId=\{panelId\}\s+onOpenFullMenu=\{handleOpenFullMenu\}\s*\/>/m,
  '<ItemPanel\n              category={activeCategory}\n              panelId={panelId}\n              onOpenFullMenu={handleOpenFullMenu}\n              allBestSellers={allBestSellers}\n            />'
);

c = c.replace(
  /interface PanelProps \{[\s\S]*?\}/,
  'interface PanelProps {\n  category: MenuCategory;\n  panelId: string;\n  onOpenFullMenu: (categoryName: string) => void;\n  allBestSellers?: any[];\n}'
);

c = c.replace(
  /function ItemPanel\(\{ category, panelId, onOpenFullMenu \}: PanelProps\) \{[\s\S]*?const bestSellers = category.featured.slice\(0, 3\);/,
  'function ItemPanel({ category, panelId, onOpenFullMenu, allBestSellers = [] }: PanelProps) {\n  const bestSellers = allBestSellers.filter((bs: any) => bs.sub_brands?.name === category.name).slice(0, 3);'
);

// Mobile list fallback
c = c.replace(
  /<div className=\"flex sm:hidden flex-col gap-5 mb-6 mt-4\">/,
  '<div className="flex sm:hidden flex-col gap-5 mb-6 mt-4">\n        {bestSellers.length === 0 && <p className="text-crema-300/40 text-sm italic">Belum ada menu best seller</p>}'
);
c = c.replace(
  /\{bestSellers\.map\(\(item\) => \(/g,
  '{bestSellers.map((item: any) => ('
);

// Desktop list replace
const desktopRegex = /<ul\s+role=\"list\"\s+className=\"hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6\"\s*>[\s\S]*?<\/ul>/;
const desktopReplacement = `<ul
        role="list"
        className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
      >
        {bestSellers.length === 0 && <p className="text-crema-300/40 text-sm italic col-span-3">Belum ada menu best seller</p>}
        {bestSellers.map((item: any) => (
          <li
            key={item.id || item.name}
            className={[
              "relative flex flex-col rounded-xl overflow-hidden",
              "bg-espresso-900 ring-1 ring-crema-50/6",
              "transition-transform duration-200 ease-out hover:scale-[1.02]",
              "hover:ring-amber-bistro/30",
            ].join(" ")}
            style={{ willChange: "transform" }}
          >
            {item.image_url ? (
              <div className="relative w-full aspect-[4/3] overflow-hidden">
                <Image src={item.image_url} alt={item.name} fill className="object-cover" sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 28vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-espresso-900/90 via-transparent to-transparent" />
                {item.badge && (
                   <span className="absolute top-2 left-2 text-[9px] tracking-widest uppercase text-[#121212] bg-amber-bistro font-bold px-2 py-0.5 rounded-full">
                     {item.badge}
                   </span>
                )}
              </div>
            ) : (
              <div className="relative w-full aspect-[4/3] bg-espresso-800 flex items-center justify-center">
                 {item.badge && (
                   <span className="absolute top-2 left-2 text-[9px] tracking-widest uppercase text-[#121212] bg-amber-bistro font-bold px-2 py-0.5 rounded-full">
                     {item.badge}
                   </span>
                 )}
                 <span className="text-amber-bistro/40 text-3xl font-serif">{item.name.charAt(0)}</span>
              </div>
            )}
            <div className="p-4 flex flex-col gap-1.5 flex-1">
              <span className="text-sm font-semibold text-crema-100 leading-snug">
                {item.name}
              </span>
              <p className="text-xs leading-relaxed text-crema-300/60 line-clamp-2">
                {item.description}
              </p>
              <span className="mt-auto pt-2 text-sm font-bold text-amber-bistro font-mono">
                {item.price}
              </span>
            </div>
          </li>
        ))}
      </ul>`;

c = c.replace(desktopRegex, desktopReplacement);
fs.writeFileSync('components/sections/MenuCategoryTabs.tsx', c);
