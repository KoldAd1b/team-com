import { ThemeProvider } from "@/provider/theme-provider";
import { FC, ReactNode } from "react";

const MainLayout: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      Main Layout {children}
    </ThemeProvider>
  );
};

export default MainLayout;
