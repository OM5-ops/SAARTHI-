import { router } from "@/routes/AppRoutes";
import { seedDemoData } from "@/services/mock/seed";
import { RouterProvider } from "@tanstack/react-router";
import { useEffect } from "react";

export default function App() {
  useEffect(() => {
    seedDemoData();
  }, []);

  return <RouterProvider router={router} />;
}
