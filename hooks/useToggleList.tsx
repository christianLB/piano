import { useState } from "react";

const useToggleList = (initialState: string[] = []) => {
  const [list, setList] = useState<string[]>(initialState);

  const isAllSelected = (groupItems: string[]) => {
    if (!Array.isArray(groupItems)) {
      console.error("groupItems debe ser un array");
      return false;
    }
    return groupItems.every((itemId) => list.includes(itemId));
  };

  const toggleItem = (itemId: string) => {
    setList((prevList) => {
      if (prevList.includes(itemId)) {
        return prevList.filter((id) => id !== itemId);
      }
      return [...prevList, itemId];
    });
  };

  const toggleAll = (groupItems: string[]) => {
    setList((prevList) => {
      if (isAllSelected(groupItems)) {
        return prevList.filter((id) => !groupItems.includes(id));
      }
      return [...prevList, ...groupItems];
    });
  };

  return { list, isAllSelected, toggleItem, toggleAll };
};

export default useToggleList;
