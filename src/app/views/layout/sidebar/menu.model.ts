
export interface MenuItem {
    id?: number;
    label?: string;
    icon?: string;
    link?: string;
    expanded?: boolean;
    submenu?: any;
    isTitle?: boolean;
    badge?: any;
    parentId?: number;
    aclName: string;
  }

