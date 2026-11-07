import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "@/lib/format";

// A member's photo, or their initials until a photo loads (or if they haven't added one).
export function MemberAvatar({
  name,
  src,
  className,
  fallbackClassName,
  children,
}: {
  name: string | null | undefined;
  src?: string | null;
  className?: string;
  fallbackClassName?: string;
  children?: React.ReactNode;
}) {
  return (
    <Avatar className={className}>
      {src ? <AvatarImage src={src} alt="" /> : null}
      <AvatarFallback className={fallbackClassName}>{children ?? initials(name)}</AvatarFallback>
    </Avatar>
  );
}
