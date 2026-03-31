import { useState, useMemo, useEffect } from "react";
import { Search, X, Leaf } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import SnackCard from "@/components/SnackCard";
import { type Snack } from "@/lib/snacks-data";
import { supabase } from "@/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/components/Logo";
import { searchWithTypoTolerance } from "@/lib/fuzzy";

const LoadingState = () => {
  const [msgIdx, setMsgIdx] = useState(0);
  const loadingMessages = [
    "Reading the ingredient lists...",
    "Looking for hidden dairy...",
    "Checking 2000+ Indian snacks...",
    "Curating vegan alternatives...",
    "Warming up the oven..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIdx((prev) => (prev + 1) % loadingMessages.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      key="loading"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="py-10 flex flex-col items-center justify-center w-full"
    >
      <div className="relative flex items-center justify-center h-20 w-20 rounded-full bg-[#ccd5ae]/40 mb-6 shadow-[0_10px_30px_rgba(1,71,46,0.1)]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        >
          <Leaf size={32} strokeWidth={1.5} className="text-[#01472e]" />
        </motion.div>
      </div>

      <div className="h-8 mb-12">
        <AnimatePresence mode="wait">
          <motion.p
            key={msgIdx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="font-['Inter'] text-lg font-medium tracking-wide text-[#01472e]"
          >
            {loadingMessages[msgIdx]}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="w-full grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-3xl border border-[#01472e]/10 bg-white/40 p-6 shadow-sm backdrop-blur-sm animate-pulse flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="w-full">
                <div className="h-5 w-3/4 rounded-full bg-[#01472e]/10 mb-3"></div>
                <div className="h-4 w-1/2 rounded-full bg-[#01472e]/5"></div>
              </div>
              <div className="h-6 w-16 shrink-0 rounded-full bg-[#01472e]/10"></div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const HomePage = () => {
  const [query, setQuery] = useState("");
  const [snacks, setSnacks] = useState<Snack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const fetchSnacks = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from<Snack>("isthisvegan_db")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        setError(error.message);
        setSnacks([]);
      } else {
        setSnacks(data ?? []);
      }

      setLoading(false);
    };

    fetchSnacks();
  }, []);

  const categories = useMemo(() => {
    const regions = Array.from(
      new Set(snacks.map((s) => s.main_category?.trim()).filter(Boolean))
    ).sort();
    return ["All", ...regions];
  }, [snacks]);

  const filtered = useMemo(() => {
    let base = snacks;

    // Step 1: Filter by category if one is selected
    if (activeCategory !== "All") {
      base = base.filter((s) => s.main_category === activeCategory);
    }

    // Step 2: Use typo-tolerant fuzzy finder for spelling matches 
    //         if search query exists
    if (!debouncedQuery.trim()) return base;

    return searchWithTypoTolerance(
      base,
      debouncedQuery,
      (s: Snack) => [s.name, s.brand || ""]
    );
  }, [activeCategory, debouncedQuery, snacks]);

  const motionEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

  return (
    <div className="relative min-h-screen bg-[#fefae0] text-[#01472e]">
      <div className="noise-overlay pointer-events-none fixed inset-0 z-[1]" aria-hidden />
      <div className="relative z-10">
        <div className="rounded-t-[5rem] bg-[#ccd5ae] py-10 md:py-14">
          <div className="container">
            <motion.h1
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: motionEase }}
              className="max-w-5xl font-['Playfair_Display'] text-[clamp(2.5rem,8.2vw,6.2rem)] font-semibold leading-[0.95] tracking-[-0.015em] text-[#01472e]"
            >
              Wondering if your Indian Snack{" "}
              <br className="hidden sm:inline" />
              is Vegan or Not?
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.08, ease: motionEase }}
              className="mt-5 max-w-2xl font-['Inter'] text-base text-[#01472e]/75 md:text-lg"
            >
              Search 2000+ Indian food & beverages.
              <br className="hidden sm:inline" />
              <br className="hidden sm:inline" />
              Ultimate Guide for Vegans in India.
            </motion.p>
          </div>
        </div>
        <div className="container py-8 md:py-10">
          <div className="sticky top-16 z-40 mb-8 rounded-[2rem] border border-white/60 bg-white/70 p-3 shadow-[0_12px_30px_rgba(1,71,46,0.08)] backdrop-blur-md md:p-4">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.12, ease: motionEase }}
              className="relative"
            >
              <Search
                size={18}
                strokeWidth={1.5}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#01472e]/50"
                aria-hidden="true"
              />
              <Input
                type="search"
                placeholder="Search by name or brand..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-14 rounded-[2.5rem] border-[#01472e]/20 bg-[#fefae0]/80 pl-11 pr-11 font-['Inter'] text-base text-[#01472e] shadow-[0_20px_40px_rgba(1,71,46,0.2)] backdrop-blur-sm transition-shadow duration-700 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] focus-visible:ring-2 focus-visible:ring-[#01472e]/45 focus-visible:ring-offset-2"
                aria-label="Search snacks"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#01472e]/60 transition-colors duration-700 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:bg-[#01472e]/10 hover:text-[#01472e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#01472e]/35"
                  aria-label="Clear search"
                >
                  <X size={16} strokeWidth={1.5} />
                </button>
              )}
            </motion.div>
            <div className="mt-3 overflow-x-auto pb-1">
              <div className="flex min-w-max items-center gap-2">
                {categories.map((category) => (
                  <Badge
                    key={category}
                    variant="outline"
                    onClick={() => setActiveCategory(category)}
                    className={`cursor-pointer rounded-full px-3 py-1.5 font-['Inter'] text-[11px] uppercase tracking-[0.22em] transition-all duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] ${activeCategory === category
                      ? "border-[#01472e] bg-[#01472e] text-[#fefae0]"
                      : "border-[#01472e]/20 bg-[#fefae0]/70 text-[#01472e]/80 hover:border-[#01472e]/45 hover:text-[#01472e]"
                      }`}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <LoadingState />
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: motionEase }}
                className="botanical-watermark py-20 text-center"
              >
                <p className="font-['Inter'] text-lg text-[#01472e]">
                  Failed to load snacks from Supabase.
                </p>
                <p className="mt-2 break-words font-['Inter'] text-sm text-[#01472e]/70">
                  {error}
                </p>
              </motion.div>
            ) : filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: motionEase }}
                className="botanical-watermark py-20 text-center"
              >
                <div className="mx-auto max-w-xl rounded-[2.5rem] border border-[#01472e]/15 bg-white/70 p-8 shadow-[0_18px_36px_rgba(1,71,46,0.12)] backdrop-blur-sm">
                  <p className="font-['Inter'] text-xl font-semibold text-[#01472e]">
                    No Results Found
                  </p>
                  <p className="mt-2 font-['Inter'] text-sm text-[#01472e]/70">
                    Try another keyword or category, or suggest a snack to add next.
                  </p>
                  <Button
                    asChild
                    className="mt-5 rounded-full bg-[#01472e] px-6 font-['Inter'] text-xs font-bold uppercase tracking-[0.22em] text-[#fefae0] hover:bg-[#01472e]/90"
                  >
                    <a href="mailto:info.isthisvegan@gmail.com?subject=New Snack Suggestion for IsThisVegan">
                      Suggest a Snack
                    </a>
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={`${debouncedQuery}-${activeCategory}`}
                initial="hidden"
                animate="show"
                exit="hidden"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: { staggerChildren: 0.05, delayChildren: 0.02 },
                  },
                }}
                className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6"
              >
                {filtered.map((snack, i) => (
                  <motion.div
                    key={snack.slug}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      show: { opacity: 1, y: 0 },
                    }}
                    transition={{ duration: 0.6, ease: motionEase }}
                  >
                    <SnackCard snack={snack} index={i} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
