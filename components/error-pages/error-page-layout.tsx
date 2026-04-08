import type { ComponentProps, ReactNode } from "react";

interface ErrorPageLayoutProps extends ComponentProps<"div"> {
  children: ReactNode;
}

export function ErrorPageLayout({ children, className = "" }: ErrorPageLayoutProps) {
  return (
    <div
      className={`flex min-h-[calc(100vh-8rem)] flex-1 flex-col items-center justify-center px-4 sm:px-6 lg:px-8 ${className}`}
    >
      <div className="w-full max-w-2xl space-y-8 text-center">
        {children}
      </div>
    </div>
  );
}