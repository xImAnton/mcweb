import React, { useState, useContext, useEffect } from "react";
import { useMediaQuery } from "react-responsive";
import { useLocation } from "react-router-dom";


const DesignContext = React.createContext({
    isResponsive: false,
    navbarShown: true,
    isDarkmode: false,
});

export const DesignProvider = ({children}) => {
    const [isDarkmode, setDarkmode] = useState(localStorage.getItem("MCWeb_Darkmode") === "true");
    const [navbarShown, setNavbarShown] = useState(true);
    const isResponsive = useMediaQuery({query: "(max-width: 700px)"});

    useEffect(() => {
        localStorage.setItem("MCWeb_Darkmode", isDarkmode);
    }, [isDarkmode]);

    const location = useLocation();
    const isFullPage = ["/createserver", "/apierror"].includes(location.pathname);

    const renderContent = !(isResponsive && navbarShown);
    const renderSidebar = !(isResponsive && !navbarShown);

    const value = {
        isResponsive: isResponsive,
        navbarShown: navbarShown,
        isDarkmode: isDarkmode,
        setDarkmode: setDarkmode,
        setNavbarShown: setNavbarShown,
        isFullPage: isFullPage,
        renderContent: renderContent,
        renderSidebar: renderSidebar,
    }

    return  <DesignContext.Provider value={value}>
                {children}
            </DesignContext.Provider>
};

export const useDesign = () => {
    return useContext(DesignContext);
}

export default DesignContext;
