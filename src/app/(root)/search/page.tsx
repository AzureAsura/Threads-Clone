import React from 'react'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { fetchUsers, fetchUser } from '@/lib/actions/user.actions'
import UserCard from '@/components/cards/UserCard'


const page = async () => {
    const user = await currentUser()

    if (!user) return null;

    const userInfo = await fetchUser(user.id)
    if (!userInfo?.onboarded) redirect('/onboarding')

    const result = await fetchUsers({
        userId: user.id,
        searchString: '',
        pageNumber: 1,
        pageSize: 25
    })

    return (
        <div>
            <h1 className='head-text mb-10'>Search</h1>

            <div className='mt-14 flex flex-col gap-9'>
                {result.user.length === 0 ? (
                    <p className='no-result'>No Users</p>
                ) : (
                    <>
                        {result.user.map((person) => (
                            <UserCard 
                                key={person.id}
                                id={person.id}
                                name={person.name}
                                username={person.username}
                                imgUrl={person.image}
                                personType='User'
                            />
                        ))}
                    </>
                )}
            </div>  
        </div>
    )
}

export default page