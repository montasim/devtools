export interface MenuItem {
    title: string;
    url: string;
    description?: string;
    icon?: React.ReactNode;
    items?: MenuItem[];
}

export interface NavbarProps {
    className?: string;
    menu?: MenuItem[];
    auth?: {
        login: { title: string; url: string };
        signup: { title: string; url: string };
    };
}
