export const TITLE_MAX = 60;
export const HOOK_MAX = 150;
export const DESCRIPTION_WORDS_MIN = 400;
export const DESCRIPTION_WORDS_MAX = 800;
export const PLAY_TITLE_MAX = 30;
export const PLAY_SHORT_MAX = 80;
export const PLAY_LONG_MAX = 4000;
export const CLIP_SECONDS_MIN = 12;
export const CLIP_SECONDS_MAX = 15;

export type JobStatus =
  | "draft"
  | "facts"
  | "copying"
  | "stills"
  | "judging"
  | "motion"
  | "pack"
  | "exporting"
  | "done"
  | "failed";

export type StillFormat = "1:1" | "4:5" | "9:16";
export type StillVerdict = "keep" | "reject";
export type AudioMode = "original" | "none";
export type GenerateTab = "still" | "clip";

export type AssetKind =
  | "cover"
  | "extra"
  | "still"
  | "clip"
  | "audio"
  | "pack_zip";

export type ProductFacts = {
  title: string;
  price: string;
  material: string;
  ownerBrand: string;
};

export type CopyPack = {
  title: string;
  hook: string;
  description: string;
  playTitle: string;
  playShort: string;
  playLong: string;
  script: string;
};

export type StillAsset = {
  id: string;
  format: StillFormat;
  url: string;
  verdict?: StillVerdict;
};

export type Job = {
  id: string;
  shopId: string;
  productId: string;
  ownerId: string;
  status: JobStatus;
  facts: ProductFacts;
  copy: CopyPack | null;
  coverUrl: string | null;
  extraUrls: string[];
  stills: StillAsset[];
  clipUrl: string | null;
  audioMode: AudioMode;
  packUrl: string | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Shop = {
  id: string;
  ownerId: string;
  name: string;
  createdAt: string;
};

export type Product = {
  id: string;
  shopId: string;
  ownerId: string;
  facts: ProductFacts;
  coverUrl: string | null;
  extraUrls: string[];
  createdAt: string;
};

export type SessionUser = {
  id: string;
  email: string;
  source: "supabase" | "local";
};

export type EnvStatus = "ok" | "missing";

export type HealthReport = {
  ok: boolean;
  keys: Record<
    | "NEXT_PUBLIC_SUPABASE_URL"
    | "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    | "SUPABASE_SERVICE_ROLE_KEY"
    | "GROK_API_KEY"
    | "GROK_MODEL"
    | "HIGGSFIELD_API_KEY"
    | "HIGGSFIELD_WORKSPACE_ID"
    | "QUEUE_SECRET"
    | "DEDICATED_SERVER_URL"
    | "PLAY_PACKAGE_NAME",
    { status: EnvStatus; valuePreview?: string }
  >;
};
