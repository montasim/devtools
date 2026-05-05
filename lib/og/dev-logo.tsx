export function DevLogo({
    size = 120,
    color = 'currentColor',
    className,
    animated = false,
    ...svgProps
}: {
    size?: number;
    color?: string;
    className?: string;
    animated?: boolean;
} & Omit<React.SVGProps<SVGSVGElement>, 'viewBox' | 'fill'>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 36 36"
            fill="none"
            width={className ? undefined : size}
            height={className ? undefined : size}
            className={className}
            {...svgProps}
        >
            <path
                d="M11 24.5h9"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
                className={animated ? 'animate-[blink_1s_step-end_infinite]' : undefined}
            />
            <path
                d="m7 20 7-7-7-7"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
