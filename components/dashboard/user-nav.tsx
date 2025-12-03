"use client"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOutAction } from "@/app/actions/user"

interface UserNavProps {
    user: {
        name?: string | null
        email?: string | null
        image?: string | null
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dictionary?: any
}

export function UserNav({ user, dictionary }: UserNavProps) {
    const t = dictionary?.dashboard?.header || {
        profile: "Profile",
        settings: "Settings",
        logout: "Log out"
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full" suppressHydrationWarning>
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.image || ""} alt={user.name || ""} />
                        <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem>
                        {t.profile}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        {t.settings}
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOutAction()}>
                    {t.logout}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
