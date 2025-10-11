import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { OrganizationSwitcher, SignInButton, SignOutButton } from '@clerk/nextjs'

const Topbar = () => {
    return (
        <nav className='topbar'>
            <Link href="/" className='flex items-center gap-4'>
                <Image src="./logo.svg" alt='logo' width={28} height={28} />
                <p className='text-heading3-bold text-light-1 max-xs:hidden'>Threads</p>
            </Link>

            <div className='flex items-center gap-1'>
                <div className='block md:hidden'>
                    <SignInButton>
                        <SignOutButton>
                            <div className='flex cursor-pointer'>
                                <Image src="./logout.svg" alt='logout' width={24} height={24} />
                            </div>
                        </SignOutButton>
                    </SignInButton>
                </div>

                <OrganizationSwitcher
                    appearance={{
                        elements: {
                            organizationSwitcherTrigger: " py-2 px-4", // tombol utama
                            organizationPreviewAvatarBox: "w-9 h-9", // ⬅️ ini gedein logonya
                            organizationPreviewAvatarImage: "w-9 h-9", // biar pas juga

                        }
                    }}
                />
            </div>
        </nav>
    )
}

export default Topbar