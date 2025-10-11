'use client'

import Link from 'next/link'
import React from 'react'
import { sidebarLinks } from '../../constants/index.js'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import clsx from 'clsx'
import { SignInButton, SignOutButton } from '@clerk/nextjs'

const LeftSidebar = () => {
    const router = useRouter();
    const pathname = usePathname()

    return (
        <section className='custom-scrollbar leftsidebar'>
            <div className='flex w-full flex-1 flex-col gap-6 px-6'>
                {sidebarLinks.map((links) => {

                    const isActive = (pathname.includes(links.route) && links.route.length > 1) || pathname === links.route;

                    return (
                        <Link href={links.route} key={links.label}
                            className={clsx('leftsidebar_link', isActive && 'bg-primary-500')}
                        >
                            <Image
                                src={links.imgURL}
                                alt={links.label}
                                width={24}
                                height={24}
                            />

                            <p className='text-light-1 max-lg:hidden'>{links.label}</p>
                        </Link>
                    )
                })}
            </div>

            <div className='mt-10 px-6'>
                <SignInButton>
                    <SignOutButton redirectUrl="/sign-in">
                        <div className='flex cursor-pointer gap-4 p-4'>
                            <Image src="./logout.svg" alt='logout' width={24} height={24} />

                            <p className='text-light-2 max-lg:hidden'>Logout</p>
                        </div>
                    </SignOutButton>
                </SignInButton>
            </div>
        </section>
    )
}

export default LeftSidebar