import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/components/ui/command';
import { getNavigationLabel } from '@/lib/navigation/labels';
import { useNavigationByGroup } from '@/lib/navigation/useNavigation';
import type { NavigationGroup, NavigationItem } from '@/lib/navigation/types';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const groupLabels: Record<NavigationGroup, string> = {
  public: 'Публичные страницы',
  main: 'Основное',
  community: 'Сообщество',
  leadership: 'Лидерство',
};

const groupOrder: NavigationGroup[] = ['main', 'community', 'leadership', 'public'];

function getSearchValue(item: NavigationItem): string {
  return [getNavigationLabel(item), item.labelKey, item.path].join(' ');
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const groupedItems = useNavigationByGroup();

  const visibleGroups = useMemo(
    () => groupOrder.filter((group) => groupedItems[group].length > 0),
    [groupedItems],
  );

  if (!open) return null;

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Быстрый переход"
      description="Найдите раздел Mentori Club и перейдите к нему без лишних шагов."
      className="max-w-xl rounded-2xl border shadow-2xl"
      showCloseButton={false}
    >
      <CommandInput
        placeholder="Найти раздел или действие..."
        className="cursor-default outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0"
      />
      <CommandList className="max-h-[420px]">
        <CommandEmpty>Ничего не найдено</CommandEmpty>
        {visibleGroups.map((group) => (
          <CommandGroup key={group} heading={groupLabels[group]}>
            {groupedItems[group].map((item) => {
              const Icon = item.icon;
              const label = getNavigationLabel(item);

              return (
                <CommandItem
                  key={item.id}
                  value={getSearchValue(item)}
                  onSelect={() => {
                    navigate(item.path);
                    onOpenChange(false);
                  }}
                >
                  <Icon className="size-4" />
                  <span className="flex-1">{label}</span>
                  {item.shortcut ? <CommandShortcut>⌘{item.shortcut}</CommandShortcut> : null}
                  <ArrowRight className="size-4 opacity-50" />
                </CommandItem>
              );
            })}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
