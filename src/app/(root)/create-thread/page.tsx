import React from 'react'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { fetchUser } from '@/lib/actions/user.actions'

const page = async () => {
    const user = await currentUser()

    if(!user ) return null;

    const userInfo = await fetchUser(user.id)

    if(!userInfo?.onboarded) redirect('/onboarding')

  return (
    <h1 className='head-text'>Create Threads</h1>
  )
}

export default page