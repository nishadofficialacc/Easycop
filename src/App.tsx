import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Heart,
  Headphones,
  Leaf,
  Menu,
  Minus,
  Monitor,
  PackageCheck,
  Plus,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { products, type Product } from "./data/products";

type Cart = Record<string, number>;
type Category = "All finds" | Product["category"];
type Modal =
  | { kind: "product"; product: Product }
  | { kind: "cart" | "checkout" | "about" }
  | null;
const categories: Category[] = [
  "All finds",
  "Audio",
  "Workspace",
  "Everyday",
  "Home",
];
const money = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    amount,
  );

function readStored<T>(
  key: string,
  fallback: T,
  validate: (value: unknown) => value is T,
): T {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) ?? "null");
    return validate(value) ? value : fallback;
  } catch {
    return fallback;
  }
}
const validCart = (value: unknown): value is Cart =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value) &&
  Object.entries(value).every(
    ([id, count]) =>
      products.some((p) => p.id === id && p.kind === "resale") &&
      Number.isInteger(count) &&
      Number(count) > 0 &&
      Number(count) <= 20,
  );
const validSaved = (value: unknown): value is string[] =>
  Array.isArray(value) &&
  value.every(
    (id) => typeof id === "string" && products.some((p) => p.id === id),
  );

function Dialog({
  title,
  children,
  onClose,
  drawer = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  drawer?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      aria-label={title}
      className={`dialog ${drawer ? "drawer" : ""}`}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="dialog-content">
        <button
          className="icon-button dialog-close"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <X size={21} />
        </button>
        {children}
      </div>
    </dialog>
  );
}

function Burst({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true">
      <path
        d="M50 8v84M8 50h84M20 20l60 60M20 80l60-60"
        fill="none"
        stroke="currentColor"
        strokeWidth="9"
        strokeLinecap="round"
      />
    </svg>
  );
}

function App() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("All finds");
  const [sort, setSort] = useState("favorites");
  const [savedOnly, setSavedOnly] = useState(false);
  const [dealsOnly, setDealsOnly] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [cart, setCart] = useState<Cart>(() =>
    readStored("easycop.cart.v1", {}, validCart),
  );
  const [saved, setSaved] = useState<string[]>(() =>
    readStored("easycop.saved.v1", [], validSaved),
  );
  const [modal, setModal] = useState<Modal>(null);
  const [toast, setToast] = useState("");
  const [copied, setCopied] = useState(false);
  const catalogRef = useRef<HTMLElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const hero =
    products.find((p) => p.id === "studio-headphones") ?? products[0];
  const cartItems = products.filter((p) => cart[p.id]);
  const count = Object.values(cart).reduce(
    (sum, quantity) => sum + quantity,
    0,
  );
  const total = cartItems.reduce((sum, p) => sum + p.price * cart[p.id], 0);

  useEffect(() => {
    try {
      localStorage.setItem("easycop.cart.v1", JSON.stringify(cart));
    } catch {
      /* Shopping remains available when storage is disabled. */
    }
  }, [cart]);
  useEffect(() => {
    try {
      localStorage.setItem("easycop.saved.v1", JSON.stringify(saved));
    } catch {
      /* Favorites remain available for this visit. */
    }
  }, [saved]);
  useEffect(() => () => clearTimeout(toastTimer.current), []);
  const notify = (message: string) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3200);
  };
  const browse = (
    nextCategory: Category = "All finds",
    deals = false,
    favorites = false,
  ) => {
    setCategory(nextCategory);
    setQuery("");
    setDealsOnly(deals);
    setSavedOnly(favorites);
    setMobileMenu(false);
    catalogRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const toggleSaved = (p: Product) => {
    const exists = saved.includes(p.id);
    setSaved((old) =>
      exists ? old.filter((id) => id !== p.id) : [...old, p.id],
    );
    notify(
      exists ? "Removed from your saved finds" : "Added to your saved finds",
    );
  };
  const addToCart = (p: Product) => {
    if ((cart[p.id] ?? 0) >= 20) {
      notify("You can add up to 20 of each item.");
      return;
    }
    setCart((old) => ({ ...old, [p.id]: (old[p.id] ?? 0) + 1 }));
    notify(`${p.name} added to your bag`);
  };
  const updateQuantity = (id: string, quantity: number) =>
    setCart((old) => {
      const next = { ...old };
      if (quantity <= 0) delete next[id];
      else next[id] = Math.min(quantity, 20);
      return next;
    });
  const filtered = products
    .filter(
      (p) =>
        (category === "All finds" || p.category === category) &&
        (!savedOnly || saved.includes(p.id)) &&
        (!dealsOnly || (p.originalPrice ?? p.price) > p.price) &&
        `${p.name} ${p.brand} ${p.category} ${p.description}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
    )
    .sort((a, b) =>
      sort === "price-asc"
        ? a.price - b.price
        : sort === "price-desc"
          ? b.price - a.price
          : sort === "newest"
            ? products.indexOf(b) - products.indexOf(a)
            : 0,
    );
  const orderSummary = `Easycop sample order\n${cartItems.map((p) => `${p.name} × ${cart[p.id]} — ${money(p.price * cart[p.id])}`).join("\n")}\nSubtotal: ${money(total)} USD\nSample order only. No order has been placed. Shipping and taxes are not calculated.`;
  const copyOrder = async () => {
    try {
      await navigator.clipboard.writeText(orderSummary);
      setCopied(true);
    } catch {
      notify("Copy is unavailable. Select the order summary text to copy it.");
    }
  };

  return (
    <>
      <div className="announcement">
        <span>Considered finds. Everyday upgrades.</span>
        <button onClick={() => browse("All finds", true)}>
          A good day for a good find <ArrowRight size={13} />
        </button>
        <span className="announcement-currency">USD $</span>
      </div>
      <header className="site-header">
        <div className="header-main page-width">
          <a
            className="logo"
            href="#"
            aria-label="Easycop home"
            onClick={() => {
              setQuery("");
              setSavedOnly(false);
              setDealsOnly(false);
              setCategory("All finds");
            }}
          >
            <ShoppingBag strokeWidth={2} />
            <span>
              easycop<span className="logo-dot">.</span>
            </span>
          </a>
          <form
            className="search"
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              catalogRef.current?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <Search size={18} />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setSavedOnly(false);
                setDealsOnly(false);
                setCategory("All finds");
              }}
              placeholder="Search your next favorite..."
              aria-label="Search products"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            ) : (
              <kbd>⌕</kbd>
            )}
          </form>
          <div className="header-actions">
            <button
              className={`icon-button ${savedOnly ? "selected" : ""}`}
              aria-label="Saved items"
              aria-pressed={savedOnly}
              onClick={() => browse("All finds", false, !savedOnly)}
            >
              <Heart size={22} />
              {saved.length > 0 && (
                <span className="tiny-count">{saved.length}</span>
              )}
            </button>
            <span className="action-divider" />
            <button
              className="bag-button"
              aria-label={`Open shopping bag (${count} items)`}
              onClick={() => setModal({ kind: "cart" })}
            >
              <ShoppingBag size={21} />
              <span className="bag-label">My bag</span>
              <span className="bag-count">{count}</span>
            </button>
            <button
              className="icon-button mobile-toggle"
              aria-label="Toggle navigation"
              aria-expanded={mobileMenu}
              onClick={() => setMobileMenu(!mobileMenu)}
            >
              {mobileMenu ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        <nav
          className={`navigation page-width ${mobileMenu ? "is-open" : ""}`}
          aria-label="Main navigation"
        >
          <div>
            <button className="nav-active" onClick={() => browse()}>
              Shop all
            </button>
            <button onClick={() => browse("Audio")}>Tech & gadgets</button>
            <button onClick={() => browse("Everyday")}>Lifestyle</button>
            <button
              onClick={() => {
                browse();
                setSort("newest");
              }}
            >
              New finds <span className="new-dot" />
            </button>
            <button
              onClick={() => {
                setMobileMenu(false);
                document
                  .getElementById("the-edit")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              The edit
            </button>
            <button
              onClick={() => {
                setMobileMenu(false);
                setModal({ kind: "about" });
              }}
            >
              About us
            </button>
          </div>
          <button
            className="nav-deals"
            onClick={() => browse("All finds", true)}
          >
            <Zap size={15} /> Little prices. Big finds.
          </button>
        </nav>
      </header>

      <main>
        <section className="hero page-width" aria-labelledby="hero-title">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="orange-dot" /> LESS SEARCHING. MORE DISCOVERING.
            </div>
            <h1 id="hero-title">
              Good finds.
              <br />
              Made <span>easy.</span>
              <svg
                className="underline-swoosh"
                viewBox="0 0 220 20"
                aria-hidden="true"
              >
                <path d="M3 14C60 2 146 2 216 10M42 18c53-9 115-8 148-5" />
              </svg>
            </h1>
            <p>
              Thoughtful tech. Everyday essentials.
              <br />
              The things you’ll love, all in one place.
            </p>
            <div className="hero-buttons">
              <button className="button button-orange" onClick={() => browse()}>
                Explore the collection <ArrowUpRight size={19} />
              </button>
              <button
                className="text-link"
                onClick={() => setModal({ kind: "about" })}
              >
                How we pick <ArrowRight size={16} />
              </button>
            </div>
            <div className="hero-note">
              <div className="mini-icons">
                <span>
                  <Headphones size={17} />
                </span>
                <span>
                  <Monitor size={17} />
                </span>
                <span>
                  <Leaf size={17} />
                </span>
              </div>
              <span>
                A little tech. A little lifestyle.
                <br />
                <strong>A lot to love.</strong>
              </span>
            </div>
          </div>
          <div className="hero-art">
            <span className="hero-edition">
              THE EVERYDAY EDIT <span>01 / 26</span>
            </span>
            <div className="hero-orbit" />
            <img
              className="hero-image"
              src="/images/hero-headphones.jpg"
              alt="Over-ear headphones from our everyday audio collection"
              fetchPriority="high"
            />
            <div className="hero-sticker">
              <Sparkles size={19} />
              <span>
                GOOD SOUND.
                <br />
                GREAT FIND.
              </span>
            </div>
            <div className="hero-feature">
              <div>
                <span className="small-label">IN THE SPOTLIGHT</span>
                <button
                  onClick={() => setModal({ kind: "product", product: hero })}
                >
                  {hero.name} <ArrowUpRight size={20} />
                </button>
                <span>Find your everyday soundtrack.</span>
              </div>
              <button
                className="round-button"
                aria-label={`Discover ${hero.name}`}
                onClick={() => setModal({ kind: "product", product: hero })}
              >
                <ArrowUpRight size={23} />
              </button>
            </div>
            <span className="hero-side-label">TURN UP YOUR EVERYDAY</span>
          </div>
        </section>

        <section
          className="benefits page-width"
          aria-label="The Easycop approach"
        >
          <div>
            <span className="benefit-icon">
              <Sparkles size={23} />
            </span>
            <span>
              <strong>Good things, carefully picked</strong>
              <small>A considered collection, minus the clutter.</small>
            </span>
          </div>
          <div>
            <span className="benefit-icon">
              <ShoppingBag size={23} />
            </span>
            <span>
              <strong>Your favorite ways to shop</strong>
              <small>Shop our store or discover retailer finds.</small>
            </span>
          </div>
          <div>
            <span className="benefit-icon">
              <PackageCheck size={23} />
            </span>
            <span>
              <strong>Little upgrades. Lasting favorites.</strong>
              <small>Made for the way you live, work, and play.</small>
            </span>
          </div>
        </section>

        <section
          className="catalog page-width"
          ref={catalogRef}
          id="collection"
          aria-labelledby="catalog-title"
        >
          <div className="section-heading">
            <div>
              <div className="eyebrow section-eyebrow">
                <span /> THE GOOD STUFF
              </div>
              <h2 id="catalog-title">
                {savedOnly
                  ? "Your saved favorites."
                  : dealsOnly
                    ? "Great finds. Little prices."
                    : "Meet your next favorite."}
              </h2>
              <p>
                {savedOnly
                  ? "The good finds you’re keeping an eye on."
                  : dealsOnly
                    ? "A few everyday upgrades for a little less."
                    : "A fresh selection of tech and everyday essentials."}
              </p>
            </div>
            <button
              className="text-link desktop-link"
              onClick={() => {
                browse();
                setSort("favorites");
              }}
            >
              Explore all finds <ArrowUpRight size={18} />
            </button>
          </div>
          <div className="catalog-toolbar">
            <div className="category-tabs" aria-label="Product categories">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={cat === category ? "active" : ""}
                  aria-pressed={cat === category}
                  onClick={() => setCategory(cat)}
                >
                  {cat === "All finds" && <SlidersHorizontal size={15} />}
                  {cat}
                </button>
              ))}
            </div>
            <label className="sort">
              <span>Sort by:</span>
              <select
                aria-label="Sort products"
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                <option value="favorites">Our favorites</option>
                <option value="newest">Newest finds</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </select>
              <ChevronDown size={14} />
            </label>
          </div>
          {(query || savedOnly || dealsOnly) && (
            <div className="filter-status" aria-live="polite">
              <span>
                {filtered.length} {filtered.length === 1 ? "find" : "finds"}
                {query && ` for “${query}”`}
                {savedOnly && " in your saved collection"}
                {dealsOnly && " on sale"}
              </span>
              <button onClick={() => browse()}>
                Clear filters <X size={13} />
              </button>
            </div>
          )}
          {filtered.length ? (
            <div className="product-grid">
              {filtered.map((p) => (
                <article
                  className="product-card"
                  data-testid="product-card"
                  key={p.id}
                >
                  <div
                    className="product-visual"
                    style={{ backgroundColor: p.color }}
                  >
                    <button
                      className="product-image-button"
                      aria-label={`View ${p.name}`}
                      onClick={() => setModal({ kind: "product", product: p })}
                    >
                      <img src={p.image} alt={p.name} loading="lazy" />
                      <span className="quick-look">
                        Take a closer look <ArrowUpRight size={15} />
                      </span>
                    </button>
                    {p.badge && (
                      <span
                        className={`product-badge ${p.badge.toLowerCase().includes("sale") ? "sale-badge" : ""}`}
                      >
                        {p.badge}
                      </span>
                    )}
                    <button
                      className={`save-button ${saved.includes(p.id) ? "is-saved" : ""}`}
                      aria-label={`${saved.includes(p.id) ? "Unsave" : "Save"} ${p.name}`}
                      aria-pressed={saved.includes(p.id)}
                      onClick={() => toggleSaved(p)}
                    >
                      <Heart
                        size={17}
                        fill={saved.includes(p.id) ? "currentColor" : "none"}
                      />
                    </button>
                  </div>
                  <div className="product-meta">
                    <span>{p.category}</span>
                    <span
                      className={
                        p.kind === "affiliate" ? "retailer-tag" : "shop-tag"
                      }
                    >
                      {p.kind === "affiliate" ? (
                        <>
                          <ArrowUpRight size={12} /> Retailer find
                        </>
                      ) : (
                        <>
                          <span /> Easycop shop
                        </>
                      )}
                    </span>
                  </div>
                  <button
                    className="product-name"
                    onClick={() => setModal({ kind: "product", product: p })}
                  >
                    {p.name}
                  </button>
                  <p className="product-description">{p.description}</p>
                  <div className="product-bottom">
                    <div>
                      <span
                        className="product-price"
                        data-testid="product-price"
                      >
                        {money(p.price)}
                      </span>
                      {p.originalPrice && <del>{money(p.originalPrice)}</del>}
                    </div>
                    {p.kind === "resale" ? (
                      <button
                        className="add-button"
                        aria-label={`Add ${p.name} to bag`}
                        onClick={() => addToCart(p)}
                      >
                        <Plus size={18} />
                      </button>
                    ) : (
                      <a
                        className="add-button"
                        href={p.url}
                        target="_blank"
                        rel="sponsored noopener noreferrer"
                        aria-label={`View ${p.name} at ${p.retailer}`}
                      >
                        <ArrowUpRight size={18} />
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Search size={34} />
              <h3>
                {savedOnly
                  ? "Your favorites start here."
                  : "No finds just yet."}
              </h3>
              <p>
                {savedOnly
                  ? "Tap the heart on a product to save it for later."
                  : "Try another search or explore a different category."}
              </p>
              <button className="button button-green" onClick={() => browse()}>
                Explore all finds <ArrowRight size={16} />
              </button>
            </div>
          )}
          <div className="catalog-footnote">
            <span>
              <span className="shop-tag">
                <span /> Easycop shop
              </span>{" "}
              Add it to your bag.
            </span>
            <span>
              <ArrowUpRight size={13} /> Retailer find{" "}
              <span>Discover it at the retailer.</span>
            </span>
            <button onClick={() => setModal({ kind: "about" })}>
              A little transparency <ArrowUpRight size={13} />
            </button>
          </div>
        </section>

        <section
          className="editorial page-width"
          id="the-edit"
          aria-labelledby="edit-title"
        >
          <div className="edit-card edit-main">
            <div className="eyebrow">THE EASYCOP EDIT</div>
            <h2 id="edit-title">
              Better days start
              <br />
              with the little things.
            </h2>
            <p>
              A calmer desk. A better playlist. A new daily favorite.
              <br />
              Make room for what makes your everyday better.
            </p>
            <button
              className="button button-cream"
              onClick={() => browse("Workspace")}
            >
              Upgrade your everyday <ArrowUpRight size={18} />
            </button>
            <div className="edit-decoration" aria-hidden="true">
              <div className="decor-circle">
                <Monitor size={78} strokeWidth={1} />
              </div>
              <Burst className="decor-star" />
            </div>
          </div>
          <div className="edit-card edit-note">
            <div className="eyebrow">
              <Leaf size={17} /> A MORE CONSIDERED COLLECTION
            </div>
            <h2>
              Less endless scrolling.
              <br />
              More “that’s the one.”
            </h2>
            <p>
              We bring the interesting things together.
              <br />
              You find the things that feel like you.
            </p>
            <button
              className="text-link"
              onClick={() => setModal({ kind: "about" })}
            >
              Get to know Easycop <ArrowUpRight size={18} />
            </button>
            <Burst className="note-squiggle" />
          </div>
        </section>

        <section className="closing page-width">
          <span className="closing-icon">
            <ShoppingBag size={27} />
          </span>
          <div>
            <h2>Your next good find is waiting.</h2>
            <p>Take a look around. Make yourself at home.</p>
          </div>
          <button className="text-link" onClick={() => browse()}>
            Back to the good stuff <ArrowDown size={17} className="up-arrow" />
          </button>
        </section>
      </main>
      <footer className="footer">
        <div className="footer-main page-width">
          <div>
            <a className="logo" href="#">
              <ShoppingBag />
              <span>
                easycop<span className="logo-dot">.</span>
              </span>
            </a>
            <p>Good finds. Made easy.</p>
          </div>
          <div className="footer-links">
            <button onClick={() => browse()}>Shop the collection</button>
            <button onClick={() => setModal({ kind: "about" })}>
              About & how it works
            </button>
            <button onClick={() => browse("All finds", false, true)}>
              Saved finds
            </button>
          </div>
          <span className="footer-note">
            A little tech. A little lifestyle.
            <br />A whole lot of possibility.
          </span>
        </div>
        <div className="footer-bottom page-width">
          <span>© {new Date().getFullYear()} Easycop</span>
          <p>
            Demo storefront · Illustrative products, images, and USD prices.
            Retailer prices may vary. Checkout is not enabled.
          </p>
          <button onClick={() => setModal({ kind: "about" })}>
            Affiliate disclosure
          </button>
        </div>
      </footer>

      {modal && (
        <Dialog
          key={modal.kind}
          title={
            modal.kind === "product"
              ? modal.product.name
              : modal.kind === "cart"
                ? "Your shopping bag"
                : modal.kind === "checkout"
                  ? "Review your order"
                  : "About Easycop"
          }
          drawer={modal.kind === "cart"}
          onClose={() => setModal(null)}
        >
          {modal.kind === "product" && (
            <div className="product-detail">
              <div
                className="detail-image"
                style={{ backgroundColor: modal.product.color }}
              >
                <img src={modal.product.image} alt={modal.product.name} />
              </div>
              <div className="detail-copy">
                <span className="eyebrow">
                  {modal.product.category} / THE EASYCOP COLLECTION
                </span>
                <h2>{modal.product.name}</h2>
                <p>{modal.product.description}</p>
                <div className="detail-price">
                  {money(modal.product.price)}{" "}
                  {modal.product.originalPrice && (
                    <del>{money(modal.product.originalPrice)}</del>
                  )}
                </div>
                <ul>
                  {modal.product.features.map((feature) => (
                    <li key={feature}>
                      <Check size={16} />
                      {feature}
                    </li>
                  ))}
                </ul>
                {modal.product.kind === "resale" ? (
                  <button
                    className="button button-green full-width"
                    onClick={() => addToCart(modal.product)}
                  >
                    Add to bag <ShoppingBag size={18} />
                  </button>
                ) : (
                  <a
                    className="button button-green full-width"
                    href={modal.product.url}
                    target="_blank"
                    rel="sponsored noopener noreferrer"
                  >
                    View at {modal.product.retailer} <ArrowUpRight size={18} />
                  </a>
                )}
                <button
                  className="detail-save"
                  onClick={() => toggleSaved(modal.product)}
                >
                  <Heart
                    size={16}
                    fill={
                      saved.includes(modal.product.id) ? "currentColor" : "none"
                    }
                  />
                  {saved.includes(modal.product.id)
                    ? "Saved to your favorites"
                    : "Save for later"}
                </button>
                <p className="detail-disclaimer">
                  {modal.product.kind === "affiliate"
                    ? "This opens a retailer website. Check current prices, availability, and terms there. Demo retailer links are not monetized."
                    : "Sample product for exploring the store. Checkout and fulfillment are not yet available."}{" "}
                  Product imagery is illustrative.
                </p>
              </div>
            </div>
          )}
          {modal.kind === "cart" && (
            <div className="cart-content">
              <span className="eyebrow">YOUR GOOD FINDS</span>
              <h2>
                Your shopping bag<span> ({count})</span>
              </h2>
              {cartItems.length ? (
                <>
                  <div className="cart-items">
                    {cartItems.map((p) => (
                      <div className="cart-item" key={p.id}>
                        <img src={p.image} alt={p.name} />
                        <div className="cart-item-info">
                          <h3>{p.name}</h3>
                          <p>{money(p.price)}</p>
                          <div className="quantity">
                            <button
                              disabled={cart[p.id] <= 1}
                              aria-label={`Decrease ${p.name} quantity`}
                              onClick={() =>
                                updateQuantity(p.id, cart[p.id] - 1)
                              }
                            >
                              <Minus size={14} />
                            </button>
                            <span data-testid={`quantity-${p.id}`}>
                              {cart[p.id]}
                            </span>
                            <button
                              disabled={cart[p.id] >= 20}
                              aria-label={`Increase ${p.name} quantity`}
                              onClick={() =>
                                updateQuantity(p.id, cart[p.id] + 1)
                              }
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                        <button
                          className="remove-button"
                          aria-label={`Remove ${p.name}`}
                          onClick={() => updateQuantity(p.id, 0)}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="cart-summary">
                    <div>
                      <strong>Subtotal</strong>
                      <strong data-testid="cart-total">{money(total)}</strong>
                    </div>
                    <p>USD · Shipping and taxes are not calculated.</p>
                    <button
                      className="button button-green full-width"
                      onClick={() => {
                        setCopied(false);
                        setModal({ kind: "checkout" });
                      }}
                    >
                      Review order <ArrowRight size={18} />
                    </button>
                    <small>
                      This is a demo store. No payment will be collected.
                    </small>
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <ShoppingBag size={40} />
                  <h3>A little room for a good find.</h3>
                  <p>Your shopping bag is empty.</p>
                  <button
                    className="button button-green"
                    onClick={() => {
                      setModal(null);
                      browse();
                    }}
                  >
                    Explore the collection <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>
          )}
          {modal.kind === "checkout" && (
            <div className="information-dialog">
              <span className="info-icon">
                <ShoppingBag size={28} />
              </span>
              <span className="eyebrow">A PREVIEW OF WHAT’S NEXT</span>
              <h2>Checkout is coming soon</h2>
              <p>
                You can explore the store and build your bag. Online orders and
                payments aren’t available yet, and no order has been placed.
              </p>
              <pre className="order-summary">{orderSummary}</pre>
              <button
                className="button button-green full-width"
                onClick={copyOrder}
              >
                {copied ? (
                  <>
                    <Check size={17} /> Summary copied
                  </>
                ) : (
                  <>
                    Copy order summary <ArrowRight size={17} />
                  </>
                )}
              </button>
              <button
                className="detail-save"
                onClick={() => setModal({ kind: "cart" })}
              >
                Back to your bag
              </button>
            </div>
          )}
          {modal.kind === "about" && (
            <div className="information-dialog">
              <span className="info-icon">
                <Sparkles size={28} />
              </span>
              <span className="eyebrow">GOOD FINDS. MADE EASY.</span>
              <h2>A little more about Easycop.</h2>
              <p>
                A place for thoughtful tech and lifestyle discoveries. This
                first collection gives you a feel for what Easycop can become.
              </p>
              <div className="about-block">
                <ShoppingBag size={22} />
                <div>
                  <h3>Shop with Easycop</h3>
                  <p>
                    Products marked “Easycop shop” go into your bag. This is a
                    demo catalog; checkout, shipping, and payments aren’t
                    enabled.
                  </p>
                </div>
              </div>
              <div className="about-block">
                <ArrowUpRight size={22} />
                <div>
                  <h3>Discover retailer finds</h3>
                  <p>
                    Retailer finds open a separate store where you can check
                    current product details, availability, and prices. Sample
                    imagery and prices are illustrative.
                  </p>
                </div>
              </div>
              <div className="about-block">
                <Heart size={22} />
                <div>
                  <h3>A little transparency</h3>
                  <p>
                    We plan to use affiliate links, which may earn us a
                    commission from qualifying purchases at no additional cost
                    to you. The current demo links are regular retailer links
                    and do not earn commissions.
                  </p>
                </div>
              </div>
              <p className="privacy-note">
                Your bag and saved finds are stored only in this browser. No
                account is required, and no personal or payment details are
                collected by this site.
              </p>
              <button
                className="button button-green full-width"
                onClick={() => {
                  setModal(null);
                  browse();
                }}
              >
                Find something you love <ArrowRight size={17} />
              </button>
            </div>
          )}
        </Dialog>
      )}
      <div
        className={`toast ${toast ? "visible" : ""}`}
        role="status"
        aria-live="polite"
      >
        {toast && (
          <>
            <span>
              <Check size={16} />
            </span>
            {toast}
            <button
              aria-label="Dismiss notification"
              onClick={() => setToast("")}
            >
              <X size={15} />
            </button>
          </>
        )}
      </div>
    </>
  );
}

export default App;
