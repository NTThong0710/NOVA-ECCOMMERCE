import { useEffect, useRef, type MouseEvent } from "react";

import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

export default function LandingPage() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const primarySkuRef = useRef<HTMLDivElement | null>(null);
  const secondarySkuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Add specific body class for this page to avoid overriding global styles
    document.body.classList.add("landing-body");
    return () => {
      document.body.classList.remove("landing-body");
    };
  }, []);

  useEffect(() => {
    const updateParallax = () => {
      const progress = Math.min(window.scrollY / (window.innerHeight * 1.2), 1);
      if (videoRef.current) {
        videoRef.current.style.transform = `translateY(${progress * -8}vh) scale(${1 + progress * 0.06})`;
      }
      
      // Fallback for JS parallax if animation-timeline is not supported
      const plane1Elements = document.querySelectorAll('.z-plane-1');
      const plane2Elements = document.querySelectorAll('.z-plane-2');
      
      plane1Elements.forEach((el) => {
        (el as HTMLElement).style.transform = `translateY(${progress * -15}vh)`;
      });
      
      plane2Elements.forEach((el) => {
        (el as HTMLElement).style.transform = `translateY(${progress * -30}vh) scale(${0.95 + progress * 0.1})`;
      });
    };

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        updateParallax();
        raf = 0;
      });
    };

    updateParallax();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateParallax);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateParallax);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll("[data-reveal]").forEach((el) => {
        el.classList.add("reveal");
        observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const triggerSpatialTransition = async (element: HTMLDivElement | null, targetRoute?: string) => {
    if (!element) return;

    const navAndGo = () => {
      if (targetRoute) {
        navigate(targetRoute);
      }
    };

    if (!(document as Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } }).startViewTransition) {
      const anim = element.animate(
        [{ transform: "scale(1)" }, { transform: "scale(1.04)" }, { transform: "scale(1)" }],
        { duration: 360, easing: "cubic-bezier(.25,1,.3,1)" }
      );
      anim.onfinish = navAndGo;
      return;
    }

    const doc = document as Document & { startViewTransition: (cb: () => void) => { finished: Promise<void> } };
    const transition = doc.startViewTransition(() => {
      element.classList.toggle("scale-110");
      element.classList.toggle("z-50");
      element.style.viewTransitionName = "active-sku";
    });

    await transition.finished;
    element.style.viewTransitionName = "";
    navAndGo();
  };

  const handleMove = (e: MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    target.style.setProperty("--x", `${e.clientX - rect.left}px`);
    target.style.setProperty("--y", `${e.clientY - rect.top}px`);
  };

  return (
    <div className="min-h-screen antialiased bg-transparent" style={{ color: 'var(--studio-pearl)' }}>
      <div className="video-anchor">
        <video ref={videoRef} autoPlay loop muted playsInline className="h-full w-full object-cover object-center saturate-[1.1] contrast-[1.05]">
          <source src="/video.mp4" type="video/mp4" />
        </video>
        <div className="glass-portal" />
      </div>

      <nav className="pointer-events-none fixed top-0 z-50 flex w-full items-center justify-between px-8 py-6 text-white mix-blend-difference">
        <div className="text-xs font-semibold uppercase tracking-[0.3em]">Boutique</div>
        <div className="text-sm font-medium tracking-tight">Techwear Studio</div>
        <div className="text-xs font-semibold uppercase tracking-[0.3em]">FW 2026</div>
      </nav>

      <main className="fractal-container px-4 pt-32 md:px-12 lg:px-24">
        <header className="z-plane-1 col-span-12 mt-20 md:col-span-7">
          <h1 className="gradient-text pb-4 text-6xl font-light leading-[0.9] tracking-tighter md:text-8xl" style={{ color: 'black' }}>
            Khám Phá
            <br />
            Phong Cách
            <br />
            Của Bạn.
          </h1>
          <p className="mt-8 max-w-md text-xl font-light leading-relaxed opacity-70" style={{ color: 'black' }}>
            Trải nghiệm không gian mua sắm thời trang đỉnh cao. Nơi quy tụ những bộ sưu tập giới hạn và xu hướng mới nhất năm nay.
          </p>
          <button
            onMouseMove={handleMove}
            onClick={() => triggerSpatialTransition(primarySkuRef.current, "/home")}
            className="liquid-mercury-btn mt-12 rounded-full px-8 py-4 text-sm font-medium tracking-wide text-[var(--holo-blue)] cursor-pointer"
          >
            Khám Phá Ngay
          </button>
        </header>

        <div className="z-plane-2 relative col-span-12 mt-40 md:col-start-8 md:col-span-4">
          <div
            ref={primarySkuRef}
            data-reveal
            className="sculpted-volume spatial-sku flex aspect-[3/4] flex-col justify-between p-8"
          >
            <div className="flex items-start justify-between">
              <span className="text-xs uppercase tracking-[0.3em] opacity-50" style={{ color: 'black' }}>SKU-VINTAGE-01</span>
              <div className="h-2 w-2 rounded-full bg-[var(--holo-blue)] shadow-[0_0_10px_var(--holo-blue)]" />
            </div>
            
            {/* Vùng chứa hình ảnh sản phẩm */}
            <div className="relative my-6 h-full w-full overflow-hidden rounded-xl bg-gradient-to-tr from-transparent to-[rgba(255,255,255,0.5)]">
              <img 
                src="https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop" 
                alt="Vintage Jacket" 
                className="absolute inset-0 h-full w-full object-cover object-center z-10"
              />
              <div className="absolute inset-0 backdrop-blur-md mix-blend-overlay z-20 opacity-30" />
            </div>
            
            <div>
              <h2 className="text-2xl font-light tracking-tight" style={{ color: 'black' }}>Áo Khoác Vintage</h2>
              <div className="mt-2 flex items-end justify-between">
                <span className="text-lg font-medium text-[var(--holo-blue)]">2.450.000₫</span>
                <button 
                    onMouseMove={handleMove} 
                    onClick={() => navigate('/products')}
                    className="liquid-mercury-btn rounded-full px-4 py-2 text-xs font-medium cursor-pointer"
                >
                  Mua Ngay
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="z-plane-1 relative col-span-12 mt-64 md:col-start-2 md:col-span-5">
          <div data-reveal className="sculpted-volume flex aspect-square flex-col items-start justify-center p-10">
            <h3 className="gradient-text mb-4 text-3xl font-light" style={{ color: 'black' }}>Chất Liệu Cao Cấp</h3>
            <p className="text-sm leading-relaxed opacity-60" style={{ color: 'black' }}>
              Mỗi sản phẩm đều được hoàn thiện từ những chất liệu tinh tuyển nhất. Thiết kế bất đối xứng kết hợp cùng những đường nét sắc sảo, phá vỡ mọi quy chuẩn thời trang thông thường.
            </p>
          </div>
        </div>

        <div className="z-plane-2 col-span-12 mt-96 md:col-start-9 md:col-span-3">
          <div
            ref={secondarySkuRef}
            data-reveal
            onClick={() => triggerSpatialTransition(secondarySkuRef.current, "/home")}
            className="sculpted-volume flex cursor-pointer items-center gap-4 p-6"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full shadow-[inset_2px_2px_5px_white,inset_-2px_-2px_5px_rgba(0,0,0,0.05)]" style={{ backgroundColor: 'var(--studio-pearl)' }}>
              <div className="h-8 w-8 rounded-full bg-[var(--holo-blue)] blur-[2px]" />
            </div>
            <div>
              <div className="text-sm font-medium" style={{ color: 'black' }}>Giao Hàng Siêu Tốc</div>
              <div className="mt-1 text-xs opacity-50" style={{ color: 'black' }}>Nhận hàng trong 24h</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
