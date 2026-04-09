import { NavigationMenu, NavigationMenuList } from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { MenuItem } from "./types";
import { DesktopMenuItem } from "./menu-items";

interface DesktopMenuProps {
  menu: MenuItem[];
  auth: {
    login: { title: string; url: string };
    signup: { title: string; url: string };
  };
}

export const DesktopMenu = ({ menu, auth }: DesktopMenuProps) => (
  <nav className="hidden items-center justify-between lg:flex">
    <div className="flex items-center gap-6">
      <Logo />
      <div className="flex items-center">
        <NavigationMenu>
          <NavigationMenuList>
            {menu.map((item) => (
              <DesktopMenuItem key={item.title} item={item} />
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
    <div className="flex gap-2">
      <Button asChild variant="outline" size="sm">
        <a href={auth.login.url}>{auth.login.title}</a>
      </Button>
      <Button asChild size="sm">
        <a href={auth.signup.url}>{auth.signup.title}</a>
      </Button>
    </div>
  </nav>
);
