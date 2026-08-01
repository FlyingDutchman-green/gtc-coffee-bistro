"use client";

/**
 * context/SubBrandContext.tsx
 *
 * Client-side context for sub_brands, sub_categories, menus, and best_sellers.
 * Provides data + mutators consumed by:
 *   - app/admin/page.tsx (admin dashboard)
 *   - components/sections/MenuGrid.tsx (landing page interactive section)
 *
 * Data is fetched directly from Supabase on mount (no SSR needed for interactive
 * sections — they are below the fold and managed by client state).
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import type { SubBrand, SubCategory, Menu, BestSeller } from "@/lib/types";

// ── Context shape ─────────────────────────────────────────────────────────────
interface SubBrandContextType {
  // Data
  subBrands: SubBrand[];
  subCategories: Record<string, SubCategory[]>;   // keyed by sub_brand_id
  menus: Record<string, Menu[]>;                  // keyed by sub_category_id
  bestSellers: Record<string, BestSeller[]>;      // keyed by sub_brand_id

  // Loading states
  isLoadingBrands: boolean;
  isLoadingCategories: boolean;

  // Mutators (optimistic + DB sync)
  refetchSubBrands: () => Promise<void>;
  refetchSubCategories: (sub_brand_id: string) => Promise<void>;
  refetchMenus: (sub_category_id: string) => Promise<void>;
  refetchBestSellers: (sub_brand_id: string) => Promise<void>;

  // Local state setters (for optimistic UI after server actions)
  setSubBrands: React.Dispatch<React.SetStateAction<SubBrand[]>>;
  setSubCategories: React.Dispatch<React.SetStateAction<Record<string, SubCategory[]>>>;
  setMenus: React.Dispatch<React.SetStateAction<Record<string, Menu[]>>>;
  setBestSellers: React.Dispatch<React.SetStateAction<Record<string, BestSeller[]>>>;
}

const SubBrandContext = createContext<SubBrandContextType | undefined>(undefined);

export function SubBrandProvider({ children }: { children: ReactNode }) {
  const [subBrands, setSubBrands] = useState<SubBrand[]>([]);
  const [subCategories, setSubCategories] = useState<Record<string, SubCategory[]>>({});
  const [menus, setMenus] = useState<Record<string, Menu[]>>({});
  const [bestSellers, setBestSellers] = useState<Record<string, BestSeller[]>>({});
  const [isLoadingBrands, setIsLoadingBrands] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // ── Fetch all sub-brands on mount ─────────────────────────────────────────
  const refetchSubBrands = useCallback(async () => {
    setIsLoadingBrands(true);
    try {
      const { data, error } = await supabase
        .from("sub_brands")
        .select("*")
        .order("created_at", { ascending: true });
    console.log("DEBUG BEST SELLERS:", data, error);
      if (!error && data) setSubBrands(data as SubBrand[]);
    } finally {
      setIsLoadingBrands(false);
    }
  }, []);

  // ── Fetch sub-categories for a specific sub-brand ─────────────────────────
  const refetchSubCategories = useCallback(async (sub_brand_id: string) => {
    setIsLoadingCategories(true);
    try {
      const { data, error } = await supabase
        .from("sub_categories")
        .select("*")
        .eq("sub_brand_id", sub_brand_id)
        .order("created_at", { ascending: true });
      if (!error && data) {
        setSubCategories((prev) => ({
          ...prev,
          [sub_brand_id]: data as SubCategory[],
        }));
      }
    } finally {
      setIsLoadingCategories(false);
    }
  }, []);

  // ── Fetch menus for a specific sub-category ───────────────────────────────
  const refetchMenus = useCallback(async (sub_category_id: string) => {
    const { data, error } = await supabase
      .from("menus")
      .select("*")
      .eq("sub_category_id", sub_category_id)
      .order("created_at", { ascending: true });
    if (!error && data) {
      setMenus((prev) => ({ ...prev, [sub_category_id]: data as Menu[] }));
    }
  }, []);

  // ── Fetch best sellers for a specific sub-brand ───────────────────────────
  const refetchBestSellers = useCallback(async (sub_brand_id: string) => {
    const { data, error } = await supabase
      .from("best_sellers")
      .select("*")
      .eq("sub_brand_id", sub_brand_id)
      .order("created_at", { ascending: true });
    if (!error && data) {
      setBestSellers((prev) => ({
        ...prev,
        [sub_brand_id]: data as BestSeller[],
      }));
    }
  }, []);

  // Initial load
  useEffect(() => {
    refetchSubBrands();
  }, [refetchSubBrands]);

  return (
    <SubBrandContext.Provider
      value={{
        subBrands,
        subCategories,
        menus,
        bestSellers,
        isLoadingBrands,
        isLoadingCategories,
        refetchSubBrands,
        refetchSubCategories,
        refetchMenus,
        refetchBestSellers,
        setSubBrands,
        setSubCategories,
        setMenus,
        setBestSellers,
      }}
    >
      {children}
    </SubBrandContext.Provider>
  );
}

export function useSubBrand() {
  const ctx = useContext(SubBrandContext);
  if (!ctx) throw new Error("useSubBrand must be used inside <SubBrandProvider>");
  return ctx;
}
