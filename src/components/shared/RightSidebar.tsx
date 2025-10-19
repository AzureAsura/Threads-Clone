import React from 'react'
import { fetchUsers } from '@/lib/actions/user.actions'
import { fetchCommunities } from '@/lib/actions/community.actions'
import { currentUser } from '@clerk/nextjs/server'
import UserCard from '../cards/UserCard'

const RightSidebar = async () => {
  const user = await currentUser()
  if(!user) return null

  const similarMinds = await fetchUsers({
    userId: user.id,
    pageSize: 4,
  })

  const suggestedCommunity = await fetchCommunities({
    pageSize: 4,
  })

  return (
    <section className='custom-scrollbar rightsidebar'>
      <div className='flex flex-1 flex-col justify-start'>
        <h3 className='text-heading4-medium text-light-1'>Suggested Users</h3>

        <div className='mt-7 flex w-[350px] flex-col gap-10'>
            {similarMinds.user.length > 0 ? (
              <>
                {similarMinds.user.map((person) => (
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
            ) : (
              <p className='!text-base-regular text-light-3'>No user yet</p>
            )}
        </div>
      </div>

      <div className='flex flex-1 flex-col justify-start'>
        <h3 className='text-heading4-medium text-light-1'>Suggested Communities</h3>


        <div className='mt-7 flex w-[350px] flex-col gap-9'>
            {suggestedCommunity.communities.length > 0 ? (
              <>
                {suggestedCommunity.communities.map((community) => (
                  <UserCard 
                    key={community.id}
                    id={community.id}
                    name={community.name}
                    username={community.username}
                    imgUrl={community.image}
                    personType='Community'
                  />
                ))}
              </>
            ) : (
              <p className='!text-base-regular text-light-3'>No communities yet</p>
            )}
        </div>
      </div>
    </section>
  )
}

export default RightSidebar