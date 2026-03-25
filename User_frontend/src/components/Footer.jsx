import { Facebook, Instagram, Linkedin, Youtube, Twitter, Mail, Phone, ArrowRight, Leaf } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-white pt-20 pb-10 border-t-4 border-primary/20 relative overflow-hidden">
      {/* Decorative background subtle glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* ────── Brand Column ────── */}
          <div className="lg:col-span-4 space-y-6">
            <h2 className="text-3xl font-serif font-black flex items-center gap-2">
              <Leaf className="h-6 w-6 text-primary" />
              <span>Divya<span className="text-primary">veda</span></span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Bringing the ancient wisdom of Ayurveda to modern life. Pure, natural, and authentic formulations for your holistic wellness journey.
            </p>
            
            <div className="flex gap-3 pt-2">
               {[
                 { Icon: Facebook, href: "#" }, 
                 { Icon: Instagram, href: "#" }, 
                 { Icon: Linkedin, href: "#" }, 
                 { Icon: Youtube, href: "#" }, 
                 { Icon: Twitter, href: "#" }
               ].map(({Icon, href}, i) => (
                 <a key={i} href={href} className="h-10 w-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center transition-all duration-300 hover:bg-primary hover:border-primary text-slate-400 hover:text-white hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]">
                   <Icon className="h-4 w-4" />
                 </a>
               ))}
            </div>
            
            <div className="space-y-3 text-sm text-slate-400 pt-6 border-t border-slate-800/50">
               <a href="tel:+919998887778" className="flex items-center gap-3 hover:text-primary transition-colors group">
                 <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                   <Phone className="h-4 w-4 text-slate-500 group-hover:text-primary transition-colors" />
                 </div>
                 <span>+91 999 888 7778</span>
               </a>
               <a href="mailto:divyaveda@gmail.com" className="flex items-center gap-3 hover:text-primary transition-colors group">
                 <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                   <Mail className="h-4 w-4 text-slate-500 group-hover:text-primary transition-colors" />
                 </div>
                 <span>divyaveda@gmail.com</span>
               </a>
            </div>
          </div>

          {/* ────── Quick Links ────── */}
          <div className="lg:col-span-3 lg:col-start-6 space-y-8">
             <div>
               <h4 className="font-serif font-bold text-white mb-6 uppercase tracking-wider text-sm flex items-center gap-2">
                 <span className="w-4 h-px bg-primary inline-block"></span> Quick Links
               </h4>
               <ul className="space-y-3 text-sm text-slate-400">
                 {["About Us", "Order & Shipping", "Return / Refund Policy", "Contact Us", "Track Your Order"].map(link => (
                   <li key={link}>
                     <a href="#" className="hover:text-primary transition-colors inline-block hover:-translate-y-0.5 transform duration-300">
                       {link}
                     </a>
                   </li>
                 ))}
               </ul>
             </div>
          </div>

          {/* ────── Legal & Support ────── */}
          <div className="lg:col-span-4 space-y-8">
            <h4 className="font-serif font-bold text-white mb-6 uppercase tracking-wider text-sm flex items-center gap-2">
              <span className="w-4 h-px bg-primary inline-block"></span> Stay Updated
            </h4>
            
            <div className="space-y-4">
              <p className="text-sm text-slate-400 leading-relaxed">
                Join our mailing list to receive wellness tips, exclusive offers, and early access to new launches.
              </p>
              <form className="flex group" onSubmit={(e) => e.preventDefault()}>
                  <input 
                    type="email" 
                    placeholder="Enter your Email address" 
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-l-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors placeholder:text-slate-600"
                  />
                  <button className="bg-primary text-primary-foreground px-5 rounded-r-xl hover:bg-primary/90 transition-all font-bold flex items-center justify-center group-hover:px-6">
                    <ArrowRight className="h-4 w-4" />
                  </button>
              </form>
            </div>

            <div className="pt-4">
              <ul className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500">
                 <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                 <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                 <li><a href="#" className="hover:text-primary transition-colors">Blogs</a></li>
              </ul>
            </div>
          </div>
          
        </div>

        {/* ────── Bottom Bar ────── */}
        <div className="pt-8 border-t border-slate-800 text-center flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Divyaveda Wellness Pvt Ltd. All Rights Reserved.</p>
          <div className="flex gap-2 items-center">
            <span>Made with</span>
            <Heart size={12} className="text-primary fill-primary animate-pulse" />
            <span>in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Helper for Heart icon
function Heart(props) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={props.size} height={props.size} viewBox="0 0 24 24" fill={props.fill || "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}
      {...props}
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.7 0l-1.1 1-1.1-1a5.5 5.5 0 0 0-7.7 7.7l1.1 1.1 7.7 7.7 7.7-7.7 1.1-1.1a5.5 5.5 0 0 0 0-7.7z"></path>
    </svg>
  );
}

export default Footer;
