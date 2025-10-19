import React from 'react'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

import { fetchUser } from '@/lib/actions/user.actions'
import AccountProfile from '@/components/forms/AccountProfile'


const page = async () => {
    const user = await currentUser()
    if (!user) return null;

    const userInfo = await fetchUser(user.id);
    if (!userInfo?.onboarded) redirect("/onboarding");

    const userData = {
        id: user.id,
        objectId: userInfo._id,
        username: userInfo ? userInfo?.username : user.username,
        name: userInfo ? userInfo?.name : user.firstName ?? "",
        bio: userInfo ? userInfo?.bio : "",
        image: userInfo ? userInfo?.image : user.imageUrl,
    }

    return (
        <div>
            <h1 className='head-text'>Edit Profile</h1>
            <p className='mt-3 text-base-regular text-light-2'>Make any changes</p>

            <section className='mt-12'> 
                <AccountProfile user={JSON.parse(JSON.stringify(userData))} btnTitle='Continue' />
            </section>
        </div>
    )
}

export default page