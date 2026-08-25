import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useServices } from '../../hook/useServices';
import ProductCard from '../../features/products/components/ProductCard';
import MagneticButton from '../../components/MagneticButton';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { productService } = useServices();

  const { data: featuredData, isLoading: isFeaturedLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productService.getProducts({ page: 1, limit: 8 }),
    staleTime: 2 * 60 * 1000,
  });

  const featured = featuredData?.data ?? [];


  return (
    <div className="bg-white dark:bg-slate-950 font-sans pb-24">
      
      {/* 1. Hero Section - Immersive */}
      <section className="relative h-[85vh] w-full bg-slate-100 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop" 
          alt="New Collection" 
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16 lg:p-24">
          <div className="max-w-2xl space-y-4 reveal-up">
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-semibold tracking-[0.2em] uppercase rounded-full">
              Autumn / Winter '26
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[1.1]">
              The New <br/> Spatial Reality.
            </h1>
            <p className="text-lg text-white/80 max-w-md pb-4 font-light">
              Khám phá bộ sưu tập giới hạn với chất liệu công nghệ cao và phom dáng tương lai.
            </p>
            <MagneticButton 
              onClick={() => navigate('/products')}
              className="bg-[#785A46] text-white px-8 py-4 rounded-full text-sm font-bold uppercase tracking-wider hover:bg-[#5C4033] transition-colors"
            >
              Shop The Collection
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* 2. Marquee Text */}
      <div className="w-full overflow-hidden bg-black text-white py-4 border-y border-white/10 flex whitespace-nowrap">
        <div className="animate-marquee inline-block text-sm font-semibold tracking-[0.3em] uppercase">
          <span className="mx-8">• Free Global Shipping over $200</span>
          <span className="mx-8">• 30-Day Free Returns</span>
          <span className="mx-8">• Future Techwear Available Now</span>
          <span className="mx-8">• Join The Waitlist for FW26</span>
          <span className="mx-8">• Free Global Shipping over $200</span>
          <span className="mx-8">• 30-Day Free Returns</span>
          <span className="mx-8">• Future Techwear Available Now</span>
          <span className="mx-8">• Join The Waitlist for FW26</span>
        </div>
      </div>

      {/* 3. Featured Products Grid */}
      <section className="px-6 md:px-12 lg:px-24 py-20 max-w-[1920px] mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight dark:text-white">Featured.</h2>
            <p className="text-slate-500 mt-2">Được săn lùng nhiều nhất tuần này.</p>
          </div>
          <Link to="/products" className="hidden md:inline-block border-b-2 border-black dark:border-white pb-1 font-semibold uppercase tracking-wider text-xs hover:opacity-70 transition-opacity dark:text-white">
            View All
          </Link>
        </div>

        {isFeaturedLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[1,2,3,4].map(i => (
              <div key={i} className="aspect-[3/4] bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {featured.slice(0, 4).map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 4. Bento Categories Showcase */}
      <section className="px-6 md:px-12 lg:px-24 py-12 max-w-[1920px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 h-[800px] md:h-[600px]">
          {/* Large feature category */}
          <Link to="/products?category=women's%20clothing" className="group relative md:col-span-2 overflow-hidden bg-slate-100 rounded-2xl block">
            <img src="https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?q=80&w=2000&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="Women" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
            <div className="absolute bottom-8 left-8">
              <h3 className="text-3xl font-bold text-white tracking-tight">Women's Edit</h3>
              <p className="text-white/80 mt-2 underline underline-offset-4">Shop Now</p>
            </div>
          </Link>
          
          <div className="flex flex-col gap-4 md:gap-6">
            <Link to="/products?category=men's%20clothing" className="group relative flex-1 overflow-hidden bg-slate-100 rounded-2xl block">
              <img src="https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=1000&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="Men" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
              <div className="absolute bottom-6 left-6">
                <h3 className="text-2xl font-bold text-white tracking-tight">Menswear</h3>
              </div>
            </Link>
            
            <Link to="/products?category=jewelery" className="group relative flex-1 overflow-hidden bg-slate-100 rounded-2xl block">
              <img src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1000&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="Accessories" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
              <div className="absolute bottom-6 left-6">
                <h3 className="text-2xl font-bold text-white tracking-tight">Accessories</h3>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
          padding-right: 2rem;
        }
        .reveal-up {
          animation: reveal 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
          transform: translateY(30px);
        }
        @keyframes reveal {
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
