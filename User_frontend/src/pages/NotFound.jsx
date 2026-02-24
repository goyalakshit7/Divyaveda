import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 space-y-6">
      <div className="space-y-2">
        <div className="text-8xl font-black text-slate-200 select-none">404</div>
        <h1 className="text-2xl font-bold text-slate-800">Page Not Found</h1>
        <p className="text-slate-500 max-w-sm mx-auto">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to="/"
          className="px-6 py-2.5 bg-green-700 text-white rounded-full text-sm font-semibold hover:bg-green-800 transition"
        >
          🏠 Go Home
        </Link>
        <Link
          to="/products"
          className="px-6 py-2.5 border border-slate-200 text-slate-700 rounded-full text-sm font-semibold hover:bg-slate-50 transition"
        >
          Browse Products
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
