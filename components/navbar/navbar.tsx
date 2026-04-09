import { cn } from "@/lib/utils";
import { navigationMenu, authButtons } from "@/config/navigation";
import { NavbarProps } from "./types";
import { DesktopMenu } from "./desktop-menu";
import { MobileMenu } from "./mobile-menu";

export const Navbar = ({
  menu = navigationMenu,
  auth = authButtons,
  className,
}: NavbarProps) => {
  return (
    <section className={cn("px-4 sm:px-6 lg:px-8 py-4", className)}>
      <DesktopMenu menu={menu} auth={auth} />
      <MobileMenu menu={menu} auth={auth} />
    </section>
  );
};
