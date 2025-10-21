import { Fragment, useState } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon, XMarkIcon } from '@heroicons/react/20/solid';

export default function UserPicker({ value, options, onSelect }) {
  const [selected, setSelected] = useState(value);
  const [query, setQuery] = useState('');

  const filteredPeople = query === ''
    ? options.filter(person => !selected.find(s => s.id === person.id))
    : options.filter((person) =>
        person.name.toLowerCase().replace(/\s+/g, '')
          .includes(query.toLowerCase().replace(/\s+/g, '')) &&
        !selected.find(s => s.id === person.id)
      );

  const onSelected = (person) => {
    const newSelected = [...selected, person];
    setSelected(newSelected);
    onSelect(newSelected);
    setQuery(''); // Clear input after selection
  };

  const removeUser = (userId) => {
    const newSelected = selected.filter(user => user.id !== userId);
    setSelected(newSelected);
    onSelect(newSelected);
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Combobox value={null} onChange={onSelected}>
          <div className="relative">
            <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-gray-700 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 sm:text-sm">
              <Combobox.Input
                className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-white bg-gray-700 focus:ring-0"
                displayValue={() => query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Select users..."
              />
              <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </Combobox.Button>
            </div>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-10">
                {filteredPeople.length === 0 ? (
                  <div className="relative cursor-default select-none px-4 py-2 text-gray-400">
                    Nothing found.
                  </div>
                ) : (
                  filteredPeople.map((person) => (
                    <Combobox.Option
                      key={person.id}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                          active ? 'bg-gray-600 text-white' : 'text-gray-200'
                        }`
                      }
                      value={person}
                    >
                      {({ selected, active }) => (
                        <>
                          <span className={`block truncate`}>
                            {person.name}
                          </span>
                        </>
                      )}
                    </Combobox.Option>
                  ))
                )}
              </Combobox.Options>
            </Transition>
          </div>
        </Combobox>
      </div>

      {/* Selected Users Tags */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((person) => (
            <div
              key={person.id}
              className="bg-gray-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
            >
              <span>{person.name}</span>
              <button
                type="button"
                onClick={() => removeUser(person.id)}
                className="hover:text-gray-300"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

