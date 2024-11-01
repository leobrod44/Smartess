import { Fragment } from 'react';
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

export interface UnitData {
  unitNumber: string;
}

export interface Project {
  projectId: string;
  address: string;
  units: UnitData[];
  adminUsers: number;
  hubUsers: number;
  pendingTickets: number;
}

interface AddressDropdownProps {
  projects: Project[];
  selectedProjectId: string;
  onProjectChange: (projectId: string) => void;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const AddressDropdown: React.FC<AddressDropdownProps> = ({
  projects,
  selectedProjectId,
  onProjectChange,
}) => (
  <Menu
    as='div'
    className='relative inline-block text-left w-full'
  >
    <div>
      <MenuButton className='inline-flex w-full justify-between items-center gap-x-1.5 rounded-md bg-[#254752] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#3b5c6b]'>
        {projects.find((project) => project.projectId === selectedProjectId)
          ?.address || 'ALL PROJECTS'}
        <ChevronDownIcon
          className='-mr-1 h-5 w-5 text-gray-400'
          aria-hidden='true'
        />
      </MenuButton>
    </div>

    <Transition
      as={Fragment}
      enter='transition ease-out duration-100'
      enterFrom='transform opacity-0 scale-95'
      enterTo='transform opacity-100 scale-100'
      leave='transition ease-in duration-75'
      leaveFrom='transform opacity-100 scale-100'
      leaveTo='transform opacity-0 scale-95'
    >
      <MenuItems className='absolute right-0 z-10 mt-2 w-full origin-top-right rounded-md bg-white shadow-lg focus:outline-none'>
        <div className='py-1'>
          {projects.map((project) => (
            <MenuItem key={project.projectId}>
              {({ active }) => (
                <button
                  onClick={() => onProjectChange(project.projectId)}
                  className={classNames(
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                    'block w-full text-left px-4 py-2 text-sm'
                  )}
                >
                  {project.address}
                </button>
              )}
            </MenuItem>
          ))}
        </div>
      </MenuItems>
    </Transition>
  </Menu>
);

export default AddressDropdown;
