import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { createSupabaseAdmin } from "./supabase";
import { supabaseConfigured } from "./env";
import { id, nowIso } from "./ids";
import type { Job, Product, ProductFacts, SessionUser, Shop } from "./types";

const DATA = join(process.cwd(), ".data", "store.json");

type Disk = {
  users: SessionUser[];
  shops: Shop[];
  products: Product[];
  jobs: Job[];
};

function empty(): Disk {
  return { users: [], shops: [], products: [], jobs: [] };
}

function load(): Disk {
  try {
    const raw = JSON.parse(readFileSync(DATA, "utf8")) as Partial<Disk>;
    return {
      users: raw.users ?? [],
      shops: raw.shops ?? [],
      products: raw.products ?? [],
      jobs: raw.jobs ?? [],
    };
  } catch {
    return empty();
  }
}

function save(disk: Disk) {
  mkdirSync(dirname(DATA), { recursive: true });
  writeFileSync(DATA, JSON.stringify(disk, null, 2));
}

export type Store = {
  userByEmail(email: string): Promise<SessionUser | null>;
  rememberUser(user: SessionUser): Promise<SessionUser>;
  ensureShop(user: SessionUser): Promise<Shop>;
  listJobs(ownerId: string): Promise<Job[]>;
  listProducts(ownerId: string): Promise<Product[]>;
  getJob(id: string, ownerId: string): Promise<Job | null>;
  createJob(input: {
    owner: SessionUser;
    shop: Shop;
    facts?: ProductFacts;
    coverUrl?: string | null;
    extraUrls?: string[];
  }): Promise<Job>;
  updateJob(job: Job): Promise<Job>;
  upsertProductFromJob(job: Job): Promise<Product>;
};

function localStore(): Store {
  return {
    async userByEmail(email) {
      const needle = email.trim().toLowerCase();
      return load().users.find((u) => u.email === needle) ?? null;
    },
    async rememberUser(user) {
      const disk = load();
      const existing = disk.users.find((u) => u.email === user.email);
      if (existing) return existing;
      disk.users.push(user);
      save(disk);
      return user;
    },
    async ensureShop(user) {
      const disk = load();
      let shop = disk.shops.find((s) => s.ownerId === user.id);
      if (!shop) {
        shop = {
          id: id(),
          ownerId: user.id,
          name: user.email.split("@")[0] || "Shop",
          createdAt: nowIso(),
        };
        disk.shops.push(shop);
        save(disk);
      }
      return shop;
    },
    async listJobs(ownerId) {
      return load()
        .jobs.filter((j) => j.ownerId === ownerId)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },
    async listProducts(ownerId) {
      return load()
        .products.filter((p) => p.ownerId === ownerId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    async getJob(jobId, ownerId) {
      return load().jobs.find((j) => j.id === jobId && j.ownerId === ownerId) ?? null;
    },
    async createJob({ owner, shop, facts, coverUrl, extraUrls }) {
      const disk = load();
      const product: Product = {
        id: id(),
        shopId: shop.id,
        ownerId: owner.id,
        facts: facts ?? { title: "", price: "", material: "", ownerBrand: "" },
        coverUrl: coverUrl ?? null,
        extraUrls: extraUrls ?? [],
        createdAt: nowIso(),
      };
      const job: Job = {
        id: id(),
        shopId: shop.id,
        productId: product.id,
        ownerId: owner.id,
        status: "draft",
        facts: product.facts,
        copy: null,
        coverUrl: product.coverUrl,
        extraUrls: product.extraUrls,
        stills: [],
        clipUrl: null,
        audioMode: "none",
        packUrl: null,
        error: null,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      disk.products.push(product);
      disk.jobs.push(job);
      save(disk);
      return job;
    },
    async updateJob(job) {
      const disk = load();
      const i = disk.jobs.findIndex((j) => j.id === job.id);
      const next = { ...job, updatedAt: nowIso() };
      if (i === -1) disk.jobs.push(next);
      else disk.jobs[i] = next;
      const p = disk.products.find((x) => x.id === job.productId);
      if (p) {
        p.facts = job.facts;
        p.coverUrl = job.coverUrl;
        p.extraUrls = job.extraUrls;
      }
      save(disk);
      return next;
    },
    async upsertProductFromJob(job) {
      const disk = load();
      let p = disk.products.find((x) => x.id === job.productId);
      if (!p) {
        p = {
          id: job.productId,
          shopId: job.shopId,
          ownerId: job.ownerId,
          facts: job.facts,
          coverUrl: job.coverUrl,
          extraUrls: job.extraUrls,
          createdAt: nowIso(),
        };
        disk.products.push(p);
      } else {
        p.facts = job.facts;
        p.coverUrl = job.coverUrl;
        p.extraUrls = job.extraUrls;
      }
      save(disk);
      return p;
    },
  };
}

function supabaseStore(): Store {
  const admin = createSupabaseAdmin();
  if (!admin) return localStore();

  return {
    async userByEmail() {
      return null;
    },
    async rememberUser(user) {
      return user;
    },
    async ensureShop(user) {
      await admin.from("profiles").upsert({
        id: user.id,
        display_name: user.email.split("@")[0],
      });
      const existing = await admin
        .from("shops")
        .select("*")
        .eq("owner_id", user.id)
        .maybeSingle();
      if (existing.data) {
        return {
          id: existing.data.id,
          ownerId: existing.data.owner_id,
          name: existing.data.name,
          createdAt: existing.data.created_at,
        };
      }
      const created = await admin
        .from("shops")
        .insert({ owner_id: user.id, name: user.email.split("@")[0] || "Shop" })
        .select("*")
        .single();
      if (created.error || !created.data) {
        return localStore().ensureShop(user);
      }
      return {
        id: created.data.id,
        ownerId: created.data.owner_id,
        name: created.data.name,
        createdAt: created.data.created_at,
      };
    },
    async listJobs(ownerId) {
      const { data, error } = await admin
        .from("jobs")
        .select("*")
        .eq("owner_id", ownerId)
        .order("updated_at", { ascending: false });
      if (error || !data) return localStore().listJobs(ownerId);
      return data.map(rowToJob);
    },
    async listProducts(ownerId) {
      const { data, error } = await admin
        .from("products")
        .select("*")
        .eq("owner_id", ownerId)
        .order("created_at", { ascending: false });
      if (error || !data) return localStore().listProducts(ownerId);
      return data.map(rowToProduct);
    },
    async getJob(jobId, ownerId) {
      const { data, error } = await admin
        .from("jobs")
        .select("*")
        .eq("id", jobId)
        .eq("owner_id", ownerId)
        .maybeSingle();
      if (error || !data) return localStore().getJob(jobId, ownerId);
      return rowToJob(data);
    },
    async createJob({ owner, shop, facts, coverUrl, extraUrls }) {
      const productInsert = await admin
        .from("products")
        .insert({
          shop_id: shop.id,
          owner_id: owner.id,
          title: facts?.title ?? "",
          price: facts?.price ?? "",
          material: facts?.material ?? "",
          owner_brand: facts?.ownerBrand ?? "",
          cover_path: coverUrl ?? null,
          extra_paths: extraUrls ?? [],
        })
        .select("*")
        .single();
      if (productInsert.error || !productInsert.data) {
        return localStore().createJob({ owner, shop, facts, coverUrl, extraUrls });
      }
      const jobInsert = await admin
        .from("jobs")
        .insert({
          shop_id: shop.id,
          product_id: productInsert.data.id,
          owner_id: owner.id,
          status: "draft",
          facts: facts ?? { title: "", price: "", material: "", ownerBrand: "" },
          copy: null,
          cover_path: coverUrl ?? null,
          extra_paths: extraUrls ?? [],
          stills: [],
          clip_path: null,
          audio_mode: "none",
          pack_path: null,
          error: null,
        })
        .select("*")
        .single();
      if (jobInsert.error || !jobInsert.data) {
        return localStore().createJob({ owner, shop, facts, coverUrl, extraUrls });
      }
      return rowToJob(jobInsert.data);
    },
    async updateJob(job) {
      const { data, error } = await admin
        .from("jobs")
        .update({
          status: job.status,
          facts: job.facts,
          copy: job.copy,
          cover_path: job.coverUrl,
          extra_paths: job.extraUrls,
          stills: job.stills,
          clip_path: job.clipUrl,
          audio_mode: job.audioMode,
          pack_path: job.packUrl,
          error: job.error,
          updated_at: nowIso(),
        })
        .eq("id", job.id)
        .eq("owner_id", job.ownerId)
        .select("*")
        .single();
      await admin
        .from("products")
        .update({
          title: job.facts.title,
          price: job.facts.price,
          material: job.facts.material,
          owner_brand: job.facts.ownerBrand,
          cover_path: job.coverUrl,
          extra_paths: job.extraUrls,
        })
        .eq("id", job.productId);
      if (error || !data) return localStore().updateJob(job);
      return rowToJob(data);
    },
    async upsertProductFromJob(job) {
      const { data } = await admin
        .from("products")
        .select("*")
        .eq("id", job.productId)
        .maybeSingle();
      if (data) return rowToProduct(data);
      return localStore().upsertProductFromJob(job);
    },
  };
}

type JobRow = {
  id: string;
  shop_id: string;
  product_id: string;
  owner_id: string;
  status: Job["status"];
  facts: ProductFacts;
  copy: Job["copy"];
  cover_path: string | null;
  extra_paths: string[];
  stills: Job["stills"];
  clip_path: string | null;
  audio_mode: Job["audioMode"];
  pack_path: string | null;
  error: string | null;
  created_at: string;
  updated_at: string;
};

type ProductRow = {
  id: string;
  shop_id: string;
  owner_id: string;
  title: string;
  price: string;
  material: string;
  owner_brand: string;
  cover_path: string | null;
  extra_paths: string[];
  created_at: string;
};

function rowToJob(row: JobRow): Job {
  return {
    id: row.id,
    shopId: row.shop_id,
    productId: row.product_id,
    ownerId: row.owner_id,
    status: row.status,
    facts: row.facts,
    copy: row.copy,
    coverUrl: row.cover_path,
    extraUrls: row.extra_paths ?? [],
    stills: row.stills ?? [],
    clipUrl: row.clip_path,
    audioMode: row.audio_mode,
    packUrl: row.pack_path,
    error: row.error,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    shopId: row.shop_id,
    ownerId: row.owner_id,
    facts: {
      title: row.title,
      price: row.price,
      material: row.material,
      ownerBrand: row.owner_brand,
    },
    coverUrl: row.cover_path,
    extraUrls: row.extra_paths ?? [],
    createdAt: row.created_at,
  };
}

let cached: Store | null = null;

export function getStore(): Store {
  if (cached) return cached;
  cached = supabaseConfigured() ? supabaseStore() : localStore();
  return cached;
}
