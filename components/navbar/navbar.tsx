import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { NavMenu } from '@/components/navbar/nav-menu';
import { NavigationSheet } from '@/components/navbar/navigation-sheet';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Clock, Keyboard, Book } from 'lucide-react';
import { Separator } from '../ui/separator';

const Navbar = () => {
    return (
        <nav className="h-16 border-b bg-background">
            <div className="mx-auto flex h-full max-w-(--breakpoint-3xl) items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-12">
                    <Logo />

                    {/* Desktop Menu */}
                    <NavMenu className="hidden md:block" />
                </div>

                <div className="flex items-center gap-2 overflow-visible">
                    <Button className="hidden sm:inline-flex" variant="outline">
                        <Clock className="mr-2 h-4 w-4" />
                        History
                    </Button>
                    <Button className="hidden sm:inline-flex">
                        <Keyboard className="mr-2 h-4 w-4" />
                        Shortcuts
                    </Button>
                    <Button className="hidden sm:inline-flex" variant="outline">
                        <Book className="mr-2 h-4 w-4" />
                        Docs
                    </Button>

                    <Separator orientation="vertical" className='hidden md:block' />

                    <ThemeToggle />

                    {/* Mobile Menu */}
                    <div className="shrink-0 md:hidden flex items-center">
                        <NavigationSheet />
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
