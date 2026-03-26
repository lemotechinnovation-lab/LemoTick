import { ReactNode, useState } from 'react';

interface SidebarLinkGroupProps {
  children: (handleClick: () => void, open: boolean) => ReactNode;
  activecondition?: boolean;
}

function SidebarLinkGroup({
  children,
  activecondition = false,
}: SidebarLinkGroupProps) {

  const [open, setOpen] = useState(activecondition);

  const handleClick = () => {
    setOpen(!open);
  }

  return (
    <li className={`px-3 py-1.5 rounded-lg bg-linear-to-r ${activecondition && 'from-[#2F6BFF]/[0.12] dark:from-[#2F6BFF]/[0.24] to-[#2F6BFF]/[0.04]'}`}>
      {children(handleClick, open)}
    </li>
  );
}

export default SidebarLinkGroup;