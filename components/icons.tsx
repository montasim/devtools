import { forwardRef, type ForwardRefExoticComponent, type RefAttributes } from 'react';

import {
    Activity as ActivityData,
    AlertDiamondIcon as AlertDiamondIconData,
    AlertCircle as AlertCircleData,
    AlertTriangle as AlertTriangleData,
    AlignLeft as AlignLeftData,
    ArrowDown as ArrowDownData,
    ArrowLeft as ArrowLeftData,
    ArrowLeftRight as ArrowLeftRightData,
    ArrowRight as ArrowRightData,
    ArrowUp as ArrowUpData,
    BarChart as BarChartData,
    Binary as BinaryData,
    Book as BookData,
    BookOpen as BookOpenData,
    Bookmark as BookmarkData,
    Bot as BotData,
    Braces as BracesData,
    Calculator as CalculatorData,
    Calendar as CalendarData,
    CalendarClock as CalendarClockData,
    ChartBarLineIcon as ChartBarLineIconData,
    Check as CheckData,
    CheckCircle as CheckCircleData,
    CheckmarkCircle02Icon as CheckmarkCircle02IconData,
    ChevronDown as ChevronDownData,
    ChevronLeft as ChevronLeftData,
    ChevronRight as ChevronRightData,
    ChevronUp as ChevronUpData,
    ChevronsUpDown as ChevronsUpDownData,
    ClipboardPaste as ClipboardPasteData,
    Clock as ClockData,
    Code as CodeData,
    Coffee as CoffeeData,
    Cookie as CookieData,
    Copy as CopyData,
    CornerDownRight as CornerDownRightData,
    Cpu as CpuData,
    Database as DatabaseData,
    Download as DownloadData,
    Eraser as EraserData,
    ExternalLink as ExternalLinkData,
    Eye as EyeData,
    EyeOff as EyeOffData,
    File as FileData,
    FileCode as FileCodeData,
    FileDown as FileDownData,
    FileOutput as FileOutputData,
    FileSearch as FileSearchData,
    FileSecurityIcon as FileSecurityIconData,
    FileSpreadsheetIcon as FileSpreadsheetIconData,
    FileText as FileTextData,
    Filter as FilterData,
    Fingerprint as FingerprintData,
    Flame as FlameData,
    GitBranch as GitBranchData,
    GitCompare as GitCompareData,
    Globe as GlobeData,
    GripVertical as GripVerticalData,
    HardDrive as HardDriveData,
    Hash as HashData,
    Heart as HeartData,
    History as HistoryData,
    Home as HomeData,
    Image as ImageData,
    ImageIcon as ImageIconData,
    Info as InfoData,
    InformationCircleIcon as InformationCircleIconData,
    Key as KeyData,
    KeyRound as KeyRoundData,
    Languages as LanguagesData,
    Layers as LayersData,
    LayoutTemplate as LayoutTemplateData,
    Link as LinkData,
    Link2 as Link2Data,
    List as ListData,
    Loading03Icon as Loading03IconData,
    Lock as LockData,
    LogIn as LogInData,
    LogOut as LogOutData,
    Mail as MailData,
    MailCheck as MailCheckData,
    MailQuestionMarkIcon as MailQuestionMarkIconData,
    MailX as MailXData,
    Map as MapData,
    Menu as MenuData,
    MessageSquare as MessageSquareData,
    Minimize2 as Minimize2Data,
    Minus as MinusData,
    Monitor as MonitorData,
    Moon as MoonData,
    MoreHorizontal as MoreHorizontalData,
    Music as MusicData,
    Network as NetworkData,
    Package as PackageData,
    Paintbrush as PaintbrushData,
    Palette as PaletteData,
    Pencil as PencilData,
    Percent as PercentData,
    Pipette as PipetteData,
    Play as PlayData,
    Plug as PlugData,
    Plus as PlusData,
    QrCode as QrCodeData,
    Radio as RadioData,
    RefreshCw as RefreshCwData,
    Regex as RegexData,
    RotateCcw as RotateCcwData,
    RotateCw as RotateCwData,
    Route as RouteData,
    Rows3 as Rows3Data,
    Rss as RssData,
    Ruler as RulerData,
    Save as SaveData,
    Scale as ScaleData,
    Search as SearchData,
    SearchCode as SearchCodeData,
    Send as SendData,
    Server as ServerData,
    Settings as SettingsData,
    Share2 as Share2Data,
    Shield as ShieldData,
    ShieldAlert as ShieldAlertData,
    ShieldCheck as ShieldCheckData,
    ShieldQuestionMarkIcon as ShieldQuestionMarkIconData,
    ShieldX as ShieldXData,
    Shuffle as ShuffleData,
    SlashIcon as SlashIconData,
    SlidersHorizontal as SlidersHorizontalData,
    Smartphone as SmartphoneData,
    Smile as SmileData,
    SourceCodeIcon as SourceCodeIconData,
    Sparkles as SparklesData,
    Square as SquareData,
    Sun as SunData,
    Sunrise as SunriseData,
    Sunset as SunsetData,
    Table as TableData,
    Table2 as Table2Data,
    Tablet as TabletData,
    Tag as TagData,
    Terminal as TerminalData,
    TextSelect as TextSelectData,
    Timer as TimerData,
    Trash as TrashData,
    Trash2 as Trash2Data,
    TrendingUp as TrendingUpData,
    Type as TypeData,
    Unlink as UnlinkData,
    UnplugIcon as UnplugIconData,
    Upload as UploadData,
    UnfoldMoreIcon as UnfoldMoreIconData,
    User as UserData,
    Users as UsersData,
    Video as VideoData,
    Webhook as WebhookData,
    WholeWord as WholeWordData,
    Wrench as WrenchData,
    X as XData,
    XCircle as XCircleData,
    Zap as ZapData,
    ZoomIn as ZoomInData,
    ZoomOut as ZoomOutData,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon, type HugeiconsProps, type IconSvgElement } from '@hugeicons/react';

export type IconProps = Omit<HugeiconsProps, 'altIcon' | 'icon' | 'ref'>;
export type Icon = ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;

function createIcon(icon: IconSvgElement, displayName: string): Icon {
    const Component = forwardRef<SVGSVGElement, IconProps>((props, ref) => (
        <HugeiconsIcon ref={ref} icon={icon} {...props} />
    ));

    Component.displayName = displayName;
    return Component;
}

export const Activity = /* @__PURE__ */ createIcon(ActivityData, 'Activity');
export const AlertCircle = /* @__PURE__ */ createIcon(AlertCircleData, 'AlertCircle');
export const AlertTriangle = /* @__PURE__ */ createIcon(AlertTriangleData, 'AlertTriangle');
export const AlignLeft = /* @__PURE__ */ createIcon(AlignLeftData, 'AlignLeft');
export const ArrowDown = /* @__PURE__ */ createIcon(ArrowDownData, 'ArrowDown');
export const ArrowLeft = /* @__PURE__ */ createIcon(ArrowLeftData, 'ArrowLeft');
export const ArrowLeftRight = /* @__PURE__ */ createIcon(ArrowLeftRightData, 'ArrowLeftRight');
export const ArrowRight = /* @__PURE__ */ createIcon(ArrowRightData, 'ArrowRight');
export const ArrowRightLeft = /* @__PURE__ */ createIcon(ArrowLeftRightData, 'ArrowRightLeft');
export const ArrowUp = /* @__PURE__ */ createIcon(ArrowUpData, 'ArrowUp');
export const BarChart = /* @__PURE__ */ createIcon(BarChartData, 'BarChart');
export const BarChart3 = /* @__PURE__ */ createIcon(ChartBarLineIconData, 'BarChart3');
export const Binary = /* @__PURE__ */ createIcon(BinaryData, 'Binary');
export const Book = /* @__PURE__ */ createIcon(BookData, 'Book');
export const BookOpen = /* @__PURE__ */ createIcon(BookOpenData, 'BookOpen');
export const Bookmark = /* @__PURE__ */ createIcon(BookmarkData, 'Bookmark');
export const Bot = /* @__PURE__ */ createIcon(BotData, 'Bot');
export const Braces = /* @__PURE__ */ createIcon(BracesData, 'Braces');
export const BracesIcon = /* @__PURE__ */ createIcon(BracesData, 'BracesIcon');
export const Calculator = /* @__PURE__ */ createIcon(CalculatorData, 'Calculator');
export const Calendar = /* @__PURE__ */ createIcon(CalendarData, 'Calendar');
export const CalendarClock = /* @__PURE__ */ createIcon(CalendarClockData, 'CalendarClock');
export const Check = /* @__PURE__ */ createIcon(CheckData, 'Check');
export const CheckCircle = /* @__PURE__ */ createIcon(CheckCircleData, 'CheckCircle');
export const CheckCircle2 = /* @__PURE__ */ createIcon(CheckmarkCircle02IconData, 'CheckCircle2');
export const ChevronDown = /* @__PURE__ */ createIcon(ChevronDownData, 'ChevronDown');
export const ChevronRight = /* @__PURE__ */ createIcon(ChevronRightData, 'ChevronRight');
export const ChevronUp = /* @__PURE__ */ createIcon(ChevronUpData, 'ChevronUp');
export const ChevronsUpDown = /* @__PURE__ */ createIcon(ChevronsUpDownData, 'ChevronsUpDown');
export const ClipboardPaste = /* @__PURE__ */ createIcon(ClipboardPasteData, 'ClipboardPaste');
export const Clock = /* @__PURE__ */ createIcon(ClockData, 'Clock');
export const Code = /* @__PURE__ */ createIcon(CodeData, 'Code');
export const Code2 = /* @__PURE__ */ createIcon(SourceCodeIconData, 'Code2');
export const Coffee = /* @__PURE__ */ createIcon(CoffeeData, 'Coffee');
export const Cookie = /* @__PURE__ */ createIcon(CookieData, 'Cookie');
export const Copy = /* @__PURE__ */ createIcon(CopyData, 'Copy');
export const CornerDownRight = /* @__PURE__ */ createIcon(CornerDownRightData, 'CornerDownRight');
export const Cpu = /* @__PURE__ */ createIcon(CpuData, 'Cpu');
export const Database = /* @__PURE__ */ createIcon(DatabaseData, 'Database');
export const Download = /* @__PURE__ */ createIcon(DownloadData, 'Download');
export const Eraser = /* @__PURE__ */ createIcon(EraserData, 'Eraser');
export const ExternalLink = /* @__PURE__ */ createIcon(ExternalLinkData, 'ExternalLink');
export const Eye = /* @__PURE__ */ createIcon(EyeData, 'Eye');
export const EyeOff = /* @__PURE__ */ createIcon(EyeOffData, 'EyeOff');
export const File = /* @__PURE__ */ createIcon(FileData, 'File');
export const FileCode = /* @__PURE__ */ createIcon(FileCodeData, 'FileCode');
export const FileDown = /* @__PURE__ */ createIcon(FileDownData, 'FileDown');
export const FileJson = /* @__PURE__ */ createIcon(FileCodeData, 'FileJson');
export const FileKey2 = /* @__PURE__ */ createIcon(FileSecurityIconData, 'FileKey2');
export const FileOutput = /* @__PURE__ */ createIcon(FileOutputData, 'FileOutput');
export const FileSearch = /* @__PURE__ */ createIcon(FileSearchData, 'FileSearch');
export const FileSpreadsheet = /* @__PURE__ */ createIcon(
    FileSpreadsheetIconData,
    'FileSpreadsheet',
);
export const FileText = /* @__PURE__ */ createIcon(FileTextData, 'FileText');
export const Filter = /* @__PURE__ */ createIcon(FilterData, 'Filter');
export const Fingerprint = /* @__PURE__ */ createIcon(FingerprintData, 'Fingerprint');
export const Flame = /* @__PURE__ */ createIcon(FlameData, 'Flame');
export const GitBranch = /* @__PURE__ */ createIcon(GitBranchData, 'GitBranch');
export const GitCompare = /* @__PURE__ */ createIcon(GitCompareData, 'GitCompare');
export const Globe = /* @__PURE__ */ createIcon(GlobeData, 'Globe');
export const Globe2 = /* @__PURE__ */ createIcon(GlobeData, 'Globe2');
export const GripVertical = /* @__PURE__ */ createIcon(GripVerticalData, 'GripVertical');
export const HardDrive = /* @__PURE__ */ createIcon(HardDriveData, 'HardDrive');
export const Hash = /* @__PURE__ */ createIcon(HashData, 'Hash');
export const Heart = /* @__PURE__ */ createIcon(HeartData, 'Heart');
export const History = /* @__PURE__ */ createIcon(HistoryData, 'History');
export const Home = /* @__PURE__ */ createIcon(HomeData, 'Home');
export const Image = /* @__PURE__ */ createIcon(ImageData, 'Image');
export const ImageIcon = /* @__PURE__ */ createIcon(ImageIconData, 'ImageIcon');
export const Info = /* @__PURE__ */ createIcon(InfoData, 'Info');
export const Key = /* @__PURE__ */ createIcon(KeyData, 'Key');
export const KeyRound = /* @__PURE__ */ createIcon(KeyRoundData, 'KeyRound');
export const Languages = /* @__PURE__ */ createIcon(LanguagesData, 'Languages');
export const Layers = /* @__PURE__ */ createIcon(LayersData, 'Layers');
export const LayoutTemplate = /* @__PURE__ */ createIcon(LayoutTemplateData, 'LayoutTemplate');
export const Link = /* @__PURE__ */ createIcon(LinkData, 'Link');
export const Link2 = /* @__PURE__ */ createIcon(Link2Data, 'Link2');
export const Link2Off = /* @__PURE__ */ createIcon(UnlinkData, 'Link2Off');
export const List = /* @__PURE__ */ createIcon(ListData, 'List');
export const Loader2 = /* @__PURE__ */ createIcon(Loading03IconData, 'Loader2');
export const Lock = /* @__PURE__ */ createIcon(LockData, 'Lock');
export const LogIn = /* @__PURE__ */ createIcon(LogInData, 'LogIn');
export const LogOut = /* @__PURE__ */ createIcon(LogOutData, 'LogOut');
export const Mail = /* @__PURE__ */ createIcon(MailData, 'Mail');
export const MailCheck = /* @__PURE__ */ createIcon(MailCheckData, 'MailCheck');
export const MailQuestion = /* @__PURE__ */ createIcon(MailQuestionMarkIconData, 'MailQuestion');
export const MailX = /* @__PURE__ */ createIcon(MailXData, 'MailX');
export const Map = /* @__PURE__ */ createIcon(MapData, 'Map');
export const Menu = /* @__PURE__ */ createIcon(MenuData, 'Menu');
export const MessageSquare = /* @__PURE__ */ createIcon(MessageSquareData, 'MessageSquare');
export const Minimize2 = /* @__PURE__ */ createIcon(Minimize2Data, 'Minimize2');
export const Minus = /* @__PURE__ */ createIcon(MinusData, 'Minus');
export const Monitor = /* @__PURE__ */ createIcon(MonitorData, 'Monitor');
export const Moon = /* @__PURE__ */ createIcon(MoonData, 'Moon');
export const Music = /* @__PURE__ */ createIcon(MusicData, 'Music');
export const Network = /* @__PURE__ */ createIcon(NetworkData, 'Network');
export const Package = /* @__PURE__ */ createIcon(PackageData, 'Package');
export const Paintbrush = /* @__PURE__ */ createIcon(PaintbrushData, 'Paintbrush');
export const Palette = /* @__PURE__ */ createIcon(PaletteData, 'Palette');
export const Pencil = /* @__PURE__ */ createIcon(PencilData, 'Pencil');
export const Percent = /* @__PURE__ */ createIcon(PercentData, 'Percent');
export const Pipette = /* @__PURE__ */ createIcon(PipetteData, 'Pipette');
export const Play = /* @__PURE__ */ createIcon(PlayData, 'Play');
export const Plug = /* @__PURE__ */ createIcon(PlugData, 'Plug');
export const Plus = /* @__PURE__ */ createIcon(PlusData, 'Plus');
export const QrCode = /* @__PURE__ */ createIcon(QrCodeData, 'QrCode');
export const Radio = /* @__PURE__ */ createIcon(RadioData, 'Radio');
export const RefreshCw = /* @__PURE__ */ createIcon(RefreshCwData, 'RefreshCw');
export const Regex = /* @__PURE__ */ createIcon(RegexData, 'Regex');
export const RotateCcw = /* @__PURE__ */ createIcon(RotateCcwData, 'RotateCcw');
export const RotateCw = /* @__PURE__ */ createIcon(RotateCwData, 'RotateCw');
export const Route = /* @__PURE__ */ createIcon(RouteData, 'Route');
export const Rows3 = /* @__PURE__ */ createIcon(Rows3Data, 'Rows3');
export const Rss = /* @__PURE__ */ createIcon(RssData, 'Rss');
export const Ruler = /* @__PURE__ */ createIcon(RulerData, 'Ruler');
export const Save = /* @__PURE__ */ createIcon(SaveData, 'Save');
export const Scale = /* @__PURE__ */ createIcon(ScaleData, 'Scale');
export const Search = /* @__PURE__ */ createIcon(SearchData, 'Search');
export const SearchCode = /* @__PURE__ */ createIcon(SearchCodeData, 'SearchCode');
export const Send = /* @__PURE__ */ createIcon(SendData, 'Send');
export const Server = /* @__PURE__ */ createIcon(ServerData, 'Server');
export const Settings = /* @__PURE__ */ createIcon(SettingsData, 'Settings');
export const Share2 = /* @__PURE__ */ createIcon(Share2Data, 'Share2');
export const Shield = /* @__PURE__ */ createIcon(ShieldData, 'Shield');
export const ShieldAlert = /* @__PURE__ */ createIcon(ShieldAlertData, 'ShieldAlert');
export const ShieldCheck = /* @__PURE__ */ createIcon(ShieldCheckData, 'ShieldCheck');
export const ShieldQuestion = /* @__PURE__ */ createIcon(
    ShieldQuestionMarkIconData,
    'ShieldQuestion',
);
export const ShieldX = /* @__PURE__ */ createIcon(ShieldXData, 'ShieldX');
export const Shuffle = /* @__PURE__ */ createIcon(ShuffleData, 'Shuffle');
export const Slash = /* @__PURE__ */ createIcon(SlashIconData, 'Slash');
export const Sliders = /* @__PURE__ */ createIcon(SlidersHorizontalData, 'Sliders');
export const SlidersHorizontal = /* @__PURE__ */ createIcon(
    SlidersHorizontalData,
    'SlidersHorizontal',
);
export const Smartphone = /* @__PURE__ */ createIcon(SmartphoneData, 'Smartphone');
export const Smile = /* @__PURE__ */ createIcon(SmileData, 'Smile');
export const Sparkles = /* @__PURE__ */ createIcon(SparklesData, 'Sparkles');
export const Square = /* @__PURE__ */ createIcon(SquareData, 'Square');
export const Sun = /* @__PURE__ */ createIcon(SunData, 'Sun');
export const Sunrise = /* @__PURE__ */ createIcon(SunriseData, 'Sunrise');
export const Sunset = /* @__PURE__ */ createIcon(SunsetData, 'Sunset');
export const Table = /* @__PURE__ */ createIcon(TableData, 'Table');
export const Table2 = /* @__PURE__ */ createIcon(Table2Data, 'Table2');
export const Tablet = /* @__PURE__ */ createIcon(TabletData, 'Tablet');
export const Tag = /* @__PURE__ */ createIcon(TagData, 'Tag');
export const Terminal = /* @__PURE__ */ createIcon(TerminalData, 'Terminal');
export const TextSelect = /* @__PURE__ */ createIcon(TextSelectData, 'TextSelect');
export const Timer = /* @__PURE__ */ createIcon(TimerData, 'Timer');
export const Trash = /* @__PURE__ */ createIcon(TrashData, 'Trash');
export const Trash2 = /* @__PURE__ */ createIcon(Trash2Data, 'Trash2');
export const TrendingUp = /* @__PURE__ */ createIcon(TrendingUpData, 'TrendingUp');
export const Type = /* @__PURE__ */ createIcon(TypeData, 'Type');
export const Unlink = /* @__PURE__ */ createIcon(UnlinkData, 'Unlink');
export const Unplug = /* @__PURE__ */ createIcon(UnplugIconData, 'Unplug');
export const Upload = /* @__PURE__ */ createIcon(UploadData, 'Upload');
export const User = /* @__PURE__ */ createIcon(UserData, 'User');
export const Users = /* @__PURE__ */ createIcon(UsersData, 'Users');
export const Video = /* @__PURE__ */ createIcon(VideoData, 'Video');
export const Webhook = /* @__PURE__ */ createIcon(WebhookData, 'Webhook');
export const WholeWord = /* @__PURE__ */ createIcon(WholeWordData, 'WholeWord');
export const Wrench = /* @__PURE__ */ createIcon(WrenchData, 'Wrench');
export const X = /* @__PURE__ */ createIcon(XData, 'X');
export const XCircle = /* @__PURE__ */ createIcon(XCircleData, 'XCircle');
export const Zap = /* @__PURE__ */ createIcon(ZapData, 'Zap');
export const ZoomIn = /* @__PURE__ */ createIcon(ZoomInData, 'ZoomIn');
export const ZoomOut = /* @__PURE__ */ createIcon(ZoomOutData, 'ZoomOut');

export const IconAlertOctagon = /* @__PURE__ */ createIcon(
    AlertDiamondIconData,
    'IconAlertOctagon',
);
export const IconAlertTriangle = AlertTriangle;
export const IconCheck = Check;
export const IconChevronDown = ChevronDown;
export const IconChevronLeft = /* @__PURE__ */ createIcon(ChevronLeftData, 'IconChevronLeft');
export const IconChevronRight = ChevronRight;
export const IconChevronUp = ChevronUp;
export const IconCircleCheck = CheckCircle;
export const IconDots = /* @__PURE__ */ createIcon(MoreHorizontalData, 'IconDots');
export const IconInfoCircle = /* @__PURE__ */ createIcon(
    InformationCircleIconData,
    'IconInfoCircle',
);
export const IconLoader = Loader2;
export const IconSearch = Search;
export const IconSelector = /* @__PURE__ */ createIcon(UnfoldMoreIconData, 'IconSelector');
export const IconX = X;
