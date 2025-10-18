'use server'

import { connectToDB } from "../mongoose"
import User from "../models/user.model";
import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import { FilterQuery, SortOrder } from "mongoose";

interface Props {
    userId: string,
    username: string,
    name: string,
    bio: string,
    image: string,
    path: string,

}

interface FetchUsersProps {
    userId: string,
    searchString?: string,
    pageNumber?: number,
    pageSize?: number,
    sortBy?: SortOrder
}

export async function updateUser({
    userId,
    username,
    name,
    bio,
    image,
    path
}: Props): Promise<void> {
    connectToDB();

    try {
        await User.findOneAndUpdate(
            { id: userId },
            {
                username: username.toLowerCase(),
                name,
                bio,
                image,
                onboarded: true,
            },
            { upsert: true }
        )

        if (path === '/profile/edit') {
            revalidatePath(path)
        }

    } catch (error: any) {
        throw new Error(`Failed to create/update user: ${error.message}`)
    }
}

export async function fetchUser(userId: string) {
    try {
        connectToDB()

        return await User.findOne({ id: userId })
    } catch (error: any) {
        throw new Error(`Faild to fetch user: ${error.message}`)
    }
}

export async function fetchUserPosts(userId: string) {
    try {
        connectToDB()

        const threads = await User.findOne({ id: userId })
            .populate({
                path: 'threads',
                model: Thread,
                populate: {
                    path: 'children',
                    model: Thread,
                    populate: {
                        path: 'author',
                        model: User,
                        select: 'name image id'
                    }
                }
            })

        return threads;
    } catch (error: any) {
        throw new Error(`failed to fetch user posts: ${error.message}`)
    }
}

export async function fetchUsers({
    userId,
    searchString = "",
    pageNumber = 1,
    pageSize = 20,
    sortBy = 'desc'
}: FetchUsersProps) {
    try {
        connectToDB()

        const skipAmount = (pageNumber - 1) * pageSize;

        const regex = new RegExp(searchString, "i");

        const query: FilterQuery<typeof User> = {
            id: { $ne: userId }
        }

        if (searchString.trim() !== '') {
            query.$or = [
                {
                    username: { $regex: regex }
                },
                {
                    name: { $regex: regex }
                }
            ]
        }

        const sortOptions = { createdAt: sortBy }

        const usersQuery = User.find(query)
            .sort(sortOptions)
            .skip(skipAmount)
            .limit(pageSize)

        const totalUsersCount = await User.countDocuments(query)

        const user = await usersQuery.exec()

        const isNext = totalUsersCount > skipAmount + user.length

        return { user, isNext }
    } catch (error: any) {
        throw new Error(`failed to fetch users: ${error.message}`)
    }
}

export async function getActivity(userId: string) {
    try {
        connectToDB()

        const userThreads = await Thread.find({ author: userId })

        const childThreadId = userThreads.reduce((acc, userThreads) => {
            return acc.concat(userThreads.children)
        }, [])

        const replies = await Thread.find({
            _id: { $in: childThreadId },
            author: { $ne: userId }
        }).populate({
            path: "author",
            model: User,
            select: "name image _id"
        })

        return replies
    } catch (error) {
        console.error("Error fetching replies: ", error);
        throw error;
    }
}