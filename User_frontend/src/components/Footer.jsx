import { Facebook, Instagram, Linkedin, Youtube, Twitter, Mail, Phone, ArrowRight } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#1A1A1A] text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="space-y-6">
            <h2 className="text-2xl font-serif font-bold tracking-wide">
              Divya<span className="text-slate-400">veda</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Bringing the ancient wisdom of Ayurveda to modern life. Pure, natural, and authentic formulations for your holistic wellness.
            </p>
            <div className="text-xs text-slate-500">
              © 2026 Divyaveda Wellness Pvt Ltd. All Rights Reserved.
            </div>
            
            <div className="flex gap-4">
               {[Facebook, Instagram, Linkedin, Youtube, Twitter].map((Icon, i) => (
                 <a key={i} href="#" className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-slate-300 hover:text-white">
                   <Icon className="h-4 w-4" />
                 </a>
               ))}
            </div>
            
            <div className="space-y-2 text-sm text-slate-400 pt-4">
               <div className="flex items-center gap-2">
                 <Phone className="h-4 w-4" />
                 <span>+91 999 888 7778</span>
               </div>
               <div className="flex items-center gap-2">
                 <Mail className="h-4 w-4" />
                 <span>divyaveda@gmail.com</span>
               </div>
            </div>
          </div>

          {/* Quick Links Column (Placeholder structure) */}
          <div className="lg:col-span-1"></div>

          {/* Newsletter Column */}
          <div className="lg:col-span-2 space-y-8">
             <div className="space-y-4">
                <h3 className="font-serif font-bold text-lg">Join our mailing list</h3>
                <div className="flex">
                   <input 
                     type="email" 
                     placeholder="Enter your Email" 
                     className="flex-1 bg-white/5 border border-white/10 rounded-l-md px-4 py-3 text-sm focus:outline-none focus:border-white/20 transition-colors"
                   />
                   <button className="bg-slate-400 text-slate-900 px-4 rounded-r-md hover:bg-white transition-colors">
                     <ArrowRight className="h-5 w-5" />
                   </button>
                </div>
             </div>
             
             <div className="space-y-4">
                <h3 className="font-serif font-bold text-lg">Join our Community and Unlock best offers</h3>
                <div className="flex">
                   <select className="bg-white/5 border border-white/10 border-r-0 rounded-l-md px-3 py-3 text-sm text-slate-400 focus:outline-none">
                     <option>+91 (IN)</option>
                   </select>
                   <input 
                     type="tel" 
                     placeholder="Enter your phone number" 
                     className="flex-1 bg-white/5 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-white/20 transition-colors"
                   />
                   <button className="bg-slate-400 text-slate-900 px-4 rounded-r-md hover:bg-white transition-colors">
                     <ArrowRight className="h-5 w-5" />
                   </button>
                </div>
             </div>
             
             {/* Quick Links Grid */}
             <div className="grid grid-cols-2 gap-8 pt-8">
               <div>
                 <h4 className="font-serif font-bold text-blue-200 mb-4 tracking-wider text-sm uppercase">Quick Links</h4>
                 <ul className="space-y-2 text-sm text-slate-400">
                   <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                   <li><a href="#" className="hover:text-white transition-colors">Order & Shipping</a></li>
                   <li><a href="#" className="hover:text-white transition-colors">Return / Refund Policy</a></li>
                   <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                 </ul>
               </div>
               <div>
                  <h4 className="font-serif font-bold text-blue-200 mb-4 tracking-wider text-sm uppercase opacity-0">.</h4>
                  <ul className="space-y-2 text-sm text-slate-400">
                   <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                   <li><a href="#" className="hover:text-white transition-colors">Blogs</a></li>
                   <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                   <li><a href="#" className="hover:text-white transition-colors">Track Your Order</a></li>
                 </ul>
               </div>
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
