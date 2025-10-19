'use server'

import { revalidatePath } from "next/cache"
import Thread from "../models/thread.model"
import User from "../models/user.model"
import { connectToDB } from "../mongoose"
import path from "path"
import { comment } from "postcss"
import Community from "../models/community.model"

interface Params {
    text: string,
    author: string,
    communityId: string | null,
    path: string,
}

export async function createThread({
    text,
    author,
    communityId,
    path,
}: Params) {
    try {
        connectToDB()


        const communityIdObject = await Community.findOne(
            { id: communityId },
            { _id: 1 }
        );

        const createThread = await Thread.create({
            text,
            author,
            community: communityIdObject,

        })

        await User.findByIdAndUpdate(author, { $push: { threads: createThread._id } })

        if (communityIdObject) {
            await Community.findByIdAndUpdate(communityIdObject, {
                $push: { threads: createThread._id }
            })
        }

        revalidatePath(path)

    } catch (error: any) {
        throw new Error(`Error creating thread ${error.message}`)
    }
}



export async function fetchPost(pageNumber = 1, pageSize = 20) {
    connectToDB()

    const skipAmount = (pageNumber - 1) * pageSize;

    const postQuery = Thread.find({ parentId: { $in: [null, undefined] } })
        .sort({ createdAt: 'desc' })
        .skip(skipAmount)
        .limit(pageSize)
        .populate({ path: 'author', model: User })
        .populate({
            path: 'children',
            populate: {
                path: 'author',
                model: User,
                select: "_id name parentId image"
            }
        })

    const totalPostsCount = await Thread.countDocuments({ parentId: { $in: [null, undefined] } })

    const post = await postQuery.exec()

    const isNext = totalPostsCount > skipAmount + post.length;

    return { post, isNext }
}



export async function fetchThreadById(id: string) {
    connectToDB()

    try {
        const thread = await Thread.findById(id)
            .populate({
                path: 'author',
                model: User,
                select: "_id id name image"
            })
            .populate({
                path: "community",
                model: Community,
                select: "_id id name image",
            })
            .populate({
                path: 'children',
                populate: [
                    {
                        path: 'author',
                        model: User,
                        select: "_id id name parentId image"
                    },
                    {
                        path: 'children',
                        model: Thread,
                        populate: {
                            path: 'author',
                            model: User,
                            select: "_id id name parentId image"
                        }
                    },
                ]
            }).exec()

        return thread
    } catch (error: any) {
        throw new Error(`Error fetching thread: ${error.message}`)
    }
}

export async function addCommentToThread(
    threadId: string,
    commentText: string,
    userId: string,
    path: string,
) {
    connectToDB()


    const originalThread = await Thread.findById(threadId)

    if (!originalThread) {
        throw new Error("Thread not found")
    }

    const commentThread = new Thread({
        text: commentText,
        author: userId,
        parentId: threadId
    })

    const savedCommentThread = await commentThread.save()

    originalThread.children.push(savedCommentThread._id)

    await originalThread.save()

    revalidatePath(path)

    try {

    } catch (error: any) {
        throw new Error(`Error adding comment to thread: ${error.message}`)
    }

}

export async function fetchAllChildThreads(threadId: string): Promise<any[]> {
    const childThreads = await Thread.find({ parentId: threadId });

    const descendantThreads = [];
    for (const childThread of childThreads) {
        const descendants = await fetchAllChildThreads(childThread._id);
        descendantThreads.push(childThread, ...descendants);
    }

    return descendantThreads;
}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
    connectToDB();

    // Calculate the number of posts to skip based on the page number and page size.
    const skipAmount = (pageNumber - 1) * pageSize;

    // Create a query to fetch the posts that have no parent (top-level threads) (a thread that is not a comment/reply).
    const postsQuery = Thread.find({ parentId: { $in: [null, undefined] } })
        .sort({ createdAt: "desc" })
        .skip(skipAmount)
        .limit(pageSize)
        .populate({
            path: "author",
            model: User,
        })
        .populate({
            path: "community",
            model: Community,
        })
        .populate({
            path: "children", // Populate the children field
            populate: {
                path: "author", // Populate the author field within children
                model: User,
                select: "_id name parentId image", // Select only _id and username fields of the author
            },
        });

    // Count the total number of top-level posts (threads) i.e., threads that are not comments.
    const totalPostsCount = await Thread.countDocuments({
        parentId: { $in: [null, undefined] },
    }); // Get the total count of posts

    const posts = await postsQuery.exec();

    const isNext = totalPostsCount > skipAmount + posts.length;

    return { posts, isNext };
}

export async function deleteThread(id: string, path: string): Promise<void> {
  try {
    connectToDB();

    const mainThread = await Thread.findById(id).populate('author community');

    if (!mainThread) {
      throw new Error("Thread not found");
    }

    // Ambil semua reply/thread anak
    const descendantThreads = await fetchAllChildThreads(id);

    // Kumpulin semua ID thread yang mau dihapus (parent + child)
    const descendantsThreadsIds = [
      id,
      ...descendantThreads.map((thread) => thread._id.toString())
    ];

    // Kumpulin ID author unik
    const uniqueAuthorIds = Array.from(
      new Set([
        mainThread.author?._id?.toString(),
        ...descendantThreads.map((thread) => thread.author?._id?.toString())
      ])
    ).filter(Boolean);

    // Kumpulin ID community unik
    const uniqueCommunityIds = Array.from(
      new Set([
        mainThread.community?._id?.toString(),
        ...descendantThreads.map((thread) => thread.community?._id?.toString())
      ])
    ).filter(Boolean);

    // HAPUS THREAD DI DB
    await Thread.deleteMany({ _id: { $in: descendantsThreadsIds } });

    // UPDATE USER (hapus thread dari profil user)
    await User.updateMany(
      { _id: { $in: uniqueAuthorIds } },
      { $pull: { threads: { $in: descendantsThreadsIds } } }
    );

    // UPDATE COMMUNITY (hapus thread dari komunitas)
    await Community.updateMany(
      { _id: { $in: uniqueCommunityIds } },
      { $pull: { threads: { $in: descendantsThreadsIds } } }
    );

    // REFRESH UI
    revalidatePath(path);
  } catch (error: any) {
    console.error("DELETE ERROR:", error);
    throw new Error(`Failed to delete thread: ${error.message}`);
  }
}
