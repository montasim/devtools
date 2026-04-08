import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Menu, Clock, Keyboard, Book } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Logo } from '@/components/logo';
import { NavMenu } from '@/components/navbar/nav-menu';

export const NavigationSheet = () => {
    return (
        <Sheet>
            <VisuallyHidden>
                <SheetTitle>Navigation Menu</SheetTitle>
            </VisuallyHidden>

            <SheetTrigger asChild>
                <Button size="icon" variant="outline" className="shrink-0">
                    <Menu />
                </Button>
            </SheetTrigger>
            <SheetContent className="px-6 py-3">
                <Logo />
                <NavMenu className="mt-6 [&>div]:h-full" orientation="vertical" />

                <div className="mt-4 space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                        <Clock className="mr-2 h-4 w-4" />
                        History
                    </Button>
                    <Button variant="default" className="w-full justify-start">
                        <Keyboard className="mr-2 h-4 w-4" />
                        Shortcuts
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                        <Book className="mr-2 h-4 w-4" />
                        Docs
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
};
