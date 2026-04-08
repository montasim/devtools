import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { NavMenu } from '@/components/navbar/nav-menu';
import { NavigationSheet } from '@/components/navbar/navigation-sheet';
import { ThemeToggle } from '@/components/theme/theme-toggle';

const Navbar = () => {
    return (
        <nav className="h-16 border-b bg-background">
            <div className="mx-auto flex h-full max-w-(--breakpoint-3xl) items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-12">
                    <Logo />

                    {/* Desktop Menu */}
                    <NavMenu className="hidden md:block" />
                </div>

                <div className="flex items-center gap-3">
                    <Button className="hidden sm:inline-flex" variant="outline">
                        History
                    </Button>
                    <Button>Shortcuts</Button>
                    <Button className="hidden sm:inline-flex" variant="outline">
                        Docs
                    </Button>
                    <ThemeToggle />

                    {/* Mobile Menu */}
                    <div className="md:hidden">
                        <NavigationSheet />
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
