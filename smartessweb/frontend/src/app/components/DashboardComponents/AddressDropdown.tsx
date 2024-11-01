import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid';

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
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className='w-full'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='inline-flex w-full justify-between items-center gap-x-1.5 rounded-md bg-[#254752] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#3b5c6b]'
      >
        {projects.find((project) => project.projectId === selectedProjectId)
          ?.address || 'ALL PROJECTS'}
        {isOpen ? (
          <ChevronUpIcon
            className='-mr-1 h-5 w-5 text-gray-400'
            aria-hidden='true'
          />
        ) : (
          <ChevronDownIcon
            className='-mr-1 h-5 w-5 text-gray-400'
            aria-hidden='true'
          />
        )}
      </button>

      {isOpen && (
        <div className='mt-2 max-h-60 overflow-y-auto rounded-md bg-white shadow-lg'>
          <div className='py-1'>
            {projects.map((project) => (
              <button
                key={project.projectId}
                onClick={() => {
                  onProjectChange(project.projectId);
                  setIsOpen(false);
                }}
                className={classNames(
                  selectedProjectId === project.projectId
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900',
                  'block w-full text-left px-4 py-2 text-sm'
                )}
              >
                {project.address}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressDropdown;
