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
    <li>
      {children(handleClick, open)}
    </li>
  );
}

export default SidebarLinkGroup;