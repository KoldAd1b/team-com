import { FC, ReactNode } from "react";

import { ColorPrefrencesProvider } from "@/provider/color-preferences";
import { ThemeProvider } from "@/provider/theme-provider";
import MainContent from "@/components/main-content";
import { WebSocketProvider } from "@/provider/web-socket";
import { QueryProvider } from "@/provider/query-provider";

const MainLayout: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <WebSocketProvider>
        <ColorPrefrencesProvider>
          <MainContent>
            <QueryProvider>{children}</QueryProvider>
          </MainContent>
        </ColorPrefrencesProvider>
      </WebSocketProvider>
    </ThemeProvider>
  );
};

export default MainLayout;
