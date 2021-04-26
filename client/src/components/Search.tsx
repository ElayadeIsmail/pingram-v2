import { resetIdCounter, useCombobox } from 'downshift';
import debounce from 'lodash.debounce';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React from 'react';
import { useSearchUsersLazyQuery } from '../generated/graphql';
import { Pulse } from './Pulse';

export const Search: React.FC = ({}) => {
  const router = useRouter();
  const [searchUsers, { data, loading }] = useSearchUsersLazyQuery({
    fetchPolicy: 'no-cache',
  });
  const users = data?.searchUsers || [];
  const searchUsersButChill = debounce(searchUsers, 350);
  resetIdCounter();

  const {
    isOpen,
    inputValue,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    getItemProps,
    highlightedIndex,
    closeMenu,
  } = useCombobox({
    items: users,
    onInputValueChange() {
      if (inputValue.trim() === '') {
        closeMenu();
        return;
      }
      searchUsersButChill({
        variables: {
          searchTerm: inputValue,
        },
      });
    },
    onSelectedItemChange({ selectedItem }) {
      router.push({
        pathname: `/profile/${selectedItem?.id}`,
      });
    },
    itemToString: (user) => user?.username || '',
  });

  return (
    <div className='relative w-64 flex items-center'>
      <div className='w-full' {...getComboboxProps()}>
        <input
          {...getInputProps({
            type: 'search',
            placeholder: 'Search for a user',
            id: 'search',
            className: `py-2 px-4 w-full bg-gray-100 
      focus:outline-none border-2 rounded-md focus:border-blue-500`,
          })}
        />
      </div>
      <div
        className='absolute bg-white z-10 top-full left-0 w-full flex flex-col'
        {...getMenuProps()}
      >
        {isOpen && loading && <Pulse />}
        {isOpen &&
          users.map((user, index) => (
            <div
              key={user.id}
              {...getItemProps({ item: user, index })}
              className={`flex cursor-pointer items-center p-2 border-b-2 border-gray-200 ${
                index === highlightedIndex ? 'bg-gray-300' : 'bg-white'
              }`}
            >
              <Image
                src={user.avatar!}
                width={45}
                height={45}
                className='rounded-full object-center object-cover'
              />
              <span className='ml-2 text-base font-semibold text-gray-700'>
                {user.username}
              </span>
            </div>
          ))}
        {isOpen && !users.length && !loading && inputValue.trim() !== '' && (
          <div className='flex items-center p-4 border-b-2 border-gray-200'>
            Sorry, No user Found For {inputValue}
          </div>
        )}
      </div>
    </div>
  );
};
