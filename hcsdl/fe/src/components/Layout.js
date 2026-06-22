// Layout.jsx
import React from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = ({ children }) => {
  const location = useLocation();
  
  // Danh sách các trang KHÔNG có Navbar + Footer
  const noLayoutPaths = [ ];

  const shouldShowLayout = !noLayoutPaths.includes(location.pathname);

  return shouldShowLayout ? (
    <div>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  ) : (
    <>{children}</>
  );
};

export default Layout;