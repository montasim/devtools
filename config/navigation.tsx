import { Book, Clock, Keyboard, Sunset, Trees, Zap } from "lucide-react";

export const navigationMenu = [
  { title: "Home", url: "/" },
  {
    title: "Tools",
    url: "#",
    items: [
      {
        title: "JSON Tools",
        description: "Validate, format, and transform JSON data",
        icon: <Book className="size-5 shrink-0" />,
        url: "/json",
      },
      {
        title: "Text Tools",
        description: "Process and manipulate text",
        icon: <Trees className="size-5 shrink-0" />,
        url: "/text",
      },
      {
        title: "XML Tools",
        description: "Parse, validate, and convert XML",
        icon: <Sunset className="size-5 shrink-0" />,
        url: "/xml",
      },
      {
        title: "CSV Tools",
        description: "Convert, validate, and transform CSV",
        icon: <Zap className="size-5 shrink-0" />,
        url: "/csv",
      },
    ],
  },
  {
    title: "Resources",
    url: "#",
    items: [
      {
        title: "History",
        description: "View your recent tool usage",
        icon: <Clock className="size-5 shrink-0" />,
        url: "/history",
      },
      {
        title: "Shortcuts",
        description: "Keyboard shortcuts and quick actions",
        icon: <Keyboard className="size-5 shrink-0" />,
        url: "/shortcuts",
      },
      {
        title: "Documentation",
        description: "Guides and API references",
        icon: <Zap className="size-5 shrink-0" />,
        url: "/docs",
      },
      {
        title: "Changelog",
        description: "Latest updates and features",
        icon: <Book className="size-5 shrink-0" />,
        url: "/changelog",
      },
    ],
  },
  { title: "About", url: "/about" },
];

export const authButtons = {
  login: { title: "Login", url: "/login" },
  signup: { title: "Sign up", url: "/signup" },
};
