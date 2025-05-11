import {
    Loader2,
    LogIn,
    Mail,
    Github,
    Trash2,
    User,
    Key,
    AlertTriangle,
    ArrowRight,
    Check,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    File,
    FileText,
    HelpCircle,
    Image,
    Laptop,
    Moon,
    MoreVertical,
    Plus,
    Settings,
    SunMedium,
    Trash,
    X,
  } from "lucide-react"
  
  export const Icons = {
    logo: ({ ...props }) => (
      <svg
        width="24"
        height="24"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <rect width="32" height="32" rx="8" fill="currentColor"/>
        <path 
          d="M22.667 12.667v8a2 2 0 01-2 2H11.333a2 2 0 01-2-2v-8m13.334 0H9.333m13.334 0l-1.334-2.667H10.667L9.333 12.667m6.667 4v3m0-3l-2-2m2 2l2-2" 
          stroke="white" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    ),
    spinner: Loader2,
    login: LogIn,
    mail: Mail,
    gitHub: Github,
    trash: Trash2,
    user: User,
    key: Key,
    warning: AlertTriangle,
    arrowRight: ArrowRight,
    check: Check,
    chevronLeft: ChevronLeft,
    chevronRight: ChevronRight,
    creditCard: CreditCard,
    file: File,
    fileText: FileText,
    help: HelpCircle,
    image: Image,
    laptop: Laptop,
    moon: Moon,
    more: MoreVertical,
    plus: Plus,
    settings: Settings,
    sun: SunMedium,
    close: X,
  }