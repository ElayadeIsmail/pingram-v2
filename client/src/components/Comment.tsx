import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { RegularCommentFragment } from '../generated/graphql';

interface CommentProps {
  comment: RegularCommentFragment;
}

export const Comment: React.FC<CommentProps> = ({ comment }) => {
  return (
    <div className='flex mb-2'>
      <Link href={`/profile/${comment.users.id}`}>
        <div className='mr-2 cursor-pointer'>
          <Image
            src={comment.users.avatar!}
            width={45}
            height={45}
            className='rounded-full object-center object-cover'
          />
        </div>
      </Link>
      <div className='flex-1 flex flex-col p-2 rounded-md bg-gray-300'>
        <Link href={`/profile/${comment.users.id}`}>
          <span className='text-blue-700 font-semibold text-md mb-1 cursor-pointer'>
            {comment.users.username}
          </span>
        </Link>
        <p className='text-gray-800'>{comment.contents}</p>
      </div>
    </div>
  );
};
